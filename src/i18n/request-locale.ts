import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { ru } from "./dictionaries/ru";
import { en } from "./dictionaries/en";
import { uk } from "./dictionaries/uk";
import type { Dict } from "./dictionary";

// Kept apart from getDictionary.ts: that module reads `next/root-params`,
// which Next only allows inside the app directory, and this one is also
// reached from route handlers, email templates and instrumentation.

const DICTS: Record<Locale, Dict> = { ru, en, uk };

export interface LocaleDicts {
  locale: Locale;
  dict: Dict;
  fallback: Dict;
}

export function getDictionaryFor(locale: Locale): Dict {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}

export function dictsFor(locale: Locale): LocaleDicts {
  return { locale, dict: getDictionaryFor(locale), fallback: DICTS[DEFAULT_LOCALE] };
}

/**
 * Locale for a request that has no route locale: /admin (its own root
 * layout, no [locale] segment), route handlers and email rendering.
 * Same rule src/proxy.ts applies to an unprefixed storefront URL — a
 * valid `LOCALE_COOKIE` (set by the header switcher or by visiting a
 * /ru or /uk URL), else the browser's `Accept-Language`, else EN.
 */
export async function getLocaleFromCookie(): Promise<Locale> {
  const store = await cookies();
  let acceptLanguage: string | null = null;
  try {
    acceptLanguage = (await headers()).get("accept-language");
  } catch {
    // Outside a request scope — fall through to the default.
  }
  return resolveLocale(store.get(LOCALE_COOKIE)?.value, acceptLanguage);
}

/** Dictionary for route handlers and emails, where no route locale exists. */
export async function getRequestDictionary(): Promise<LocaleDicts> {
  return dictsFor(await getLocaleFromCookie());
}
