import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isStripeConfigured, getStripe } from "@/lib/payments/stripe";
import { createCheckoutSession } from "@/lib/payments/stripe-checkout";
import { signOrderToken, verifyOrderToken } from "@/lib/security/order-token";
import { lineFromDb, lineUnitPrice } from "@/lib/orders/line-items";
import { getAccessoryPrice } from "@/lib/pricing";
import { accessoryView } from "@/lib/accessories/display";
import { loadPriceOverrides } from "@/lib/pricing-overrides";
import { buildDbProfileResolver } from "@/lib/catalog-merge";
import { getDictionaryFor } from "@/i18n/getDictionary";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { makeT } from "@/i18n/dictionary";
import { localizeColor } from "@/i18n/labels";
import { reportProblem } from "@/lib/ops/journal";
import { logOrderEvent } from "@/lib/orders/events";

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

/** Best-effort expiry of a Checkout session that must not stay payable. */
async function expireSessionSafely(sessionId: string): Promise<void> {
  try {
    const stripe = await getStripe();
    if (!stripe) return;
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s.status === "open") {
      await stripe.checkout.sessions.expire(sessionId);
    }
  } catch (err) {
    console.warn(
      `[stripe-checkout] failed to expire session ${sessionId}:`,
      err,
    );
  }
}

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

  try {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";
  const items = order.items.map((i) => {
    if (i.kind === "accessory" && i.accessorySlug && i.accessoryVariant) {
      const acc = accessoryView(tDesc, i.accessorySlug, i.accessoryVariant);
      return {
        name: acc.title,
        description: acc.variantLabel,
        unitPriceUsd: getAccessoryPrice(i.accessorySlug, overrides),
        quantity: i.quantity,
        images: acc.image ? [`${site}${acc.image}`] : undefined,
      };
    }
    if (!i.product) throw new Error(`Order item ${i.id} has no product`);
    const line = lineFromDb({ ...i, product: i.product }, profileOf);
    const unitPriceUsd = lineUnitPrice(line, overrides);
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
  // Shipping is part of the stored total but billed as Stripe's own
  // shipping line, so take it out before deriving the promo discount.
  // NULL = order from before paid shipping (shipped free).
  const shippingUsd = Number(order.shippingCost ?? 0);
  const dbTotal = Number(order.total ?? 0) - shippingUsd;
  // Difference between subtotal and stored total is the promo discount.
  // Clamped so the session total never drops below Stripe's $0.50 card
  // minimum — a 100%-off promo would otherwise make session creation
  // throw and lock the customer out of paying entirely.
  const discountUsd = Math.min(
    Math.max(0, recomputedSubtotal - dbTotal),
    Math.max(0, recomputedSubtotal - 0.5),
  );

    const session = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.email,
      items,
      discountUsd,
      shippingUsd,
      orderToken: signOrderToken(order.id),
      locale: LOCALE_MAP[locale] ?? "auto",
    });

    if (!session) {
      return NextResponse.json(
        { error: "Payments are not configured" },
        { status: 503 },
      );
    }

    // Point the order row at the new session atomically: guarded on the
    // status still being PENDING, and capturing the PREVIOUS session id
    // in the same statement. Two concurrent "Pay now" clicks would both
    // read the same stale previous id from the row loaded above — the
    // session created by the losing request would then never be expired
    // and stay payable for 24h (double-charge window). The row lock also
    // closes the race with the 24h `checkout.session.expired` webhook:
    // if it cancelled the order between our status check and this write,
    // zero rows match and we abort instead of handing the customer a
    // payable session for a CANCELLED order.
    const rows = await prisma.$queryRaw<{ prev: string | null }[]>`
      WITH prev AS (
        SELECT "stripeSessionId" AS id FROM "Order"
         WHERE "id" = ${order.id} FOR UPDATE
      )
      UPDATE "Order" o
         SET "stripeSessionId" = ${session.id}
        FROM prev
       WHERE o."id" = ${order.id} AND o."status" = 'PENDING'
       RETURNING prev.id AS prev
    `;

    if (rows.length === 0) {
      // Order flipped to CANCELLED/CONFIRMED mid-flight — kill the
      // session we just created so it can't be paid into the void.
      after(() => expireSessionSafely(session.id));
      return NextResponse.json(
        { error: "Order is no longer payable" },
        { status: 409 },
      );
    }

    // Expire the superseded session AFTER the order row points at the new
    // one — both stay payable for up to 24h otherwise, and a customer with
    // two tabs could be charged twice. Done after the row update so the
    // `checkout.session.expired` webhook sees the session as superseded
    // (id mismatch) and does NOT cancel the still-payable order.
    const prevSessionId = rows[0]?.prev ?? null;
    if (prevSessionId && prevSessionId !== session.id) {
      after(() => expireSessionSafely(prevSessionId));
    }

    await logOrderEvent(order.id, "checkout_opened", {
      amount: Number(order.total ?? 0),
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe-checkout:error]", err);
    await reportProblem({ area: "checkout.session", severity: "critical", error: err });
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 502 },
    );
  }
}
