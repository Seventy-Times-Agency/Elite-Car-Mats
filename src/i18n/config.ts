export const LOCALES = ["en", "ru", "uk"] as const;
export type Locale = (typeof LOCALES)[number];

// English is the default — the storefront ships to a US audience.
// Russian and Ukrainian are opt-in for the diaspora.
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "ecm_locale";

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
