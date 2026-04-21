import { MetadataRoute } from "next";
import { brands, mockModels } from "@/data/mock";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/catalog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
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

  const modelPages: MetadataRoute.Sitemap = mockModels.map((m) => {
    const brand = brands.find((b) => b.id === m.brandId);
    return {
      url: `${SITE}/catalog/${brand?.slug ?? m.brandId}/${m.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  return [...staticPages, ...brandPages, ...modelPages];
}
