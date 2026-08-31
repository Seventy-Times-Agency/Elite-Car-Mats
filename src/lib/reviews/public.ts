import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

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
 * TTL MUST stay at an hour, matching the catalog. The binding
 * constraint is not freshness, it is Neon's scale-to-zero:
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
 * degrades to "no reviews yet" rather than a 500. That empty result is
 * cached like any other, so a blip can hide real reviews until the next
 * approval or the hour is up — accepted deliberately, as the
 * alternative is burning the quota and taking the whole shop down.
 */
const REVIEWS_TTL = 3600;

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
export const getHomeReviews = unstable_cache(
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
      return EMPTY_HOME;
    }
  },
  ["home-reviews-v1"],
  { tags: ["reviews"], revalidate: REVIEWS_TTL },
);

/** Newest 50 approved reviews for the public /reviews page. */
export const listPublicReviews = unstable_cache(
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
      return [];
    }
  },
  ["public-reviews-v1"],
  { tags: ["reviews"], revalidate: REVIEWS_TTL },
);
