import { MetadataRoute } from "next";
import { listAllPublishedSlugs } from "@/lib/blog";
import { getMergedCatalog } from "@/lib/catalog-merge";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { brands, models } = await getMergedCatalog();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/catalog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contacts`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/track`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE}/delivery`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE}/warranty`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE}/catalog/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const modelPages: MetadataRoute.Sitemap = models.map((m) => {
    const brand = brands.find((b) => b.id === m.brandId);
    return {
      url: `${SITE}/catalog/${brand?.slug ?? m.brandId}/${m.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  // Blog posts. Wrapped in try/catch so a DB outage during sitemap
  // generation doesn't break the catalog half — Google's crawler will
  // re-fetch later and pick the posts up next pass.
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await listAllPublishedSlugs();
    postPages = posts.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.55,
    }));
  } catch (err) {
    console.warn("[sitemap] blog query failed:", err);
  }

  return [...staticPages, ...brandPages, ...modelPages, ...postPages];
}
