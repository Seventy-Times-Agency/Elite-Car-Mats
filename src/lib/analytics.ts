import { getConsent } from "@/lib/consent";
import { stashFbclid, applyStashedFbclid } from "@/lib/analytics/fbclid";

/**
 * Meta Pixel helpers (client-side). The pixel is entirely inert until
 * NEXT_PUBLIC_META_PIXEL_ID is set in the environment — no script tag,
 * no network calls — so this can ship ahead of the ad account setup.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/**
 * Events also sent server-side via /api/meta/event (Conversions API).
 * Purchase is deliberately absent: the Stripe webhook sends it with
 * verified order data, the browser only contributes the pixel copy.
 */
const MIRRORED = new Set(["ViewContent", "AddToCart", "InitiateCheckout"]);
const CAPI_ENDPOINT = "/api/meta/event";

function newEventId(event: string): string {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : // randomUUID is secure-context only (plain-http LAN dev).
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${event.toLowerCase()}-${rand}`;
}

/** Page URL for `event_source_url`, minus the order token and hash. */
function pageUrl(): string {
  try {
    const u = new URL(window.location.href);
    u.searchParams.delete("t");
    u.hash = "";
    return u.toString();
  } catch {
    return window.location.origin;
  }
}

function sendToServer(
  eventName: string,
  eventId: string,
  customData: Record<string, unknown> | undefined,
): void {
  // Page effects run before the layout's MetaPixel effect, so on an ad
  // landing the first ViewContent would otherwise leave before `_fbc`
  // is written. Both calls are idempotent; consent is already checked.
  stashFbclid();
  applyStashedFbclid();
  const body = JSON.stringify({
    eventName,
    eventId,
    eventSourceUrl: pageUrl(),
    ...(customData ? { customData } : {}),
  });
  try {
    // sendBeacon survives the navigation that often follows these
    // events (add-to-cart → drawer → checkout, pay → Stripe redirect).
    if (
      navigator.sendBeacon?.(
        CAPI_ENDPOINT,
        new Blob([body], { type: "application/json" }),
      )
    ) {
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  void fetch(CAPI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* analytics must never surface an error to the visitor */
  });
}

/**
 * Fire a standard Meta Pixel event. No-op when the pixel isn't
 * configured. `eventId` deduplicates re-fired events (e.g. a reloaded
 * success page) on Meta's side.
 *
 * ViewContent / AddToCart / InitiateCheckout are additionally posted to
 * our own server, which forwards them to the Conversions API under the
 * SAME event id — Meta keeps one of the pair. The server copy is what
 * survives ad blockers, and it also covers the window before fbevents.js
 * has loaded (`window.fbq` still undefined), where the browser copy is
 * simply lost. Both halves only run with cookie consent: fbq exists only
 * after consent, and the server copy checks it explicitly.
 */
export function trackEvent(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
): void {
  if (!META_PIXEL_ID || typeof window === "undefined") return;
  const mirrored = MIRRORED.has(event);
  const id = eventId ?? (mirrored ? newEventId(event) : undefined);

  if (window.fbq) {
    if (id) {
      window.fbq("track", event, params ?? {}, { eventID: id });
    } else {
      window.fbq("track", event, params ?? {});
    }
  }

  if (mirrored && id && getConsent() === "accepted") {
    sendToServer(event, id, params);
  }
}
