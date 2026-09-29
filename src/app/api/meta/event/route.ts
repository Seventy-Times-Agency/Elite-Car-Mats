import { NextResponse, after } from "next/server";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isMetaCapiConfigured, sendMetaEvent } from "@/lib/analytics/meta-capi";
import {
  metaEventSchema,
  allowedHosts,
  isAllowedUrl,
  adSignalsFromRequest,
} from "@/lib/analytics/meta-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-side mirror of the browser pixel's ViewContent / AddToCart /
 * InitiateCheckout. The client posts here (sendBeacon) with the same
 * event id it handed to fbq, so when both arrive Meta keeps one — and
 * when the pixel is blocked (ad blocker, ITP, the pixel script not yet
 * loaded) the server copy still lands, carrying the `_fbp` / `_fbc`
 * cookies, IP and user agent that drive match quality.
 *
 * The client only calls this for visitors who have not opted out of ad
 * measurement (banner, /privacy control or Global Privacy Control — see
 * lib/consent); nothing here is sent without that call.
 *
 * Status codes are for debugging only — sendBeacon never reads them.
 */

const noContent = () => new NextResponse(null, { status: 204 });

/** A real payload is a few hundred bytes; don't JSON-parse megabytes. */
const MAX_BODY = 16_384;

export async function POST(request: Request) {
  // Inert until the dataset id + token are configured.
  if (!isMetaCapiConfigured()) return noContent();

  // Only our own pages may spend the CAPI token. Browsers always send
  // Origin on POST, so a missing one is a script, not a visitor.
  const hosts = allowedHosts(request);
  if (!isAllowedUrl(request.headers.get("origin"), hosts)) {
    return new NextResponse(null, { status: 403 });
  }

  // A browsing session fires a handful of these per minute; 60 leaves
  // room for fast catalog clicking while capping what one IP can push
  // into the data set.
  const ip = getClientIp(request);
  const limit = await rateLimit(`meta-event:${ip}`, {
    windowMs: 60_000,
    max: 60,
  });
  if (!limit.ok) {
    return new NextResponse(null, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return new NextResponse(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = metaEventSchema.safeParse(body);
  if (!parsed.success || !isAllowedUrl(parsed.data.eventSourceUrl, hosts)) {
    return new NextResponse(null, { status: 400 });
  }

  const { eventName, eventId, eventSourceUrl, customData } = parsed.data;
  const userData = adSignalsFromRequest(request);
  // Graph API round-trip happens after the 204 is flushed.
  after(() =>
    sendMetaEvent({ eventName, eventId, eventSourceUrl, userData, customData }),
  );
  return noContent();
}
