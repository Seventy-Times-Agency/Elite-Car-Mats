import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { reportProblem } from "@/lib/ops/journal";

/**
 * Meta Conversions API — server-side events.
 *
 * The browser pixel alone loses 20–40% of conversions to iOS ATT,
 * Safari ITP and ad blockers, and its Purchase additionally depends on
 * the customer actually landing back on /checkout/success. Purchase is
 * sent from the Stripe webhook — the moment we KNOW the money arrived —
 * with `event_id: purchase-<orderNumber>`, the exact id the browser
 * pixel uses, so Meta dedupes the pair automatically. ViewContent /
 * AddToCart / InitiateCheckout are mirrored through /api/meta/event with
 * the id the browser generated for its own fbq call (same dedupe).
 *
 * Inert until BOTH env vars are set:
 *   NEXT_PUBLIC_META_PIXEL_ID — the dataset (pixel) id
 *   META_CAPI_TOKEN           — Events Manager → Settings → Generate
 *                               access token
 *
 * Optional: META_CAPI_TEST_EVENT_CODE — the code from Events Manager →
 * "Test events". When set, every event is tagged with it and lands in
 * the test-events view instead of the real data set. Meant for the
 * preview sandbox only; never set it in Production.
 */

const GRAPH_VERSION = "v21.0";

export function isMetaCapiConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_META_PIXEL_ID && process.env.META_CAPI_TOKEN,
  );
}

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  // Meta wants the country code included; bare 10-digit US numbers get
  // the leading 1 (the store ships US-only).
  return digits.length === 10 ? `1${digits}` : digits;
}

/** Meta hashes cities as lowercase letters only ("new york" → "newyork"). */
function normalizeCity(city: string): string {
  return city.toLowerCase().replace(/[^a-zа-яёіїєґ]/gi, "");
}

/**
 * `_fbp` / `_fbc` cookie shape: `fb.<subdomainIndex>.<ms>.<payload>`.
 * Anything else is a tampered or foreign cookie — Meta rejects the whole
 * event over a malformed fbc, so drop the field rather than lose the
 * event. 500 = Stripe's metadata value cap, which is where these
 * round-trip on the way to the Purchase event.
 */
const FB_COOKIE_RE = /^fb\.\d\.\d{1,16}\.[\x21-\x7e]+$/;

export function cleanFbCookie(
  value: string | null | undefined,
): string | undefined {
  const v = value?.trim();
  return v && v.length <= 500 && FB_COOKIE_RE.test(v) ? v : undefined;
}

export function cleanIp(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v && isIP(v) !== 0 ? v : undefined;
}

/**
 * Browser / click identifiers captured from the visitor's own request —
 * only ever with cookie consent (the client gates /api/meta/event and
 * the `adConsent` flag on /api/checkout/stripe).
 */
export interface AdSignals {
  fbp?: string;
  fbc?: string;
  ip?: string;
  ua?: string;
}

export interface MetaUserInput extends AdSignals {
  email?: string | null;
  phone?: string | null;
  customerName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

/**
 * Build Meta's `user_data`. PII is normalized + SHA-256 hashed; fbc,
 * fbp, IP and user agent go in the clear — Meta's spec says NOT to hash
 * them (it matches them against its own cookies and request logs, and a
 * hashed fbc is simply dropped).
 */
export function buildUserData(u: MetaUserInput): Record<string, unknown> {
  const userData: Record<string, unknown> = {};
  if (u.email) {
    userData.em = [sha256(u.email)];
    userData.external_id = [sha256(u.email)];
  }
  if (u.phone) userData.ph = [sha256(normalizePhone(u.phone))];
  if (u.customerName) {
    const parts = u.customerName.trim().split(/\s+/);
    if (parts[0]) userData.fn = [sha256(parts[0])];
    if (parts.length > 1) userData.ln = [sha256(parts[parts.length - 1])];
  }
  if (u.city) userData.ct = [sha256(normalizeCity(u.city))];
  // st must be the 2-letter code — skip free-text state names rather
  // than hash a value Meta can never match.
  if (u.state && u.state.trim().length === 2) userData.st = [sha256(u.state)];
  if (u.zip) userData.zp = [sha256(u.zip)];

  const fbc = cleanFbCookie(u.fbc);
  const fbp = cleanFbCookie(u.fbp);
  const ip = cleanIp(u.ip);
  const ua = u.ua?.trim();
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;
  if (ip) userData.client_ip_address = ip;
  if (ua) userData.client_user_agent = ua;
  return userData;
}

export interface MetaEventInput {
  eventName: string;
  /** Shared with the browser pixel's `eventID` — Meta dedupes on it. */
  eventId: string;
  eventSourceUrl: string;
  userData: MetaUserInput;
  customData?: Record<string, unknown>;
  /** Short tag for logs / the problem journal (e.g. the order number). */
  logContext?: string;
}

export async function sendMetaEvent(input: MetaEventInput): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
  const token = process.env.META_CAPI_TOKEN ?? "";
  if (!pixelId || !token) return;

  const tag = `${input.eventName} ${input.logContext ?? input.eventId}`;
  // Only Purchase reaches the problem journal: one event per paid order,
  // so a failure there is a lost conversion worth the admin's eye. The
  // browsing events fire on every product view — a bad token or a Graph
  // outage would cost a Redis write per page view, exactly the traffic
  // pattern the journal was built to avoid. Those stay in the Vercel log.
  const journal = input.eventName === "Purchase";

  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  const body = {
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
    // In the POST body, not the query string — URLs leak into proxy logs,
    // APM traces and thrown fetch errors far more readily than bodies.
    access_token: token,
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.eventSourceUrl,
        user_data: buildUserData(input.userData),
        ...(input.customData ? { custom_data: input.customData } : {}),
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
        // Callers run inside a short-lived `after()` context — don't hang
        // on a slow Graph API response.
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[meta-capi] ${tag} rejected: ${res.status} ${text.slice(0, 300)}`,
      );
      if (journal) {
        await reportProblem({
          area: "capi",
          severity: "warning",
          message: `HTTP ${res.status} ${text.slice(0, 200)}`,
          context: input.logContext,
        });
      }
    } else if (journal) {
      console.log(`[meta-capi] ${tag} sent`);
    }
  } catch (err) {
    console.error(`[meta-capi] ${tag} failed:`, err);
    if (journal) {
      await reportProblem({
        area: "capi",
        severity: "warning",
        error: err,
        context: input.logContext,
      });
    }
  }
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
  /** Captured when the customer started checkout (with consent) and
   *  carried through the Stripe session metadata — the webhook has no
   *  browser of its own to read cookies or an IP from. */
  adSignals?: AdSignals;
}

export async function sendMetaPurchase(
  params: MetaPurchaseParams,
): Promise<void> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";
  await sendMetaEvent({
    eventName: "Purchase",
    // Same id as the browser pixel on /checkout/success → deduped.
    eventId: `purchase-${params.orderNumber}`,
    eventSourceUrl: `${site}/checkout/success`,
    logContext: params.orderNumber,
    userData: {
      ...params.adSignals,
      email: params.email,
      phone: params.phone,
      customerName: params.customerName,
      city: params.city,
      state: params.state,
      zip: params.zip,
    },
    customData: {
      currency: "USD",
      value: Number(params.valueUsd.toFixed(2)),
      content_type: "product",
      content_ids: params.contents.map((c) => c.id),
      contents: params.contents,
    },
  });
}
