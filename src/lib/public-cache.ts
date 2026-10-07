import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Time ceiling for the data caches behind public pages (catalog, price
 * overrides, availability, reviews, blog). Freshness comes from the
 * `revalidateTag` calls in the admin save routes; this is only the
 * backstop for a missed invalidation. It also caps the ISR window of
 * every page that reads one of these caches (Next takes the lowest
 * `revalidate` seen during the render), which is why it is long: with
 * an hour, nearly every crawler hit on the ~8K catalog URLs would land
 * on a stale page and regenerate it.
 */
export const PUBLIC_DATA_TTL = 7 * 24 * 60 * 60;

// How soon a page rendered from fallback data retries the database.
const DEGRADED_TTL = 5 * 60;

const DEGRADED = Symbol.for("elitecarmats.degraded-public-read");

interface Degraded<T> {
  [DEGRADED]: true;
  fallback: T;
}

/**
 * Throw from inside an `unstable_cache` loader when the database read
 * failed and the loader would otherwise return its fallback. A throw is
 * never stored, so the fallback can't outlive the outage by a week —
 * and if a stale real value exists, Next keeps serving that instead.
 */
export function degraded<T>(fallback: T): Degraded<T> {
  return { [DEGRADED]: true, fallback };
}

function isDegraded(err: unknown): err is Degraded<unknown> {
  return typeof err === "object" && err !== null && DEGRADED in err;
}

// Any unstable_cache read lowers the current page's revalidate to its
// own; this one exists only for that side effect.
const shortenPageRevalidate = unstable_cache(
  async () => true,
  ["degraded-render-marker"],
  { revalidate: DEGRADED_TTL },
);

/**
 * Run a cached public loader that throws `degraded(fallback)` on DB
 * failure. Returns the fallback and cuts the page's ISR window to a few
 * minutes, so a page built during a blip doesn't keep code-default
 * prices or a code-only catalog for the full TTL.
 */
export async function readPublicCache<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (err) {
    if (!isDegraded(err)) throw err;
    await shortenPageRevalidate();
    return err.fallback as T;
  }
}
