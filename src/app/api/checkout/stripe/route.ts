import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isStripeConfigured } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/stripe-checkout";

const schema = z.object({
  orderId: z.string().min(1),
  locale: z.enum(["ru", "en", "uk"]).optional().default("en"),
});

// Stripe Checkout supports a fixed list of locales; Ukrainian is not one of
// them as of the current Stripe API, so we fall back to `auto` there (which
// will negotiate from the browser's Accept-Language header).
const LOCALE_MAP: Record<string, Stripe.Checkout.SessionCreateParams.Locale> = {
  ru: "ru",
  en: "en",
  uk: "auto",
};

/**
 * Starts a Stripe Checkout session for an already-created order.
 *
 * Flow (when Stripe is configured):
 *   1. Client POSTs the new order via /api/orders (existing behaviour)
 *   2. Client POSTs { orderId, locale } here
 *   3. We look up the order + line items, build a Checkout session, return url
 *   4. Client does `window.location = url` to redirect to Stripe
 *   5. Stripe posts back to /api/webhooks/stripe with checkout.session.completed
 *
 * When Stripe is NOT configured we return 503 — the UI is expected to fall
 * back to the existing manual-confirm flow in that case.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`stripe:${ip}`);
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

  const { orderId, locale } = parsed.data;

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

  const items = order.items.map((i) => {
    const brandName = i.product?.model?.brand?.name ?? "Elite Car Mats";
    const modelName = i.product?.model?.name ?? "Custom set";
    const descBits = [i.color.name, i.edgeColor.name];
    if (i.badge) descBits.push(`+ ${i.badge.brandName} badge`);
    return {
      name: `${brandName} ${modelName}`,
      description: descBits.join(" / "),
      unitPriceUsd: Number(i.price ?? 0),
      quantity: i.quantity,
    };
  });

  try {
    const session = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.email,
      items,
      locale: LOCALE_MAP[locale] ?? "auto",
    });

    if (!session) {
      return NextResponse.json(
        { error: "Payments are not configured" },
        { status: 503 },
      );
    }

    // Persist the Stripe session id so we can reconcile later if the webhook
    // is delayed or missed.
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
