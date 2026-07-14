import { MatSetType } from "@/types";
import {
  MAT_SETS_BY_PROFILE,
  getMatSetOption,
  getMatCount,
} from "@/data/catalog/mat-sets";
import {
  findProfileByModelId,
  type VehicleConfigProfile,
} from "./vehicle-profile";

/** Metallic brand badge add-on. Flat surcharge regardless of mat set. */
export const BADGE_PRICE = 9;

/**
 * Aluminum heel pad — driver-side reinforced metal plate that protects
 * the EVA mat from heel wear. Flat upcharge regardless of mat set or
 * vehicle profile.
 */
export const HEEL_PAD_PRICE = 17;

export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";

/**
 * Sedan-defaults price table — kept so legacy callers that don't know
 * about vehicle profiles (e.g. the home-page gallery card preview, OG
 * meta) can still render a sensible "from" price. New code should reach
 * for `getMatSetPrice(profile, type)` instead.
 */
export const MAT_SET_PRICE: Record<MatSetType, number> = {
  front: getMatSetOption("twoSeater", "front")?.price ?? 119,
  full: getMatSetOption("standard", "full")?.price ?? 119,
  cargo: getMatSetOption("standard", "cargo")?.price ?? 79,
  "full-cargo": getMatSetOption("standard", "full-cargo")?.price ?? 198,
};

/**
 * Map keyed by `${profile}:${matSet}` → admin-set USD price. Optional
 * argument for the price helpers below — the server billing paths
 * (orders, Stripe checkout/webhook) load it from
 * `lib/pricing-overrides.ts` so customers are billed at the latest
 * admin-set price; client-side display callers omit it and get the
 * code defaults baked into the bundle.
 */
export type PriceOverrideMap = Map<string, number>;

const overrideKey = (
  profile: VehicleConfigProfile,
  type: MatSetType,
): string => `${profile}:${type}`;

/**
 * Profile-aware base price for a mat set. Resolution order:
 *   1. admin override for `(profile, type)` if `overrides` is passed
 *   2. code-based price for the requested profile
 *   3. code-based price on the standard / sedan profile (last-resort
 *      fallback for stale carts whose set isn't sold for the profile)
 */
export function getMatSetPrice(
  profile: VehicleConfigProfile,
  type: MatSetType,
  overrides?: PriceOverrideMap,
): number {
  if (overrides) {
    const ov = overrides.get(overrideKey(profile, type));
    if (typeof ov === "number" && Number.isFinite(ov)) return ov;
  }
  const opt = getMatSetOption(profile, type);
  if (opt) return opt.price;
  const std = MAT_SETS_BY_PROFILE.standard.find((s) => s.type === type);
  return std?.price ?? 0;
}

/**
 * Add-on prices with admin overrides. Stored in the same
 * MatSetPriceOverride table under the pseudo-profile `addon`
 * (rows `addon:badge` / `addon:heelPad`), so the existing override
 * loaders and the client-side PriceOverridesProvider pick them up with
 * zero extra plumbing.
 */
export function getBadgePrice(overrides?: PriceOverrideMap): number {
  const ov = overrides?.get("addon:badge");
  return typeof ov === "number" && Number.isFinite(ov) ? ov : BADGE_PRICE;
}

export function getHeelPadPrice(overrides?: PriceOverrideMap): number {
  const ov = overrides?.get("addon:heelPad");
  return typeof ov === "number" && Number.isFinite(ov) ? ov : HEEL_PAD_PRICE;
}

export interface PriceableItem {
  matSet: MatSetType;
  /**
   * `${brandSlug}-${modelSlug}` form (matches the DB Product/Model id).
   * Used to resolve the vehicle profile for profile-aware pricing.
   * Optional for legacy callers — defaults to the `standard` profile.
   */
  modelId?: string;
  edgeColor: { id: string };
  badge?: { id: string } | null;
  /** Brand-logo plates count (1..mats in set). Absent = 1 when badge set. */
  badgeCount?: number;
  /** Driver-side aluminum heel pad add-on. Adds HEEL_PAD_PRICE. */
  heelPad?: boolean;
  quantity: number;
}

/**
 * Effective number of brand-logo plates billed for an item: 0 without a
 * badge, otherwise the requested count clamped to [1 .. mats in the set]
 * (one plate per mat, cargo mat included). The single place this rule
 * lives — UI, order creation and Stripe billing all call it.
 */
export function clampBadgeCount(
  item: {
    matSet: MatSetType;
    modelId?: string;
    badge?: { id: string } | null | undefined;
    badgeCount?: number | null;
  },
): number {
  if (!item.badge) return 0;
  const profile = findProfileByModelId(item.modelId);
  const max = getMatCount(profile, item.matSet);
  const requested = Math.floor(item.badgeCount ?? 1);
  if (!Number.isFinite(requested)) return 1;
  return Math.min(Math.max(requested, 1), max);
}

export function calculateItemUnitPrice(
  item: {
    matSet: MatSetType;
    modelId?: string;
    edgeColor: { id: string };
    badge?: { id: string } | null | undefined;
    badgeCount?: number | null;
    heelPad?: boolean;
  },
  overrides?: PriceOverrideMap,
): number {
  const profile = findProfileByModelId(item.modelId);
  const base = getMatSetPrice(profile, item.matSet, overrides);
  const badge = getBadgePrice(overrides) * clampBadgeCount(item);
  const heelPad = item.heelPad ? getHeelPadPrice(overrides) : 0;
  return base + badge + heelPad;
}

export function calculateItemTotal(
  item: PriceableItem,
  overrides?: PriceOverrideMap,
): number {
  return calculateItemUnitPrice(item, overrides) * item.quantity;
}

export function calculateOrderTotal(
  items: PriceableItem[],
  overrides?: PriceOverrideMap,
): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item, overrides), 0);
}

export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(0)}`;
}
