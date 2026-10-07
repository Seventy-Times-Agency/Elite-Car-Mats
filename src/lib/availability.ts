import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { PUBLIC_DATA_TTL, degraded, readPublicCache } from "@/lib/public-cache";

/**
 * Operator-controlled stock availability for configurator add-ons.
 * Stored in the StoreSetting key/value table so flipping a switch in
 * the admin applies to the storefront and the order API immediately,
 * without a redeploy.
 *
 * Reads fail OPEN (everything available): a transient DB blip must not
 * silently strip paid add-ons from the storefront.
 */

export interface AddonAvailability {
  /** Metal brand-logo plates. */
  badges: boolean;
  /** Aluminum driver-side heel pad. */
  heelPad: boolean;
  /** EVA trunk organizer (accessory, sold standalone and as a cross-sell). */
  organizer: boolean;
}

const KEYS: Record<keyof AddonAvailability, string> = {
  badges: "addon.badges.available",
  heelPad: "addon.heelPad.available",
  organizer: "accessory.trunk-organizer.available",
};

const ALL_AVAILABLE: AddonAvailability = {
  badges: true,
  heelPad: true,
  organizer: true,
};

export async function getAddonAvailability(): Promise<AddonAvailability> {
  try {
    return await queryAddonAvailability();
  } catch (err) {
    console.warn("[availability] read failed, defaulting to available:", err);
    return ALL_AVAILABLE;
  }
}

async function queryAddonAvailability(): Promise<AddonAvailability> {
  const rows = await prisma.storeSetting.findMany({
    where: { key: { in: Object.values(KEYS) } },
    select: { key: true, value: true },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    badges: map.get(KEYS.badges) !== "0",
    heelPad: map.get(KEYS.heelPad) !== "0",
    organizer: map.get(KEYS.organizer) !== "0",
  };
}

/**
 * Cached wrapper for the DISPLAY path only — the public product page
 * asked Postgres for two key/value rows on every single view.
 *
 * Mirrors the split already used for price overrides: anything that
 * decides what a customer is actually charged or shipped — /api/orders
 * above all — keeps calling `getAddonAvailability` directly, so an
 * operator switching an add-on off blocks the very next order instead
 * of the next cache window. Showing a just-disabled add-on for a few
 * minutes is cosmetic; selling one is not.
 *
 * Tag is `availability`; admin/availability POST calls
 * `revalidateTag("availability")`, so the storefront updates on save
 * anyway and the TTL is only a backstop (see lib/public-cache.ts).
 *
 * The plain object here survives `unstable_cache`'s JSON round-trip
 * unchanged — no Maps, Sets or Dates to revive.
 */
const getAddonAvailabilityCacheable = unstable_cache(
  async (): Promise<AddonAvailability> => {
    try {
      return await queryAddonAvailability();
    } catch (err) {
      console.warn("[availability] read failed, defaulting to available:", err);
      throw degraded(ALL_AVAILABLE);
    }
  },
  ["addon-availability-v2"],
  { tags: ["availability"], revalidate: PUBLIC_DATA_TTL },
);

export function getAddonAvailabilityCached(): Promise<AddonAvailability> {
  return readPublicCache(getAddonAvailabilityCacheable);
}

export async function setAddonAvailability(
  patch: Partial<AddonAvailability>,
): Promise<void> {
  const entries = (
    Object.keys(KEYS) as (keyof AddonAvailability)[]
  ).filter((k) => patch[k] !== undefined);
  for (const k of entries) {
    const value = patch[k] ? "1" : "0";
    await prisma.storeSetting.upsert({
      where: { key: KEYS[k] },
      create: { key: KEYS[k], value },
      update: { value },
    });
  }
}
