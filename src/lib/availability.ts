import "server-only";
import { prisma } from "@/lib/db/prisma";

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
}

const KEYS: Record<keyof AddonAvailability, string> = {
  badges: "addon.badges.available",
  heelPad: "addon.heelPad.available",
};

export async function getAddonAvailability(): Promise<AddonAvailability> {
  try {
    const rows = await prisma.storeSetting.findMany({
      where: { key: { in: Object.values(KEYS) } },
      select: { key: true, value: true },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      badges: map.get(KEYS.badges) !== "0",
      heelPad: map.get(KEYS.heelPad) !== "0",
    };
  } catch (err) {
    console.warn("[availability] read failed, defaulting to available:", err);
    return { badges: true, heelPad: true };
  }
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
