import {
  isMeaningfulTouch,
  touchFromLocation,
  type Attribution,
} from "@/lib/analytics/attribution";

/**
 * Browser half of order attribution: remember how the visitor first
 * arrived and the latest tagged/external arrival, hand both to
 * /api/orders at checkout.
 *
 * localStorage, not a cookie — nothing is sent anywhere until the
 * visitor places an order, and the stash holds no identifier (utm tags,
 * a referrer hostname, a path). Outside the consent gate for the same
 * reason the funnel counters are. 90-day first-touch window, like
 * `_fbc`.
 */

const KEY = "ecm-attr";
const VERSION = 1;
const FIRST_TTL_MS = 90 * 24 * 60 * 60 * 1000;

interface Stash {
  v: number;
  first: Attribution["first"];
  last: Attribution["last"];
}

function read(): Stash | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Stash>;
    if (s.v !== VERSION || !s.first || !s.last) return null;
    if (Date.now() - s.first.ts > FIRST_TTL_MS) return null;
    return s as Stash;
  } catch {
    return null;
  }
}

function write(s: Stash): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode / quota — attribution is best-effort */
  }
}

/** Call on every page load and client-side navigation. */
export function recordTouch(): void {
  if (typeof window === "undefined") return;
  const touch = touchFromLocation(
    new URL(window.location.href),
    document.referrer,
    window.location.hostname,
  );
  const cur = read();
  if (!cur) {
    write({ v: VERSION, first: touch, last: touch });
    return;
  }
  if (isMeaningfulTouch(touch)) {
    write({ ...cur, last: touch });
  }
}

export function readAttribution(): Attribution | null {
  const s = read();
  return s ? { first: s.first, last: s.last } : null;
}
