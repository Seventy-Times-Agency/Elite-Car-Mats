import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/i18n/config";

/**
 * Public-facing blog query. Always filters to published posts and to
 * those whose locale matches the visitor (or has no locale at all).
 * Newest first by publishedAt, then by createdAt as a stable tiebreak.
 */
export async function listPublishedPosts(locale: Locale) {
  return prisma.post.findMany({
    where: {
      published: true,
      OR: [{ locale }, { locale: null }],
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      locale: true,
    },
  });
}

export async function getPublishedPost(slug: string, locale: Locale) {
  const post = await prisma.post.findUnique({
    where: { slug },
  });
  if (!post || !post.published) return null;
  if (post.locale && post.locale !== locale) return null;
  return post;
}

/** Used by sitemap.ts — every public-visible post URL. */
export async function listAllPublishedSlugs() {
  return prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true, locale: true },
  });
}
