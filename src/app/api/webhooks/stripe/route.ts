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
    console.error("[stripe-webhook:invalid-signature]", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  if (!event) {
    return NextResponse.json({ ok: true, skipped: "no-event" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId =
          session.client_reference_id ??
          (session.metadata?.orderId as string | undefined);
        if (orderId && session.payment_status === "paid") {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null);
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "CONFIRMED",
              paidAt: new Date(),
              stripePaymentIntentId: paymentIntentId,
            },
          });
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId =
          session.client_reference_id ??
          (session.metadata?.orderId as string | undefined);
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "CONFIRMED", paidAt: new Date() },
          });
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId =
          session.client_reference_id ??
          (session.metadata?.orderId as string | undefined);
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
          });
        }
        break;
      }
      // Useful for refund flows later on:
      // case "charge.refunded": ...
      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook:handler-error]", event.type, err);
    return NextResponse.json(
      { error: "Handler failure" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
