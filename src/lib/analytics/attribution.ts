/**
 * Where an order came from.
 *
 * Every entry point already tags its links: the Meta Shop checkout URL
 * arrives as `utm_source=facebook&utm_medium=shop`, the Merchant Center
 * feed as `utm_source=google&utm_medium=shopping`, ads carry their own
 * utm_* and a click id. Until now none of that reached the order — the
 * admin panel could not say whether a sale came from an ad, the shop tab
 * or a Google listing. This module turns a landing URL + referrer into a
 * `Touch`, and a first/last touch pair into one `Channel` the dashboard
 * can group by.
 *
 * Pure functions only (no window, no storage) so they run and test the
 * same on the client that records touches and the server that derives
 * the channel.
 */

export interface Touch {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  /** Referrer hostname without `www.`; absent on direct visits. */
  referrer?: string;
  /** Landing pathname (no query — utm and order tokens must not persist). */
  landing?: string;
  /** Ad click id present on the landing URL. */
  click?: "fbclid" | "gclid" | "ttclid";
  /** Unix ms of the touch. */
  ts: number;
}

export interface Attribution {
  first: Touch;
  last: Touch;
}

export const CHANNELS = [
  "meta-ads",
  "meta-shop",
  "meta-organic",
  "google-ads",
  "google-shopping",
  "google-organic",
  "search",
  "etsy",
  "direct",
  "referral",
  "other",
] as const;

export type Channel = (typeof CHANNELS)[number];

const MAX = 100;

function clean(v: string | null | undefined): string | undefined {
  if (!v) return undefined;
  const s = v.trim().toLowerCase().slice(0, MAX);
  return s || undefined;
}

/** `www.` and mobile/redirect prefixes collapse so grouping stays sane. */
export function normalizeHost(host: string | undefined | null): string | undefined {
  if (!host) return undefined;
  const h = host.trim().toLowerCase().replace(/^(www|m|l|lm|mobile)\./, "");
  return h.slice(0, MAX) || undefined;
}

export function referrerHost(referrer: string | null | undefined): string | undefined {
  if (!referrer) return undefined;
  try {
    return normalizeHost(new URL(referrer).hostname);
  } catch {
    return undefined;
  }
}

/**
 * Build the touch for a page load. `ownHosts` are the site's own
 * hostnames (production + preview) — an internal referrer means the
 * visitor navigated within the site, which is not a touch.
 */
export function touchFromLocation(
  url: URL,
  referrer: string | null | undefined,
  ownHost: string,
  now: number = Date.now(),
): Touch {
  const q = url.searchParams;
  const touch: Touch = { ts: now };
  const source = clean(q.get("utm_source"));
  const medium = clean(q.get("utm_medium"));
  const campaign = clean(q.get("utm_campaign"));
  const content = clean(q.get("utm_content"));
  const term = clean(q.get("utm_term"));
  if (source) touch.source = source;
  if (medium) touch.medium = medium;
  if (campaign) touch.campaign = campaign;
  if (content) touch.content = content;
  if (term) touch.term = term;
  if (q.has("fbclid")) touch.click = "fbclid";
  else if (q.has("gclid")) touch.click = "gclid";
  else if (q.has("ttclid")) touch.click = "ttclid";
  const ref = referrerHost(referrer);
  if (ref && ref !== normalizeHost(ownHost)) touch.referrer = ref;
  touch.landing = url.pathname.slice(0, 200);
  return touch;
}

/** A touch worth replacing the last one: tagged, clicked, or external. */
export function isMeaningfulTouch(t: Touch): boolean {
  return Boolean(t.source || t.click || t.referrer);
}

const META_SOURCES = new Set(["facebook", "fb", "meta", "instagram", "ig", "an"]);
const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paid_social", "paidsocial", "ads", "ad", "social_paid"]);
const SEARCH_HOSTS = ["bing.com", "duckduckgo.com", "yahoo.com", "yandex.", "ecosia.org", "brave.com"];

function isMetaHost(h: string): boolean {
  return h.endsWith("facebook.com") || h.endsWith("instagram.com") || h === "fb.me" || h.endsWith("threads.net");
}

export function channelForTouch(t: Touch): Channel {
  const src = t.source;
  const med = t.medium ?? "";
  if (src && META_SOURCES.has(src)) {
    if (med === "shop" || med === "shops") return "meta-shop";
    if (PAID_MEDIUMS.has(med) || t.click === "fbclid") return "meta-ads";
    return "meta-organic";
  }
  if (src === "google") {
    if (med === "shopping" || med === "merchant" || med === "free_listings") return "google-shopping";
    if (PAID_MEDIUMS.has(med) || t.click === "gclid") return "google-ads";
    if (med === "organic" || !med) return "google-organic";
    return "google-ads";
  }
  if (src === "etsy") return "etsy";
  if (src) return "other";
  if (t.click === "fbclid") return "meta-ads";
  if (t.click === "gclid") return "google-ads";
  const ref = t.referrer;
  if (!ref) return "direct";
  if (isMetaHost(ref)) return "meta-organic";
  if (ref === "google.com" || ref.endsWith(".google.com") || /^google\.[a-z.]+$/.test(ref)) {
    return "google-organic";
  }
  if (ref.endsWith("etsy.com")) return "etsy";
  if (SEARCH_HOSTS.some((h) => ref.includes(h))) return "search";
  return "referral";
}

/**
 * Last click wins, as in GA4 and Ads Manager, so that an ad which brought
 * the buyer back is credited. A tagged first touch outranks an untagged
 * (direct / referral) last touch: typing the address after seeing an ad
 * is still the ad's sale.
 */
export function channelFor(a: Attribution | null | undefined): Channel {
  if (!a) return "direct";
  const last = channelForTouch(a.last);
  if (last !== "direct" && last !== "referral") return last;
  const first = channelForTouch(a.first);
  return first === "direct" ? last : first;
}

/** Trim a touch coming off the wire to what we store. */
export function sanitizeTouch(raw: unknown): Touch | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (k: string, max = MAX) =>
    typeof r[k] === "string" && (r[k] as string).trim()
      ? (r[k] as string).trim().slice(0, max)
      : undefined;
  const ts = typeof r.ts === "number" && Number.isFinite(r.ts) ? r.ts : Date.now();
  const t: Touch = { ts };
  const source = str("source"), medium = str("medium"), campaign = str("campaign");
  const content = str("content"), term = str("term"), referrer = str("referrer");
  const landing = str("landing", 200);
  if (source) t.source = source.toLowerCase();
  if (medium) t.medium = medium.toLowerCase();
  if (campaign) t.campaign = campaign;
  if (content) t.content = content;
  if (term) t.term = term;
  if (referrer) t.referrer = referrer.toLowerCase();
  if (landing) t.landing = landing;
  if (r.click === "fbclid" || r.click === "gclid" || r.click === "ttclid") t.click = r.click;
  return t;
}

export function sanitizeAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const first = sanitizeTouch(r.first);
  const last = sanitizeTouch(r.last) ?? first;
  if (!first || !last) return null;
  return { first, last };
}
