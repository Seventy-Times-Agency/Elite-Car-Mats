import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import {
  isStripeConfigured,
  getWebhookSecret,
  getStripe,
} from "@/lib/payments/stripe";
import { constructWebhookEvent } from "@/lib/payments/stripe-checkout";
import { sendCustomerOrderEmail, sendOwnerOrderEmail } from "@/lib/email";
import { signOrderToken } from "@/lib/security/order-token";
import { calculateItemUnitPrice } from "@/lib/pricing";
import { loadPriceOverrides } from "@/lib/pricing-overrides";
import { buildDbProfileResolver } from "@/lib/catalog-merge";
import { pushOrderToShipstation } from "@/lib/shipping/shipstation";
import type { MatSetType } from "@/types";

// Webhooks must see the raw body for signature verification. In the App
// Router there is no body parser to disable — the route reads
// request.text() directly — but we still force the Node.js runtime and
// opt out of caching.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function orderIdFromSession(session: Stripe.Checkout.Session): string | null {
  return (
    session.client_reference_id ??
    (session.metadata?.orderId as string | undefined) ??
    null
  );
}

const matSetFromEnum: Record<string, MatSetType> = {
  FRONT: "front",
  FULL: "full",
  CARGO: "cargo",
  FULL_CARGO: "full-cargo",
};

/**
 * Process a Stripe event id idempotently. Returns true if this is the first
 * time we've seen the id and processing should proceed; false if it was
 * already handled. The "WebhookEvent" table is created lazily on first use
 * (the runtime DDL flow in db-setup.ts doesn't know about it yet because
 * it's a new table — we declare it via raw SQL here for safety).
 *
 * Throws on DB error so the caller responds 500 and Stripe retries — the
 * old behaviour of "fail open and run side effects anyway" would otherwise
 * race a second retry into duplicated emails and ShipStation pushes.
 */
