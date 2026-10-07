import "server-only";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getRouteLocale } from "@/i18n/getDictionary";
import { localizePath } from "@/i18n/locale-path";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

/**
 * Build the Metadata `alternates` block for a page: a locale-aware
 * canonical (the /ru//uk address points at itself, not at the EN page)
 * plus the full hreflang set so Google indexes all three language
 * versions for the same content. `path` is the UNPREFIXED route path
 * ("/catalog/bmw"); the active locale is the route's [locale] segment.
 * Every public page and layout must pass its own path — the root layout
 * can't know it once pages are static.
 *
 * x-default points at the EN page — the right answer for everyone whose
 * browser language we don't serve.
 */
export async function localeAlternates(path: string): Promise<{
  canonical: string;
  languages: Record<string, string>;
}> {
  const locale = (await getRouteLocale()) ?? DEFAULT_LOCALE;
  const abs = (l: Locale) => `${SITE}${localizePath(path, l)}`;
  return {
    canonical: abs(locale),
    languages: {
      en: abs("en"),
      ru: abs("ru"),
      uk: abs("uk"),
      "x-default": abs("en"),
    },
  };
}
