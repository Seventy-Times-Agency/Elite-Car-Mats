import { MatSetType } from "@/types";
import {
  MAT_SETS_BY_PROFILE,
  getMatSetOption,
} from "@/data/catalog/mat-sets";
import {
  findProfileByModelId,
  type VehicleConfigProfile,
} from "./vehicle-profile";

/**
 * Edge / kant colour surcharges. Currently zero across the board — kept
 * here so a future colour upcharge is a one-line change.
 */
export const EDGE_SURCHARGE: Record<string, number> = {
  black: 0,
  gray: 0,
  gold: 0,
  red: 0,
};

/** Metallic brand badge add-on. Flat surcharge regardless of mat set. */
export const BADGE_PRICE = 9;

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
  quantity: number;
}

export function calculateItemUnitPrice(
  item: {
    matSet: MatSetType;
    modelId?: string;
    edgeColor: { id: string };
    badge?: { id: string } | null | undefined;
  },
  overrides?: PriceOverrideMap,
): number {
  const profile = findProfileByModelId(item.modelId);
  const base = getMatSetPrice(profile, item.matSet, overrides);
  const edge = EDGE_SURCHARGE[item.edgeColor.id] ?? 0;
  const badge = item.badge ? BADGE_PRICE : 0;
  return base + edge + badge;
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
