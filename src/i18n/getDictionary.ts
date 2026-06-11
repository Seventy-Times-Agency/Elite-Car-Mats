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
 *   1. `x-locale` header injected by src/proxy.ts when the visitor is on
 *      a /ru/* or /uk/* URL — the URL prefix always wins so a crawler
 *      (or a shared link) renders the language the address promises.
 *   2. A valid `LOCALE_COOKIE` (the visitor picked a language manually
 *      via the header switcher).
 *   3. The browser's `Accept-Language` header. A Russian-speaking
 *      diaspora visitor still lands on RU; everyone else lands on EN.
 *   4. `DEFAULT_LOCALE` (English).
 */
export async function getLocaleFromCookie(): Promise<Locale> {
  try {
    const h = await headers();
    const forced = h.get("x-locale");
    if (isLocale(forced)) return forced;
  } catch {
    // headers() can throw outside a request scope (e.g. during OG image
    // generation at build) — fall through to the cookie/default below.
  }
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(v)) return v;
  // No (valid) cookie — derive from the browser's Accept-Language.
  try {
    const h = await headers();
    return pickLocaleFromAcceptLanguage(h.get("accept-language"));
  } catch {
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
