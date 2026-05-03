import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { isStripeConfigured, getWebhookSecret } from "@/lib/payments/stripe";
import { constructWebhookEvent } from "@/lib/payments/stripe-checkout";
import { sendCustomerOrderEmail } from "@/lib/email";
import { signOrderToken } from "@/lib/security/order-token";
import { calculateItemUnitPrice } from "@/lib/pricing";
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
 */
async function claimEvent(eventId: string): Promise<boolean> {
  // Lazy table creation — re-runs are no-ops thanks to IF NOT EXISTS.
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "WebhookEvent" (
      "id" TEXT PRIMARY KEY,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    const inserted = await prisma.$executeRaw`
      INSERT INTO "WebhookEvent"("id") VALUES (${eventId})
      ON CONFLICT ("id") DO NOTHING
    `;
    return inserted === 1;
  } catch (err) {
    console.error("[stripe-webhook] claimEvent failed:", err);
    // Fail closed-ish: if we can't record the claim, allow processing but
    // rely on the per-row status guard further down to keep things
    // idempotent. Better than silently dropping a real payment.
    return true;
  }
}

async function sendCustomerConfirmation(orderId: string): Promise<void> {
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
  await sendCustomerOrderEmail({
    orderNumber: order.orderNumber,
    orderToken: signOrderToken(order.id),
    customerName: order.customerName,
    customerEmail: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    state: order.state,
    zip: order.zip,
    total: Number(order.total ?? 0),
    items: order.items.map((i) => {
      const matSet = matSetFromEnum[i.product.matSet] ?? "full";
      return {
        brandName: i.product.model.brand.name,
        modelName: i.product.model.name,
        matSet,
        colorName: i.color.name,
        colorHex: i.color.hex,
        edgeColorName: i.edgeColor.name,
        edgeColorHex: i.edgeColor.hex,
        badgeName: i.badge ? `+ ${i.badge.brandName} badge` : null,
        year: i.year ?? null,
        quantity: i.quantity,
        unitPrice: calculateItemUnitPrice({
          matSet,
          modelId: i.product.modelId,
          edgeColor: { id: i.edgeColor.id },
          badge: i.badge ? { id: i.badge.id } : null,
        }),
      };
    }),
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: true, skipped: "stripe-not-configured" });
  }
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json({ ok: true, skipped: "no-webhook-secret" });
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
  const fresh = await claimEvent(event.id);
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
          const res = await prisma.order.updateMany({
            where: { id: orderId, status: "PENDING" },
            data: {
              status: "CONFIRMED",
              paidAt: new Date(),
              stripePaymentIntentId: paymentIntentId,
            },
          });
          console.log(
            `[stripe-webhook] ${event.id} order=${orderId} paid (rows=${res.count})`,
          );
          if (res.count === 1) {
            try {
              await sendCustomerConfirmation(orderId);
            } catch (err) {
              console.error("[stripe-webhook] confirmation email failed:", err);
            }
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
            try {
              await sendCustomerConfirmation(orderId);
            } catch (err) {
              console.error("[stripe-webhook] confirmation email failed:", err);
            }
          }
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = orderIdFromSession(session);
        if (orderId) {
          const res = await prisma.order.updateMany({
            where: { id: orderId, status: "PENDING" },
            data: { status: "CANCELLED" },
          });
          console.log(
            `[stripe-webhook] ${event.id} order=${orderId} cancelled (rows=${res.count})`,
          );
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
    return NextResponse.json({ error: "Handler failure" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, eventId: event.id, type: event.type });
}
