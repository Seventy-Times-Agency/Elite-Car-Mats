import "server-only";
import { createHash } from "node:crypto";

/**
 * Meta Conversions API — server-side Purchase events.
 *
 * The browser pixel alone loses 20–40% of conversions to iOS ATT,
 * Safari ITP and ad blockers, and its Purchase additionally depends on
 * the customer actually landing back on /checkout/success. This sends
 * the same event from the Stripe webhook — the moment we KNOW the money
 * arrived — with `event_id: purchase-<orderNumber>`, the exact id the
 * browser pixel uses, so Meta dedupes the pair automatically.
 *
 * Inert until BOTH env vars are set:
 *   NEXT_PUBLIC_META_PIXEL_ID — the dataset (pixel) id
 *   META_CAPI_TOKEN           — Events Manager → Settings → Generate
 *                               access token
 */

const GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  // Meta wants the country code included; bare 10-digit US numbers get
  // the leading 1 (the store ships US-only).
  return digits.length === 10 ? `1${digits}` : digits;
}

/** Meta hashes cities as lowercase letters only ("new york" → "newyork"). */
function normalizeCity(city: string): string {
  return city.toLowerCase().replace(/[^a-zа-яёіїєґ]/gi, "");
}

export interface MetaPurchaseParams {
  orderNumber: string;
  valueUsd: number;
  email: string;
  phone?: string | null;
  customerName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  contents: { id: string; quantity: number; item_price: number }[];
}

export async function sendMetaPurchase(
  params: MetaPurchaseParams,
): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
  const token = process.env.META_CAPI_TOKEN ?? "";
  if (!pixelId || !token) return;

  const userData: Record<string, unknown> = {
    em: [sha256(params.email)],
    external_id: [sha256(params.email)],
  };
  if (params.phone) userData.ph = [sha256(normalizePhone(params.phone))];
  if (params.customerName) {
    const parts = params.customerName.trim().split(/\s+/);
    if (parts[0]) userData.fn = [sha256(parts[0])];
    if (parts.length > 1) userData.ln = [sha256(parts[parts.length - 1])];
  }
  if (params.city) userData.ct = [sha256(normalizeCity(params.city))];
  // st must be the 2-letter code — skip free-text state names rather
  // than hash a value Meta can never match.
  if (params.state && params.state.trim().length === 2)
    userData.st = [sha256(params.state)];
  if (params.zip) userData.zp = [sha256(params.zip)];

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";
  const body = {
    // In the POST body, not the query string — URLs leak into proxy logs,
    // APM traces and thrown fetch errors far more readily than bodies.
    access_token: token,
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        // Same id as the browser pixel on /checkout/success → deduped.
        event_id: `purchase-${params.orderNumber}`,
        action_source: "website",
        event_source_url: `${site}/checkout/success`,
        user_data: userData,
        custom_data: {
          currency: "USD",
          value: Number(params.valueUsd.toFixed(2)),
          content_type: "product",
          content_ids: params.contents.map((c) => c.id),
          contents: params.contents,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        // The webhook's `after()` context is short-lived — don't hang on
        // a slow Graph API response.
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[meta-capi] Purchase ${params.orderNumber} rejected: ${res.status} ${text.slice(0, 300)}`,
      );
    } else {
      console.log(`[meta-capi] Purchase ${params.orderNumber} sent`);
    }
  } catch (err) {
    console.error(`[meta-capi] Purchase ${params.orderNumber} failed:`, err);
  }
}
