import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { isStripeConfigured, getWebhookSecret } from "@/lib/stripe";
import { constructWebhookEvent } from "@/lib/stripe-checkout";

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
          // updateMany with a status guard so re-delivery of the same event
          // doesn't clobber paidAt or move a CANCELLED order back to CONFIRMED.
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
        // Ignore other events but log so we can decide if we want them later.
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
