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
  /** Discount in whole USD applied to the order subtotal. Translated into a
   *  Stripe-side coupon so the customer sees the price they were quoted. */
  discountUsd?: number;
  /** Token for the magic order URL embedded in the success_url. */
  orderToken?: string;
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

  // Translate the order-level promo discount into a one-shot Stripe coupon
  // so the displayed total on Stripe matches what we stored in the DB.
  //
  // If coupon creation fails we throw — the previous behaviour was to log
  // and continue, which silently overcharged the customer the full
  // pre-discount amount. The route's try/catch turns this into a 5xx and
  // the customer can retry instead of being billed too much.
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (input.discountUsd && input.discountUsd > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: Math.round(input.discountUsd * 100),
      currency: "usd",
      duration: "once",
      name: `Promo (${input.orderNumber})`,
      max_redemptions: 1,
    });
    discounts = [{ coupon: coupon.id }];
  }

  const successQs = new URLSearchParams({
    session_id: "{CHECKOUT_SESSION_ID}",
    order: input.orderNumber,
  });
  if (input.orderToken) successQs.set("t", input.orderToken);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Let Stripe auto-detect the right payment methods for the customer's
    // device — Apple Pay / Google Pay / Link surface automatically on
    // mobile once the domain is verified, which lifts mobile conversion
    // significantly vs the card-only flow.
    line_items,
    customer_email: input.customerEmail,
    client_reference_id: input.orderId,
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
    locale: input.locale ?? "auto",
    ...(discounts ? { discounts } : {}),
    automatic_tax: { enabled: false },
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "MX"],
    },
    // {CHECKOUT_SESSION_ID} is a Stripe placeholder, so we have to
    // hand-build the query string and inject it (URLSearchParams encodes
    // the braces).
    success_url: `${SITE}/checkout/success?${successQs.toString().replace(
      "%7BCHECKOUT_SESSION_ID%7D",
      "{CHECKOUT_SESSION_ID}",
    )}`,
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
