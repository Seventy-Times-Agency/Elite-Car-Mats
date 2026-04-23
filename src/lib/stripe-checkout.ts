import "server-only";
import type Stripe from "stripe";
import { getStripe } from "./stripe";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

export interface CheckoutLineItem {
  /** Localized label — appears on the Stripe Checkout page. */
  name: string;
  /** Optional short description shown under the name. */
  description?: string;
  /** Unit price in USD (as a plain number — we convert to cents below). */
  unitPriceUsd: number;
  quantity: number;
}

export interface CreateCheckoutSessionInput {
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  items: CheckoutLineItem[];
  /** Preferred locale for Stripe Checkout UI. Falls back to auto. */
  locale?: Stripe.Checkout.SessionCreateParams.Locale;
}

export interface CheckoutSessionResult {
  id: string;
  url: string;
}

/**
 * Build + create a Stripe Checkout Session for one of our orders.
 *
 * Returns `null` when Stripe isn't configured (so callers can fall back to
 * the existing manual-confirm flow). Throws on actual Stripe API errors
 * so the surrounding try/catch on the route can surface a 5xx.
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    input.items.map((it) => ({
      quantity: it.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(it.unitPriceUsd * 100),
        product_data: {
          name: it.name,
          ...(it.description ? { description: it.description } : {}),
        },
      },
    }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items,
    customer_email: input.customerEmail,
    client_reference_id: input.orderId,
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
    locale: input.locale ?? "auto",
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "MX"],
    },
    success_url: `${SITE}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${encodeURIComponent(input.orderNumber)}`,
    cancel_url: `${SITE}/checkout/cancel?order=${encodeURIComponent(input.orderNumber)}`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }
  return { id: session.id, url: session.url };
}

/**
 * Verify + parse an incoming Stripe webhook body. Returns `null` if Stripe
 * isn't configured or the signature is missing — the caller should respond
 * with the right HTTP status in that case.
 */
export async function constructWebhookEvent(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
): Promise<Stripe.Event | null> {
  const stripe = await getStripe();
  if (!stripe) return null;
  if (!signatureHeader) return null;
  return stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
}
