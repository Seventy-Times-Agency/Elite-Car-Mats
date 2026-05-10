export const LOCALES = ["en", "ru", "uk"] as const;
export type Locale = (typeof LOCALES)[number];

// English is the default — the storefront ships to a US audience.
// Russian and Ukrainian are opt-in for the diaspora.
export const DEFAULT_LOCALE: Locale = "en";

// Cookie name is versioned. Bumped from `ecm_locale` to `_v2` when the
// default flipped from RU to EN — visitors with the old cookie set to
// "ru" would otherwise stay on Russian forever. The new name forces a
// re-detection (Accept-Language fallback below) on the next request.
export const LOCALE_COOKIE = "ecm_locale_v2";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uk: "Українська",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  uk: "UA",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  ru: "ru",
  uk: "uk",
};

export const LOCALE_OG: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_RU",
  uk: "uk_UA",
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

/**
 * Pick the best-matching locale from a browser Accept-Language header.
 * Used as a fallback when the visitor doesn't have a locale cookie set
 * yet — so a Russian-speaking visitor lands on RU automatically, while
 * everyone else (including the bulk of US traffic) lands on EN.
 *
 * Algorithm: parse `Accept-Language: ru-RU,ru;q=0.9,en;q=0.8` into
 * (tag, quality) pairs sorted by q desc, then for each tag check its
 * primary subtag against our supported locales. First match wins.
 */
export function pickLocaleFromAcceptLanguage(
  header: string | null | undefined,
): Locale {
  if (!header) return DEFAULT_LOCALE;
  const parts = header.split(",").map((p) => p.trim()).filter(Boolean);
  type Pref = { tag: string; q: number };
  const prefs: Pref[] = [];
  for (const part of parts) {
    const [tagRaw, ...params] = part.split(";").map((s) => s.trim());
    if (!tagRaw) continue;
    let q = 1;
    for (const param of params) {
      const m = param.match(/^q=([0-9.]+)$/);
      if (m) q = Number(m[1]);
    }
    prefs.push({ tag: tagRaw.toLowerCase(), q: Number.isFinite(q) ? q : 0 });
  }
  prefs.sort((a, b) => b.q - a.q);
  for (const { tag } of prefs) {
    const primary = tag.split("-")[0];
    if (primary === "uk") return "uk";
    if (primary === "ru") return "ru";
    if (primary === "en") return "en";
  }
  return DEFAULT_LOCALE;
}
