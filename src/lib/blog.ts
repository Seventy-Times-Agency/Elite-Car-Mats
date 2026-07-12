import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/i18n/config";

/**
 * The public blog must degrade to "no posts" rather than a 500 when the
 * Post table hasn't been created yet (fresh database before the first
 * admin login runs ensureSchema). Prisma raises P2021 for a missing
 * table — anything else is a real failure and still propagates.
 */
function isMissingTable(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "P2021"
  );
}

/**
 * Public-facing blog query. Always filters to published posts and to
 * those whose locale matches the visitor (or has no locale at all).
 * Newest first by publishedAt, then by createdAt as a stable tiebreak.
 */
export async function listPublishedPosts(locale: Locale) {
  try {
    return await prisma.post.findMany({
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
  } catch (err) {
    if (isMissingTable(err)) return [];
    throw err;
  }
}

export async function getPublishedPost(slug: string, locale: Locale) {
  let post;
  try {
    post = await prisma.post.findUnique({
      where: { slug },
    });
  } catch (err) {
    if (isMissingTable(err)) return null;
    throw err;
  }
  if (!post || !post.published) return null;
  if (post.locale && post.locale !== locale) return null;
  return post;
}

/** Used by sitemap.ts — every public-visible post URL. */
export async function listAllPublishedSlugs() {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, locale: true },
    });
  } catch (err) {
    if (isMissingTable(err)) return [];
    throw err;
  }
}
