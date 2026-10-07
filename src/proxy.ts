import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, resolveLocale } from "@/i18n/config";

/**
 * Locale-prefix routing. Storefront routes live under src/app/[locale]
 * and are prerendered once per locale; this proxy maps the URL the
 * visitor sees onto one of those copies without changing that URL:
 *
 *   /ru/*, /uk/*  served as-is (the prefix is the [locale] segment);
 *                 the cookie is synced so unprefixed in-app links stay
 *                 on the language the visitor arrived in.
 *   /en/*         308 to the unprefixed URL — EN has one canonical
 *                 address.
 *   everything    rewritten to /<locale>/* where <locale> comes from
 *   else          the cookie, then Accept-Language, then EN. Crawlers
 *                 send neither, so they always get the EN copy.
 *
 * Rewriting (not redirecting) keeps unprefixed URLs serving RU/UK to
 * visitors who chose that language, exactly as before the routes moved.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1] ?? "";

  if (seg === "en") {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice("/en".length) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (seg === "ru" || seg === "uk") {
    const res = NextResponse.next();
    if (req.cookies.get(LOCALE_COOKIE)?.value !== seg) {
      res.cookies.set(LOCALE_COOKIE, seg, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return res;
  }

  const locale = resolveLocale(
    req.cookies.get(LOCALE_COOKIE)?.value,
    req.headers.get("accept-language"),
  );
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Pages only: skip API routes, Next/Vercel internals, the admin area,
  // the root metadata image routes (they live outside [locale]) and any
  // file-looking path (sitemap.xml, robots.txt, images, fonts).
  matcher: [
    "/((?!api|_next|_vercel|admin|icon|apple-icon|opengraph-image|.*\\..*).*)",
  ],
};
