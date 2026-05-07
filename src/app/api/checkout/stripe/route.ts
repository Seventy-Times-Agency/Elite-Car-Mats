import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { createCheckoutSession } from "@/lib/payments/stripe-checkout";
import { signOrderToken, verifyOrderToken } from "@/lib/security/order-token";
import { calculateItemUnitPrice } from "@/lib/pricing";
import { loadPriceOverrides } from "@/lib/pricing-overrides";
import type { MatSetType } from "@/types";

const schema = z.object({
  orderId: z.string().min(1),
  /** HMAC token issued at order creation. Required so an attacker who
   *  guessed an orderId cannot create Stripe sessions for someone else. */
  orderToken: z.string().min(1),
  locale: z.enum(["ru", "en", "uk"]).optional().default("en"),
});

const LOCALE_MAP: Record<string, Stripe.Checkout.SessionCreateParams.Locale> = {
  ru: "ru",
  en: "en",
  uk: "auto", // Stripe Checkout has no `uk` locale yet
};

const matSetFromEnum: Record<string, MatSetType> = {
  FRONT: "front",
  FULL: "full",
  CARGO: "cargo",
  FULL_CARGO: "full-cargo",
};

/**
 * Starts a Stripe Checkout session for an already-created order.
 *
 * Auth: requires the order's HMAC token (issued at /api/orders create time)
 * — without it, this endpoint is an IDOR (anyone with an orderId could
 * spawn a Stripe session for someone else's order).
 *
 * Pricing: re-derives line item prices from the server-side `pricing.ts`
 * helper. The DB row's `price` column is treated as advisory only — if a
 * future bug allowed it to be tampered with, Stripe would still get the
 * canonical price.
 *
 * Discount: if the order's `total` is below the recomputed subtotal we
 * issue a one-shot Stripe coupon for the difference so the displayed
 * total on Stripe matches the DB.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const limit = await rateLimit(`stripe:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { orderId, orderToken, locale } = parsed.data;

  if (!verifyOrderToken(orderId, orderToken)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { model: { include: { brand: true } } } },
          color: true,
          edgeColor: true,
          badge: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Recompute unit prices from authoritative sources (matSet enum + edge
  // color id + badge presence). Never trust the DB-stored price column —
  // if it ever drifts, we want Stripe to charge the correct number.
  // Admin price overrides feed in here too — same DB the order route
  // used at creation, so checkout total matches the order total even
  // if admin changed prices in between.
  const overrides = await loadPriceOverrides();
  const items = order.items.map((i) => {
    const matSet = matSetFromEnum[i.product.matSet] ?? "full";
    const unitPriceUsd = calculateItemUnitPrice(
      {
        matSet,
        modelId: i.product.modelId,
        edgeColor: { id: i.edgeColor.id },
        badge: i.badge ? { id: i.badge.id } : null,
      },
      overrides,
    );
    const brandName = i.product.model.brand.name;
    const modelName = i.product.model.name;
    const descBits = [i.color.name, i.edgeColor.name];
    if (i.badge) descBits.push(`+ ${i.badge.brandName} badge`);
    return {
      name: `${brandName} ${modelName}`,
      description: descBits.join(" / "),
      unitPriceUsd,
      quantity: i.quantity,
    };
  });

  const recomputedSubtotal = items.reduce(
    (s, it) => s + it.unitPriceUsd * it.quantity,
    0,
  );
  const dbTotal = Number(order.total ?? 0);
  // Difference between subtotal and stored total is the promo discount.
  const discountUsd = Math.max(0, recomputedSubtotal - dbTotal);

  try {
    const session = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.email,
      items,
      discountUsd,
      orderToken: signOrderToken(order.id),
      locale: LOCALE_MAP[locale] ?? "auto",
    });

    if (!session) {
      return NextResponse.json(
        { error: "Payments are not configured" },
        { status: 503 },
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe-checkout:error]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 502 },
    );
  }
}
