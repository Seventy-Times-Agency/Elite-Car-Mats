import "server-only";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-path";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

/**
 * Build the Metadata `alternates` block for a page: a locale-aware
 * canonical (the /ru//uk address points at itself, not at the EN page)
 * plus the full hreflang set so Google indexes all three language
 * versions for the same content. `path` is the UNPREFIXED route path
 * ("/catalog/bmw"); the active locale comes from the `x-locale` header
 * set by src/proxy.ts.
 *
 * x-default points at the EN page — the right answer for everyone whose
 * browser language we don't serve.
 */
export async function localeAlternates(path: string): Promise<{
  canonical: string;
  languages: Record<string, string>;
}> {
  let locale: Locale = DEFAULT_LOCALE;
  try {
    const v = (await headers()).get("x-locale");
    if (isLocale(v)) locale = v;
  } catch {
    // Outside a request scope (build-time OG generation) — EN canonical.
  }
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
