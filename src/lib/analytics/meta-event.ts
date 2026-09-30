import "server-only";
import { z } from "zod";
import { getClientIp } from "@/lib/security/rate-limit";
import { cleanFbCookie, cleanIp, type AdSignals } from "./meta-capi";

/**
 * Request-side half of the Conversions API: what /api/meta/event accepts
 * from the browser, and how a visitor's click identifiers are captured
 * from a request and carried through Stripe to the webhook's Purchase.
 */

/** Browser events mirrored server-side. Purchase is NOT here — it comes
 *  from the Stripe webhook, never from a client-controlled request. */
export const MIRRORED_EVENTS = [
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
] as const;

const sku = z.string().min(1).max(64);

/**
 * Strict allowlist: this endpoint spends the shop's CAPI token on
 * whatever it is fed, so nothing beyond the fields the storefront
 * actually sends gets through. $5000 is far above any real cart and
 * keeps a forged event from wrecking the value-optimization signal.
 */
export const metaEventSchema = z.strictObject({
  eventName: z.enum(MIRRORED_EVENTS),
  eventId: z.string().min(1).max(64),
  eventSourceUrl: z.string().min(1).max(2048),
  customData: z
    .strictObject({
      currency: z.literal("USD").optional(),
      value: z.number().min(0).max(5000).optional(),
      content_ids: z.array(sku).max(20).optional(),
      content_type: z.enum(["product", "product_group"]).optional(),
      contents: z
        .array(
          z.strictObject({
            id: sku,
            quantity: z.number().int().min(1).max(100),
            item_price: z.number().min(0).max(5000).optional(),
          }),
        )
        .max(20)
        .optional(),
      num_items: z.number().int().min(0).max(100).optional(),
      content_name: z.string().max(200).optional(),
    })
    .optional(),
});

export type MetaEventBody = z.infer<typeof metaEventSchema>;

/**
 * Hosts this deployment answers on. The request's own host covers
 * preview deployments and www/apex alike; NEXT_PUBLIC_SITE_URL covers a
 * proxy that rewrites Host.
 */
export function allowedHosts(request: Request): Set<string> {
  const hosts = new Set<string>();
  const add = (h: string | null | undefined) => {
    const v = h?.split(",")[0]?.trim().toLowerCase();
    if (v) hosts.add(v);
  };
  add(request.headers.get("host"));
  add(request.headers.get("x-forwarded-host"));
  try {
    add(new URL(request.url).host);
  } catch {
    // relative/invalid request.url — the headers above still apply
  }
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (site) add(new URL(site).host);
  } catch {
    // malformed env — ignore
  }
  return hosts;
}

/**
 * Crawlers that execute JavaScript — Google's Merchant Center and Ads
 * checkers, Bing, Meta's own link preview, headless browsers — render
 * product pages and would fire the pixel like a shopper. The pixel
 * script drops the best-known ones itself; the server mirror must not
 * re-add them, and neither should it count a crawl of 3 900 feed URLs
 * as 3 900 product views.
 */
const CRAWLER_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|storebot|adsbot|mediapartners|python-requests|curl\/|wget\//i;

export function isCrawlerUserAgent(ua: string | null | undefined): boolean {
  return !!ua && CRAWLER_UA.test(ua);
}

/** True when `url` is an absolute http(s) URL on one of `hosts`. */
export function isAllowedUrl(
  url: string | null | undefined,
  hosts: Set<string>,
): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      (u.protocol === "https:" || u.protocol === "http:") &&
      hosts.has(u.host.toLowerCase())
    );
  } catch {
    return false;
  }
}

export function readCookie(
  header: string | null | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() !== name) continue;
    const raw = part.slice(eq + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return undefined;
}

/** Long enough for every real browser UA; keeps Stripe metadata (500
 *  chars per value) comfortably in bounds. */
const UA_MAX = 400;

/**
 * Read `_fbp` / `_fbc`, IP and user agent off the visitor's request.
 * Callers must only do this once the visitor consented to ad cookies.
 */
export function adSignalsFromRequest(request: Request): AdSignals {
  const cookie = request.headers.get("cookie");
  const signals: AdSignals = {};
  const fbp = cleanFbCookie(readCookie(cookie, "_fbp"));
  const fbc = cleanFbCookie(readCookie(cookie, "_fbc"));
  const ip = cleanIp(getClientIp(request));
  const ua = request.headers.get("user-agent")?.trim().slice(0, UA_MAX);
  if (fbp) signals.fbp = fbp;
  if (fbc) signals.fbc = fbc;
  if (ip) signals.ip = ip;
  if (ua) signals.ua = ua;
  return signals;
}

/**
 * Stripe metadata form of the signals (flat string map, ≤ 500 chars per
 * value). Stored on the Checkout Session only — not the PaymentIntent —
 * so the identifiers live in exactly one place outside the browser.
 */
export function adSignalsToMetadata(
  s: AdSignals | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!s) return out;
  if (s.fbp) out.fbp = s.fbp.slice(0, 500);
  if (s.fbc) out.fbc = s.fbc.slice(0, 500);
  if (s.ip) out.ip = s.ip.slice(0, 500);
  if (s.ua) out.ua = s.ua.slice(0, 500);
  return out;
}

export function adSignalsFromMetadata(
  metadata: Record<string, string> | null | undefined,
): AdSignals | undefined {
  if (!metadata) return undefined;
  const signals: AdSignals = {};
  const fbp = cleanFbCookie(metadata.fbp);
  const fbc = cleanFbCookie(metadata.fbc);
  const ip = cleanIp(metadata.ip);
  const ua = metadata.ua?.trim();
  if (fbp) signals.fbp = fbp;
  if (fbc) signals.fbc = fbc;
  if (ip) signals.ip = ip;
  if (ua) signals.ua = ua;
  return Object.keys(signals).length ? signals : undefined;
}
