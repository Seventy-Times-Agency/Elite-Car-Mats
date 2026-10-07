import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, resolveLocale } from "@/i18n/config";
import {
  MODEL_PAGE_PATH,
  SET_VARIANT_PATH,
  isMatSetType,
} from "@/lib/mat-set-variant";

/**
 * Locale-prefix routing. Storefront routes live under src/app/[locale]
 * and are static per locale; this proxy maps the URL the visitor sees
 * onto one of those copies without changing that URL:
 *
 *   /ru/*, /uk/*  the prefix is the [locale] segment; the cookie is
 *                 synced so unprefixed in-app links stay on the
 *                 language the visitor arrived in.
 *   /en/*         308 to the unprefixed URL — EN has one canonical
 *                 address.
 *   everything    rewritten to /<locale>/* where <locale> comes from
 *   else          the cookie, then Accept-Language, then EN. Crawlers
 *                 send neither, so they always get the EN copy.
 *
 * A model page with a known `?set=` (feed deep links) is additionally
 * rewritten onto its set variant, so the cached HTML a crawler gets
 * carries that set's price. Other query params never split the cache.
 */
export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const seg = pathname.split("/")[1] ?? "";

  if (seg === "en") {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice("/en".length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const prefixed = seg === "ru" || seg === "uk";
  const path = prefixed ? pathname.slice(seg.length + 1) || "/" : pathname;

  const direct = SET_VARIANT_PATH.exec(path);
  if (direct) {
    const url = req.nextUrl.clone();
    url.pathname = prefixed ? `/${seg}${direct[1]}` : direct[1];
    url.searchParams.set("set", direct[2]);
    return NextResponse.redirect(url, 308);
  }

  const set = searchParams.get("set");
  const target =
    MODEL_PAGE_PATH.test(path) && isMatSetType(set) ? `${path}/set/${set}` : path;

  let res: NextResponse;
  if (prefixed && target === path) {
    res = NextResponse.next();
  } else {
    const locale = prefixed
      ? seg
      : resolveLocale(
          req.cookies.get(LOCALE_COOKIE)?.value,
          req.headers.get("accept-language"),
        );
    const url = req.nextUrl.clone();
    url.pathname = target === "/" ? `/${locale}` : `/${locale}${target}`;
    res = NextResponse.rewrite(url);
  }

  if (prefixed && req.cookies.get(LOCALE_COOKIE)?.value !== seg) {
    res.cookies.set(LOCALE_COOKIE, seg, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  // Pages only: skip API routes, Next/Vercel internals, the admin area,
  // the root metadata image routes (they live outside [locale]) and any
  // file-looking path (sitemap.xml, robots.txt, images, fonts).
  matcher: [
    "/((?!api|_next|_vercel|admin|icon|apple-icon|opengraph-image|.*\\..*).*)",
  ],
};
