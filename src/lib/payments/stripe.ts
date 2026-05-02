import "server-only";
import type Stripe from "stripe";

/**
 * Lazy-loaded Stripe client.
 *
 * The stripe package is declared as a dependency but we do not hard-require it
 * at module load time — that way the rest of the codebase builds and runs
 * fine in environments where STRIPE_SECRET_KEY is not configured.
 *
 * Call `getStripe()` to obtain a client. Returns `null` when:
 *  - STRIPE_SECRET_KEY env var is missing, or
 *  - the `stripe` package fails to import for any reason
 *
 * Callers must null-check and fall back to "payment disabled" branches.
 */

let cached: Stripe | null | undefined;

export async function getStripe(): Promise<Stripe | null> {
  if (cached !== undefined) return cached;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cached = null;
    return null;
  }

  try {
    const mod = await import("stripe");
    const Ctor = mod.default as unknown as new (
      key: string,
      config?: Stripe.StripeConfig,
    ) => Stripe;
    cached = new Ctor(key, {
      apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion,
      typescript: true,
      appInfo: {
        name: "Elite Car Mats",
        url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us",
      },
    });
    return cached;
  } catch (err) {
    console.error("[stripe] failed to load SDK:", err);
    cached = null;
    return null;
  }
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isPaymentEnabled(): boolean {
  return isStripeConfigured();
}

export function getWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

export function getPublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
}
