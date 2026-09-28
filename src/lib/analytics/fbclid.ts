/**
 * Keep the Meta click id (`fbclid`) alive until the visitor consents.
 *
 * fbevents.js turns `?fbclid=` in the CURRENT URL into the `_fbc` cookie
 * — but the pixel only loads after the cookie banner is accepted, and by
 * then the visitor has usually clicked away from the ad's landing URL.
 * The click id is lost, and with it the strongest match key Meta has
 * ("low fbc coverage" in Events Manager).
 *
 * So: on landing, park `{fbclid, ts}` in sessionStorage (no cookie, no
 * network — nothing leaves the browser before consent). When consent is
 * given, write `_fbc` in the exact format the pixel itself uses, stamped
 * with the original click time, before fbevents.js initializes.
 */

const STASH_KEY = "ecm-fbclid";
const FBC_MAX_AGE_S = 90 * 24 * 60 * 60;
// Real fbclids are URL-safe base64-ish; anything else is not worth a cookie.
const FBCLID_RE = /^[A-Za-z0-9_-]{1,400}$/;

export interface FbclidStash {
  fbclid: string;
  ts: number;
}

/** `fb.<subdomainIndex>.<creationTimeMs>.<fbclid>` — index 1 = apex domain. */
export function fbcValue(stash: FbclidStash): string {
  return `fb.1.${stash.ts}.${stash.fbclid}`;
}

/**
 * Whether the stashed click should replace the existing `_fbc`. A newer
 * ad click is the one to attribute to; the same click (the pixel already
 * wrote it) or an older one leaves the cookie alone.
 */
export function shouldWriteFbc(
  existing: string | null | undefined,
  stash: FbclidStash,
): boolean {
  if (!existing) return true;
  const parts = existing.split(".");
  if (parts.length < 4 || parts[0] !== "fb") return true;
  if (parts.slice(3).join(".") === stash.fbclid) return false;
  const ts = Number(parts[2]);
  return !Number.isFinite(ts) || ts < stash.ts;
}

function readStash(): FbclidStash | null {
  try {
    const raw = sessionStorage.getItem(STASH_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<FbclidStash>;
    return typeof v.fbclid === "string" &&
      FBCLID_RE.test(v.fbclid) &&
      typeof v.ts === "number"
      ? { fbclid: v.fbclid, ts: v.ts }
      : null;
  } catch {
    return null;
  }
}

/** Call once per page load, before consent is known. */
export function stashFbclid(): void {
  try {
    const fbclid = new URL(window.location.href).searchParams.get("fbclid");
    if (!fbclid || !FBCLID_RE.test(fbclid)) return;
    // A reload of the landing URL must not move the click time forward.
    if (readStash()?.fbclid === fbclid) return;
    sessionStorage.setItem(
      STASH_KEY,
      JSON.stringify({ fbclid, ts: Date.now() } satisfies FbclidStash),
    );
  } catch {
    // storage blocked (private mode) — fall back to the pixel's own
    // capture, which still works when consent comes on the landing page
  }
}

function readFbcCookie(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)_fbc=([^;]*)/);
  return m ? m[1]! : null;
}

/** Call only once the visitor has ACCEPTED cookies. */
export function applyStashedFbclid(): void {
  const stash = readStash();
  if (!stash) return;
  try {
    if (shouldWriteFbc(readFbcCookie(), stash)) {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `_fbc=${fbcValue(stash)}; path=/; max-age=${FBC_MAX_AGE_S}; SameSite=Lax${secure}`;
    }
    sessionStorage.removeItem(STASH_KEY);
  } catch {
    // ignore — worst case the click id is lost, as before
  }
}
