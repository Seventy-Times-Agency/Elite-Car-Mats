import type { FunnelStep } from "@/lib/analytics/funnel";

/**
 * Client half of the own-side funnel.
 *
 * Two rules shape this file:
 *
 * 1. ONE COUNT PER SESSION PER STEP. The funnel answers "how many people
 *    got this far", so a visitor who opens six product pages is one
 *    `product`, not six. Without that, the step-to-step percentages are
 *    meaningless and the counters cost more to store.
 *
 * 2. BATCH, DON'T CHATTER. Steps are buffered and flushed together, so a
 *    session sends a couple of beacons instead of one request per click.
 *
 * No consent gate, matching the precedent set by Vercel Analytics in the
 * root layout: this stores no identifier, sets no cookie, and sends no
 * personal data — only which anonymous step was reached. The Meta Pixel
 * and GA4, which do identify people, stay behind the banner.
 */

const SEEN_KEY = "ecm-funnel-seen";
const ENDPOINT = "/api/funnel";
const FLUSH_DELAY_MS = 2000;

let buffer: FunnelStep[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listenersBound = false;

/** sessionStorage throws in some privacy modes — never let that break a page. */
function readSeen(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSeen(seen: Set<string>): void {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* private mode — dedup degrades to per-page-load, counts stay sane */
  }
}

function send(steps: FunnelStep[]): void {
  const body = JSON.stringify({ steps });
  try {
    // sendBeacon survives the page being torn down mid-navigation, which
    // is exactly when the last step of a session tends to fire.
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) {
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* analytics must never surface an error to the visitor */
  });
}

function flush(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (buffer.length === 0) return;
  const steps = buffer;
  buffer = [];
  send(steps);
}

function bindFlushListeners(): void {
  if (listenersBound || typeof document === "undefined") return;
  listenersBound = true;
  // `visibilitychange` → hidden is the reliable "user is leaving" signal
  // on mobile; `pagehide` covers desktop back/forward navigation.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}

/**
 * Record that this visitor reached `step`. Repeat calls within the same
 * browser session are ignored.
 */
export function trackFunnel(step: FunnelStep): void {
  if (typeof window === "undefined") return;
  const seen = readSeen();
  if (seen.has(step)) return;
  seen.add(step);
  writeSeen(seen);

  buffer.push(step);
  bindFlushListeners();
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, FLUSH_DELAY_MS);
}
