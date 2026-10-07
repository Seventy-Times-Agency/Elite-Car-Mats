import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

/**
 * URL-prefix helpers for locale-aware routing. EN is the unprefixed
 * default (elitecarmats.us/catalog); RU and UK live under /ru and /uk
 * (elitecarmats.us/ru/catalog). These helpers are the only place that
 * knows the prefix convention.
 */

/**
 * Split a pathname into its locale prefix (or null when unprefixed) and
 * the locale-free route path.
 * "/ru/catalog/bmw" → { locale: "ru", path: "/catalog/bmw" }
 * "/catalog/bmw"    → { locale: null, path: "/catalog/bmw" }
 * "/en/catalog/bmw" → { locale: "en", path: "/catalog/bmw" } — never a
 * browser URL, but it is what usePathname() returns while a page that
 * src/proxy.ts rewrote onto src/app/[locale] is rendered on the server.
 */
export function splitLocaleFromPath(pathname: string): {
  locale: Locale | null;
  path: string;
} {
  const seg = pathname.split("/")[1] ?? "";
  if (isLocale(seg)) {
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
