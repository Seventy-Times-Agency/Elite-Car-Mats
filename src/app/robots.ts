import { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Allow the catalog + the Google Shopping feed; everything
        // else under /api stays disallowed.
        allow: ["/", "/api/feed.xml"],
        disallow: ["/admin", "/api", "/order/", "/cart", "/checkout"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
