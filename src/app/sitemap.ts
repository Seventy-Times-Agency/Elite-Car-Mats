import { MetadataRoute } from "next";
import { listAllPublishedSlugs } from "@/lib/blog";
import { getMergedCatalogCached } from "@/lib/catalog-merge";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

// 1h revalidate ceiling — the catalog itself almost never changes, and
// the cached catalog merge is the same shape on every regen, so the
// only reason to recompute is to pick up new blog posts. Googlebot
// re-fetches anyway, but this keeps a single bot poke cheap.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { brands, models } = await getMergedCatalogCached();
  // O(1) brand-slug lookup instead of a 700-deep `find` per model
  // (that was 60 × 700 = 42k comparisons every sitemap fetch).
  const brandSlugById = new Map(brands.map((b) => [b.id, b.slug] as const));

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
    const brandSlug = brandSlugById.get(m.brandId) ?? m.brandId;
    return {
      url: `${SITE}/catalog/${brandSlug}/${m.slug}`,
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
