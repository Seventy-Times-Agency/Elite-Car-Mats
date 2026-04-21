export const LOCALES = ["ru", "en", "uk"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "ecm_locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  uk: "Українська",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  ru: "RU",
  en: "EN",
  uk: "UA",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  ru: "ru",
  en: "en",
  uk: "uk",
};

export const LOCALE_OG: Record<Locale, string> = {
  ru: "ru_RU",
  en: "en_US",
  uk: "uk_UA",
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}
