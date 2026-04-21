import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { ru } from "./dictionaries/ru";
import { en } from "./dictionaries/en";
import { uk } from "./dictionaries/uk";
import type { Dict } from "./dictionary";

const DICTS: Record<Locale, Dict> = { ru, en, uk };

export async function getLocaleFromCookie(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
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