async function claimEvent(eventId: string): Promise<boolean> {
  // Lazy table creation — re-runs are no-ops thanks to IF NOT EXISTS.
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "WebhookEvent" (
      "id" TEXT PRIMARY KEY,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  const inserted = await prisma.$executeRaw`
    INSERT INTO "WebhookEvent"("id") VALUES (${eventId})
    ON CONFLICT ("id") DO NOTHING
  `;
  return inserted === 1;
}

/**
 * Release a previously claimed event id so Stripe's retry can re-process
 * it. Called when the handler fails AFTER the claim succeeded — without
 * this, the retry would see "already processed" and the event (e.g. a
 * paid order's confirmation) would be lost forever.
 */
async function releaseEvent(eventId: string): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM "WebhookEvent" WHERE "id" = ${eventId}
    `;
  } catch (err) {
    // Claim stays — operator can reconcile from Stripe's event log.
    console.error(`[stripe-webhook] failed to release claim ${eventId}:`, err);
  }
}

/**
 * Give back one promo use when a PENDING order is cancelled before
 * payment (expired / failed Checkout session). The use was consumed
 * atomically at order creation; without the refund, limited codes leak
 * one use per abandoned checkout. GREATEST guards against going negative
 * if the code's counter was edited by an admin in between.
 */
async function refundPromoUse(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { promoCode: true },
    });
    if (!order?.promoCode) return;
    await prisma.$executeRaw`
      UPDATE "PromoCode"
         SET "usedCount" = GREATEST("usedCount" - 1, 0)
       WHERE "code" = ${order.promoCode}
    `;
  } catch (err) {
    console.error(
      `[stripe-webhook] promo refund failed for order=${orderId}:`,
      err,
    );
  }
}

/**
 * Push the order to ShipStation if the integration is enabled. Failures
 * are logged but never thrown — Stripe must always get its 200 OK so it
 * doesn't keep retrying. Missed pushes can be reconciled from the admin
 * UI later.
 */
async function pushToShipstationSafely(orderId: string): Promise<void> {
  try {
    const result = await pushOrderToShipstation(orderId);
    if (result.ok) {
      console.log(
        `[stripe-webhook] order=${orderId} pushed to shipstation id=${result.shipstationOrderId}`,
      );
    } else {
      console.log(
        `[stripe-webhook] order=${orderId} shipstation skip: ${result.reason}`,
      );
    }
  } catch (err) {
    console.error(
      `[stripe-webhook] shipstation push failed for order=${orderId}:`,
      err,
    );
  }
}

/**
 * Fetch the Stripe-hosted receipt URL for a paid order and store it on
 * the Order row — the customer's order page shows a "Payment receipt"
 * link. Best-effort: failures are logged, the payment flow never blocks.
 */
async function saveReceiptUrl(
  orderId: string,
  paymentIntentId: string | null,
): Promise<void> {
  if (!paymentIntentId) return;
  try {
    const stripe = await getStripe();
    if (!stripe) return;
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    const charge =
      typeof pi.latest_charge === "string" ? null : pi.latest_charge;
    const receiptUrl = charge?.receipt_url ?? null;
    if (receiptUrl) {
      await prisma.order.update({
        where: { id: orderId },
        data: { receiptUrl },
      });
    }
  } catch (err) {
    console.error(
      `[stripe-webhook] receipt url fetch failed for order=${orderId}:`,
      err,
    );
  }
}

async function sendOrderConfirmations(orderId: string): Promise<void> {
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
  if (!order) return;
  const overrides = await loadPriceOverrides();
  // Merged-catalog profile lookup — admin custom models would otherwise
  // fall back to `standard` pricing in the emailed unit prices.
  const profileOf = await buildDbProfileResolver();
  const emailData = {
    orderNumber: order.orderNumber,
    orderToken: signOrderToken(order.id),
    customerName: order.customerName,
    customerEmail: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    state: order.state,
    zip: order.zip,
    // Order.comment is now the customer's raw note only — the applied
    // promo code lives in Order.promoCode column.
    comment: order.comment,
    total: Number(order.total ?? 0),
    items: order.items.map((i) => {
      const matSet = matSetFromEnum[i.product.matSet];
      if (!matSet) throw new Error(`Unknown matSet enum: ${i.product.matSet}`);
      return {
        brandName: i.product.model.brand.name,
        modelName: i.product.model.name,
        matSet,
        colorName: i.color.name,
        colorHex: i.color.hex,
        edgeColorName: i.edgeColor.name,
        edgeColorHex: i.edgeColor.hex,
        // No "+" prefix — the email template prepends one itself.
        badgeName: i.badge
          ? `${i.badge.brandName} badge${(i.badgeCount ?? 1) > 1 ? ` ×${i.badgeCount}` : ""}`
          : null,
        heelPad: i.heelPad ?? false,
        year: i.year ?? null,
        quantity: i.quantity,
        unitPrice: calculateItemUnitPrice(
          {
            matSet,
            modelId: i.product.modelId,
            profile: profileOf(i.product.modelId),
            edgeColor: { id: i.edgeColor.id },
            badge: i.badge ? { id: i.badge.id } : null,
            badgeCount: i.badgeCount ?? 1,
            heelPad: i.heelPad ?? false,
          },
          overrides,
        ),
      };
    }),
  };
  // Both the customer confirmation AND the owner notification are sent
  // only here — after Stripe confirms the payment succeeded.
  await Promise.all([
    sendCustomerOrderEmail(emailData),
    sendOwnerOrderEmail(emailData),
  ]);
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: true, skipped: "stripe-not-configured" });
  }
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    // Stripe IS configured but the webhook secret is missing — a config
    // error (rotation, env migration). Responding 200 here would make
    // Stripe consider the delivery successful and stop retrying: paid
    // orders would silently stay PENDING forever with no confirmation
    // email and no revenue in admin. Fail loudly instead — Stripe retries
    // and the endpoint shows red in the Dashboard until ops fixes the env.
    console.error(
      "[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set while Stripe is configured — refusing event",
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event | null;
  try {
    event = await constructWebhookEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[stripe-webhook] invalid signature:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json({ ok: true, skipped: "no-event" });
  }

  // Idempotency: claim this event id before doing any side effects. Stripe
  // re-delivers on transient failures, so a 200-OK response after a partial
  // run can otherwise double-send emails or double-decrement stock.
  let fresh: boolean;
  try {
    fresh = await claimEvent(event.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[stripe-webhook] claimEvent failed for ${event.id}:`, msg);
    // Return 500 so Stripe re-delivers — better than fail-open and a
    // possible double-send if a transient DB blip clears.
    return NextResponse.json(
      { error: "Idempotency claim failed" },
      { status: 500 },
    );
  }
  if (!fresh) {
    console.log(`[stripe-webhook] ${event.id} already processed`);
    return NextResponse.json({ ok: true, idempotent: true });
  }

  console.log(`[stripe-webhook] ${event.id} ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = orderIdFromSession(session);
        if (orderId && session.payment_status === "paid") {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null);
          // updateMany with status guard — the second concurrent webhook
          // for the same id sees rows=0 and skips the email send below.
          // Also overlay the shipping address Stripe collected on
          // Checkout (bill-to ≠ ship-to). Customer entered an address
          // in our /checkout form, but Stripe's shipping form is the
          // final source of truth — overwrite so the ShipStation push
          // and the order detail page reflect what'll actually be
          // shipped.
          const sd = session.collected_information?.shipping_details;
          const shippingOverlay =
            sd?.address && sd?.name
              ? {
                  customerName: sd.name,
                  address: [sd.address.line1, sd.address.line2]
                    .filter(Boolean)
                    .join(", "),
                  city: sd.address.city ?? null,
                  state: sd.address.state ?? null,
                  zip: sd.address.postal_code ?? null,
                }
              : {};
          const res = await prisma.order.updateMany({
            where: { id: orderId, status: "PENDING" },
            data: {
              status: "CONFIRMED",
              paidAt: new Date(),
              stripePaymentIntentId: paymentIntentId,
              ...shippingOverlay,
            },
          });
          console.log(
            `[stripe-webhook] ${event.id} order=${orderId} paid (rows=${res.count})`,
          );
          if (res.count === 1) {
            // Deferred via `after` so a slow Resend / ShipStation call
            // can't trip Stripe's 30s webhook timeout — and, unlike a bare
            // floating promise, the serverless runtime keeps the instance
            // alive until the callback settles.
            after(async () => {
              await saveReceiptUrl(orderId, paymentIntentId);
              await sendOrderConfirmations(orderId).catch((err) => {
                console.error(
                  "[stripe-webhook] confirmation email failed:",
                  err,
                );
              });
              await pushToShipstationSafely(orderId);
            });
          }
        } else {
          console.log(
            `[stripe-webhook] ${event.id} skipped: orderId=${orderId} payment_status=${session.payment_status}`,
          );
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = orderIdFromSession(session);
        if (orderId) {
          const res = await prisma.order.updateMany({
            where: { id: orderId, status: "PENDING" },
            data: { status: "CONFIRMED", paidAt: new Date() },
          });
          console.log(
            `[stripe-webhook] ${event.id} order=${orderId} async-paid (rows=${res.count})`,
          );
          if (res.count === 1) {
            after(async () => {
              await sendOrderConfirmations(orderId).catch((err) => {
                console.error(
                  "[stripe-webhook] confirmation email failed:",
                  err,
                );
              });
              await pushToShipstationSafely(orderId);
            });
          }
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = orderIdFromSession(session);
        if (orderId) {
          // A session we deliberately expired because the customer opened
          // a NEWER one (retry after cancel, second tab) must not cancel
          // the order — the current session is still payable. The order
          // row always points at the latest session; a mismatch means
          // this event is for a superseded session.
          const current = await prisma.order.findUnique({
            where: { id: orderId },
            select: { stripeSessionId: true },
          });
          if (
            current?.stripeSessionId &&
            current.stripeSessionId !== session.id
          ) {
            console.log(
              `[stripe-webhook] ${event.id} order=${orderId} session superseded — not cancelling`,
            );
            break;
          }
          const res = await prisma.order.updateMany({
            where: { id: orderId, status: "PENDING" },
            data: { status: "CANCELLED" },
          });
          console.log(
            `[stripe-webhook] ${event.id} order=${orderId} cancelled (rows=${res.count})`,
          );
          if (res.count === 1) {
            // Guarded by the status transition above, so a webhook
            // re-delivery can't refund the same use twice.
            await refundPromoUse(orderId);
          }
        }
        break;
      }
      // Useful for refund flows later on:
      // case "charge.refunded": ...
      default:
        console.log(`[stripe-webhook] ${event.id} ignored type=${event.type}`);
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[stripe-webhook] handler error event=${event.id} type=${event.type} :: ${msg}`,
    );
    // Give the claim back — otherwise Stripe's retry of this 500 would hit
    // the "already processed" fast path and the event would be dropped
    // for good (e.g. a paid order stuck in PENDING forever).
    await releaseEvent(event.id);
    return NextResponse.json({ error: "Handler failure" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, eventId: event.id, type: event.type });
}
