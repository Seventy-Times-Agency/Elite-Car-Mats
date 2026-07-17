import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isStripeConfigured, getStripe } from "@/lib/payments/stripe";
import { createCheckoutSession } from "@/lib/payments/stripe-checkout";
import { signOrderToken, verifyOrderToken } from "@/lib/security/order-token";
import { calculateItemUnitPrice } from "@/lib/pricing";
import { loadPriceOverrides } from "@/lib/pricing-overrides";
import { buildDbProfileResolver } from "@/lib/catalog-merge";
import { getDictionaryFor } from "@/i18n/getDictionary";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { makeT } from "@/i18n/dictionary";
import { localizeColor } from "@/i18n/labels";
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

  // Only PENDING orders may start a Checkout session. Without this guard a
  // CONFIRMED order could be paid a second time (the webhook's
  // status-guarded updateMany would ignore the duplicate payment but the
  // charge itself would still land), and a CANCELLED order could be paid
  // into the void.
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Order is no longer payable" },
      { status: 409 },
    );
  }

  // Recompute unit prices from authoritative sources (matSet enum + edge
  // color id + badge presence). Never trust the DB-stored price column —
  // if it ever drifts, we want Stripe to charge the correct number.
  // Admin price overrides feed in here too — same DB the order route
  // used at creation, so checkout total matches the order total even
  // if admin changed prices in between.
  const overrides = await loadPriceOverrides();
  // Profile via the merged catalog — findProfileByModelId alone can't see
  // admin custom models and would bill them at `standard` rates.
  const profileOf = await buildDbProfileResolver();
  // Color names are stored in their canonical Russian form — localize the
  // Stripe line-item descriptions so a US customer doesn't see "Чёрный /
  // Тёмно-синий" on the payment page.
  const tDesc = makeT(getDictionaryFor(locale), getDictionaryFor(DEFAULT_LOCALE));
  const items = order.items.map((i) => {
    const matSet = matSetFromEnum[i.product.matSet];
    if (!matSet) throw new Error(`Unknown matSet enum: ${i.product.matSet}`);
    const unitPriceUsd = calculateItemUnitPrice(
      {
        matSet,
        modelId: i.product.modelId,
        profile: profileOf(i.product.modelId),
        edgeColor: { id: i.edgeColor.id },
        badge: i.badge ? { id: i.badge.id } : null,
        badgeCount: i.badgeCount ?? 1,
        heelPad: i.heelPad ?? false,
        thirdRow: i.thirdRow ?? false,
      },
      overrides,
    );
    const brandName = i.product.model.brand.name;
    const modelName = i.product.model.name;
    const descBits = [
      localizeColor(tDesc, i.color.name),
      localizeColor(tDesc, i.edgeColor.name),
    ];
    if (i.badge) {
      const n = i.badgeCount ?? 1;
      descBits.push(`+ ${i.badge.brandName} badge${n > 1 ? ` ×${n}` : ""}`);
    }
    if (i.heelPad) descBits.push(`+ aluminum heel pad`);
    if (i.thirdRow) descBits.push(`+ ${tDesc("email.thirdRowSuffix")}`);
    const yearSuffix = i.year ? ` · ${i.year}` : "";
    return {
      name: `${brandName} ${modelName}${yearSuffix}`,
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
  // Clamped so the session total never drops below Stripe's $0.50 card
  // minimum — a 100%-off promo would otherwise make session creation
  // throw and lock the customer out of paying entirely.
  const discountUsd = Math.min(
    Math.max(0, recomputedSubtotal - dbTotal),
    Math.max(0, recomputedSubtotal - 0.5),
  );

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

    // Expire the superseded session AFTER the order row points at the new
    // one — both stay payable for up to 24h otherwise, and a customer with
    // two tabs could be charged twice. Done after the row update so the
    // `checkout.session.expired` webhook sees the session as superseded
    // (id mismatch) and does NOT cancel the still-payable order.
    const prevSessionId = order.stripeSessionId;
    if (prevSessionId && prevSessionId !== session.id) {
      after(async () => {
        try {
          const stripe = await getStripe();
          if (!stripe) return;
          const prev = await stripe.checkout.sessions.retrieve(prevSessionId);
          if (prev.status === "open") {
            await stripe.checkout.sessions.expire(prevSessionId);
          }
        } catch (err) {
          console.warn(
            `[stripe-checkout] failed to expire superseded session ${prevSessionId}:`,
            err,
          );
        }
      });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe-checkout:error]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 502 },
    );
  }
}
