import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/i18n/config";

/**
 * Locale-prefix routing. The app's routes live unprefixed (= English);
 * /ru/* and /uk/* are rewritten onto the same routes with an `x-locale`
 * request header that getDictionary treats as the highest-priority
 * locale source. The URL the visitor (and Googlebot) sees keeps the
 * prefix, so every page exists at three indexable addresses with
 * hreflang alternates pointing between them.
 *
 * /en/* redirects (308) to the unprefixed URL so the default locale has
 * exactly one canonical address.
 *
 * `x-pathname` carries the unprefixed route path to generateMetadata so
 * the root layout can emit a correct per-page canonical + hreflang set.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1] ?? "";

  if (seg === "en") {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice("/en".length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const requestHeaders = new Headers(req.headers);

  if (seg === "ru" || seg === "uk") {
    const stripped = pathname.slice(seg.length + 1) || "/";
    requestHeaders.set("x-locale", seg);
    requestHeaders.set("x-pathname", stripped);
    const url = req.nextUrl.clone();
    url.pathname = stripped;
    const res = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    // Sync the cookie so unprefixed in-app navigation stays on the
    // language the visitor arrived in.
    if (req.cookies.get(LOCALE_COOKIE)?.value !== seg) {
      res.cookies.set(LOCALE_COOKIE, seg, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return res;
  }

  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Pages only: skip API routes, Next internals, the admin area and any
  // file-looking path (sitemap.xml, robots.txt, images, fonts).
  matcher: ["/((?!api|_next|admin|.*\\..*).*)"],
};
