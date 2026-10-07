import { isPaymentEnabled } from "@/lib/payments/stripe";
import { CheckoutClient } from "./CheckoutClient";

/**
 * Server wrapper so the client form learns about payments from the same
 * flag the API routes use (STRIPE_SECRET_KEY). The old client-side check
 * keyed off NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, which could disagree with
 * the server: secret-only deployments silently never started a Checkout
 * session (and the customer email — deferred to the webhook — never fired).
 */
export default function CheckoutPage() {
  return <CheckoutClient paymentEnabled={isPaymentEnabled()} />;
}
