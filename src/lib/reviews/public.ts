import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { PUBLIC_DATA_TTL, degraded, readPublicCache } from "@/lib/public-cache";

/**
 * Public review reads for the home-page strip and /reviews.
 *
 * These were the single biggest source of Neon compute burn: the home
 * page ran `review.findMany` + `review.aggregate` on EVERY render, and
 * /reviews pulled 50 rows the same way. With no page-level cache and
 * ~900 visits/week plus bots, Neon's compute never idled down and the
 * free-tier quota went to zero on 2026-08-29 — taking the admin, the
 * order API and the blog down with it.
 *
 * Reviews only change when an operator approves or edits one, so they
 * cache well. Tag is `reviews`; admin/reviews PATCH+DELETE call
 * `revalidateTag("reviews")`.
 *
 * The TTL must never go BELOW an hour (it is a week now, see
 * lib/public-cache.ts). The binding constraint is not freshness, it is
 * Neon's scale-to-zero:
 *
 *   Free tier gives 100 CU-hours/month. The smallest compute is
 *   0.25 CU, so a compute that never sleeps costs 0.25 * 24 * 30 =
 *   180 CU-hours — over the cap on an idle database, at any traffic
 *   level. The compute therefore HAS to spend most of the day
 *   suspended, and Neon suspends only after 5 minutes without a
 *   query.
 *
 *   Every cache expiry is a wake-up that costs ~5 minutes of compute.
 *   At a 10-minute TTL that is ~144 wake-ups/day ~= 90 CU-hours/month
 *   — still on the edge. At an hour it is ~24 wake-ups/day ~= 18
 *   CU-hours/month, a five-fold margin.
 *
 * Freshness does not pay for this: admin approve/edit/delete calls
 * `revalidateTag("reviews")`, so operator changes land immediately and
 * the TTL is only a backstop for a missed invalidation.
 *
 * The loaders fail SOFT (empty result, never a throw) so a DB outage
 * degrades to "no reviews yet" rather than a 500. The empty result is
 * not cached: the page that got it retries within minutes, while a
 * stale real result, if there is one, keeps being served instead.
 */

export interface HomeReview {
  id: string;
  customerName: string;
  carModel: string;
  text: string;
  rating: number;
  verified: boolean;
}

export interface HomeReviewsData {
  reviews: HomeReview[];
  total: number;
  avg: number;
}

export interface PublicReview extends HomeReview {
  photos: string[];
  /** ISO string — `unstable_cache` JSON-round-trips Date into one anyway. */
  createdAt: string;
}

const EMPTY_HOME: HomeReviewsData = { reviews: [], total: 0, avg: 0 };

/**
 * Three newest approved reviews plus the count/average for the rating
 * summary. Returns EMPTY_HOME on any DB failure — the caller renders
 * nothing rather than blowing up the whole home page.
 */
const getHomeReviewsCacheable = unstable_cache(
  async (): Promise<HomeReviewsData> => {
    try {
      const [rows, agg] = await Promise.all([
        prisma.review.findMany({
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            customerName: true,
            carModel: true,
            text: true,
            rating: true,
            verified: true,
          },
        }),
        prisma.review.aggregate({
          where: { approved: true },
          _count: { _all: true },
          _avg: { rating: true },
        }),
      ]);
      return {
        reviews: rows,
        total: agg._count._all,
        avg: agg._avg.rating ?? 0,
      };
    } catch (err) {
      console.error("[home-reviews] load failed:", err);
      throw degraded(EMPTY_HOME);
    }
  },
  ["home-reviews-v1"],
  { tags: ["reviews"], revalidate: PUBLIC_DATA_TTL },
);

export function getHomeReviews(): Promise<HomeReviewsData> {
  return readPublicCache(getHomeReviewsCacheable);
}

/** Newest 50 approved reviews for the public /reviews page. */
const listPublicReviewsCacheable = unstable_cache(
  async (): Promise<PublicReview[]> => {
    try {
      const rows = await prisma.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          customerName: true,
          carModel: true,
          text: true,
          rating: true,
          verified: true,
          photos: true,
          createdAt: true,
        },
      });
      return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
    } catch (err) {
      console.error("[reviews] load failed:", err);
      throw degraded<PublicReview[]>([]);
    }
  },
  ["public-reviews-v1"],
  { tags: ["reviews"], revalidate: PUBLIC_DATA_TTL },
);

export function listPublicReviews(): Promise<PublicReview[]> {
  return readPublicCache(listPublicReviewsCacheable);
}
