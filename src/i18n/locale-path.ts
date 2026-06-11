import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * URL-prefix helpers for locale-aware routing. EN is the unprefixed
 * default (elitecarmats.us/catalog); RU and UK live under /ru and /uk
 * (elitecarmats.us/ru/catalog). The proxy rewrites prefixed URLs onto
 * the unprefixed routes, so these helpers are the only place that knows
 * the prefix convention.
 */

const PREFIXED_LOCALES = ["ru", "uk"] as const;
type PrefixedLocale = (typeof PREFIXED_LOCALES)[number];

function isPrefixedLocale(s: string): s is PrefixedLocale {
  return (PREFIXED_LOCALES as readonly string[]).includes(s);
}

/**
 * Split a browser pathname into its locale prefix (or null for the
 * unprefixed default) and the route path the app actually renders.
 * "/ru/catalog/bmw" → { locale: "ru", path: "/catalog/bmw" }
 * "/catalog/bmw"    → { locale: null, path: "/catalog/bmw" }
 */
export function splitLocaleFromPath(pathname: string): {
  locale: Locale | null;
  path: string;
} {
  const seg = pathname.split("/")[1] ?? "";
  if (isPrefixedLocale(seg)) {
    return { locale: seg, path: pathname.slice(seg.length + 1) || "/" };
  }
  return { locale: null, path: pathname };
}

/**
 * Prefix an unprefixed route path for the given locale.
 * ("/catalog", "ru") → "/ru/catalog";  ("/", "uk") → "/uk";
 * ("/catalog", "en") → "/catalog".
 */
export function localizePath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
