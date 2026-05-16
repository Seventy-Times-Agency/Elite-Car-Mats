import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { MatSetType } from "@/types";
import type { VehicleConfigProfile } from "@/lib/vehicle-profile";

/**
 * Map keyed by `${profile}:${matSet}` → admin-set USD price.
 * Empty map = no overrides; `lib/pricing.ts` falls back to the
 * code-based table in `src/data/catalog/mat-sets.ts`.
 */
export type PriceOverrideMap = Map<string, number>;

export const priceOverrideKey = (
  profile: VehicleConfigProfile,
  type: MatSetType,
): string => `${profile}:${type}`;

/**
 * Load every active price override row from Postgres into a flat
 * Map. Always returns a Map — callers can pass through to
 * `calculateItemUnitPrice` without a null check. On DB error we
 * log + return empty so a Neon outage falls back to code defaults
 * rather than blocking checkout.
 */
export async function loadPriceOverrides(): Promise<PriceOverrideMap> {
  try {
    const rows = await prisma.matSetPriceOverride.findMany({
      select: { profile: true, matSet: true, price: true },
    });
    const map: PriceOverrideMap = new Map();
    for (const r of rows) {
      map.set(`${r.profile}:${r.matSet}`, Number(r.price ?? 0));
    }
    return map;
  } catch (err) {
    console.warn("[pricing-overrides] load failed, using code defaults:", err);
    return new Map();
  }
}

/**
 * Internal: load overrides as a JSON-serialisable entries array so it
 * survives `unstable_cache`'s JSON round-trip (Maps lose their methods
 * across the cache boundary — see #checkout-failure).
 */
const loadPriceOverrideEntriesCached = unstable_cache(
  async (): Promise<[string, number][]> => {
    const map = await loadPriceOverrides();
    return Array.from(map.entries());
  },
  ["pricing-overrides-v2"],
  { tags: ["pricing"], revalidate: 3600 },
);

/**
 * Cached wrapper for display-only read paths (feed.xml, product page
 * metadata). Billing paths — /api/orders, /api/checkout/stripe,
 * /api/webhooks/stripe, shipstation/create-order — keep using the raw
 * function so any admin override is reflected on the next charge.
 * Tag is `pricing`; admin/pricing POST calls revalidateTag("pricing").
 *
 * `unstable_cache` serialises return values through JSON, so we cache
 * the entries array and rebuild the Map after each cache hit. Map
 * survival across the cache boundary is the difference between
 * `getMatSetPrice(profile, type, overrides)` working and tripping
 * `overrides.get is not a function` at metadata-generation time on
 * the catalog product page.
 */
export async function loadPriceOverridesCached(): Promise<PriceOverrideMap> {
  const entries = await loadPriceOverrideEntriesCached();
  return new Map(entries);
}
