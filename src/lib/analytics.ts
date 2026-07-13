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
 * Fire a standard Meta Pixel event. No-op when the pixel isn't
 * configured or hasn't loaded yet. `eventId` deduplicates re-fired
 * events (e.g. a reloaded success page) on Meta's side.
 */
export function trackEvent(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
): void {
  if (!META_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  if (eventId) {
    window.fbq("track", event, params ?? {}, { eventID: eventId });
  } else {
    window.fbq("track", event, params ?? {});
  }
}
