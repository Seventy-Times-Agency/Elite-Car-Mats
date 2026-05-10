import "server-only";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  pickLocaleFromAcceptLanguage,
  type Locale,
} from "./config";
import { ru } from "./dictionaries/ru";
import { en } from "./dictionaries/en";
import { uk } from "./dictionaries/uk";
import type { Dict } from "./dictionary";

const DICTS: Record<Locale, Dict> = { ru, en, uk };

/**
 * Resolve the active locale for the current request:
 *
 *   1. If the visitor has a valid `LOCALE_COOKIE` set (they picked a
 *      language manually via the header switcher) — use that.
 *   2. Otherwise look at the browser's `Accept-Language` header. A
 *      Russian-speaking diaspora visitor still lands on RU; everyone
 *      else lands on EN.
 *   3. If neither yields a supported locale, fall back to
 *      `DEFAULT_LOCALE` (English).
 */
export async function getLocaleFromCookie(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(v)) return v;
  // No (valid) cookie — derive from the browser's Accept-Language.
  try {
    const h = await headers();
    return pickLocaleFromAcceptLanguage(h.get("accept-language"));
  } catch {
    // headers() can throw outside a request scope (e.g. during OG image
    // generation at build). Falling through to the default keeps those
    // paths working.
    return DEFAULT_LOCALE;
  }
}

export function getDictionaryFor(locale: Locale): Dict {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}

export async function getDictionary(): Promise<{
  locale: Locale;
  dict: Dict;
  fallback: Dict;
}> {
  const locale = await getLocaleFromCookie();
  return { locale, dict: getDictionaryFor(locale), fallback: DICTS[DEFAULT_LOCALE] };
}
