import { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

export default function robots(): MetadataRoute.Robots {
  // Private/transactional routes exist at the unprefixed URL and under
  // the /ru and /uk locale prefixes (src/proxy.ts) — block all three.
  const privatePaths = ["/order/", "/cart", "/checkout"];
  const localized = privatePaths.flatMap((p) => [p, `/ru${p}`, `/uk${p}`]);
  return {
    rules: [
      {
        userAgent: "*",
        // Allow the catalog + the Google Shopping feed; everything
        // else under /api stays disallowed.
        allow: ["/", "/api/feed.xml"],
        disallow: ["/admin", "/api", ...localized],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
