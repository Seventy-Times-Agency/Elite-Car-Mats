import "server-only";
import { notFound } from "next/navigation";
import { locale as routeLocaleParam } from "next/root-params";
import { isLocale, type Locale } from "./config";
import { dictsFor, getLocaleFromCookie, type LocaleDicts } from "./request-locale";

/**
 * The [locale] root segment of the current storefront route, or
 * undefined under /admin (its own root layout, no locale segment).
 * Reading it from the route instead of the request is what lets public
 * pages render statically per locale. App-directory server code only —
 * route handlers and emails use ./request-locale.
 */
export async function getRouteLocale(): Promise<Locale | undefined> {
  const v: string | undefined = await routeLocaleParam();
  if (v === undefined) return undefined;
  // Unreachable through src/proxy.ts, but /<anything>.<ext> skips the
  // proxy and would otherwise render the storefront under that segment.
  if (!isLocale(v)) notFound();
  return v;
}

/** Dictionary for pages and layouts (storefront and admin). */
export async function getDictionary(): Promise<LocaleDicts> {
  return dictsFor((await getRouteLocale()) ?? (await getLocaleFromCookie()));
}
