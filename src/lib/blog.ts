import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { PUBLIC_DATA_TTL } from "@/lib/public-cache";
import type { Locale } from "@/i18n/config";

/**
 * Blog posts change only when an operator saves one, so every public
 * read below has a cached twin. Tag is `blog`; admin/blog POST, PATCH
 * and DELETE call `revalidateTag("blog")`.
 *
 * Ceiling is the shared public-data week (lib/public-cache.ts). It must
 * never drop below an hour because of Neon's scale-to-zero arithmetic —
 * see the note in lib/reviews/public.ts: every cache expiry wakes the
 * compute for ~5 minutes. Publishing stays instant regardless, because
 * the admin routes call `revalidateTag("blog")`.
 *
 * NOTE ON FAILURES: unlike reviews, these loaders deliberately keep
 * propagating real DB errors (only a missing table degrades to empty).
 * A 500 tells crawlers "retry later", whereas a 200 with an empty list
 * invites Google to deindex the posts. The consequence is that a DB
 * outage is NOT absorbed by this cache — throws are never stored, so
 * /blog keeps retrying Postgres while Neon is down. That is the
 * intended trade-off, not an oversight.
 */
const BLOG_TTL = PUBLIC_DATA_TTL;

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

/* ------------------------------------------------------------------ *
 * Cached wrappers
 *
 * `unstable_cache` serialises through JSON, which turns every Date into
 * a string. Each wrapper below caches the ISO form and revives the Date
 * on the way out, so call sites keep the exact types they had before —
 * `post.updatedAt.toISOString()` in the article JSON-LD and
 * `p.updatedAt` as sitemap `lastModified` both still receive real Dates.
 * ------------------------------------------------------------------ */

const listPublishedPostsCacheable = unstable_cache(
  async (locale: Locale) => {
    const rows = await listPublishedPosts(locale);
    return rows.map((r) => ({
      ...r,
      publishedAt: r.publishedAt?.toISOString() ?? null,
    }));
  },
  ["blog-list-v1"],
  { tags: ["blog"], revalidate: BLOG_TTL },
);

export async function listPublishedPostsCached(locale: Locale) {
  const rows = await listPublishedPostsCacheable(locale);
  return rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt ? new Date(r.publishedAt) : null,
  }));
}

const getPublishedPostCacheable = unstable_cache(
  async (slug: string, locale: Locale) => {
    const post = await getPublishedPost(slug, locale);
    if (!post) return null;
    return {
      ...post,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  ["blog-post-v1"],
  { tags: ["blog"], revalidate: BLOG_TTL },
);

export async function getPublishedPostCached(slug: string, locale: Locale) {
  const post = await getPublishedPostCacheable(slug, locale);
  if (!post) return null;
  return {
    ...post,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  };
}

const listAllPublishedSlugsCacheable = unstable_cache(
  async () => {
    const rows = await listAllPublishedSlugs();
    return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }));
  },
  ["blog-slugs-v1"],
  { tags: ["blog"], revalidate: BLOG_TTL },
);

export async function listAllPublishedSlugsCached() {
  const rows = await listAllPublishedSlugsCacheable();
  return rows.map((r) => ({ ...r, updatedAt: new Date(r.updatedAt) }));
}
