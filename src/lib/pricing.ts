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
 * Profile-aware base price for a mat set. Falls back to the standard /
 * sedan price if the requested set isn't sold for that profile (which
 * shouldn't happen for new orders — the configurator only offers
 * available sets — but stale carts could land here).
 */
export function getMatSetPrice(
  profile: VehicleConfigProfile,
  type: MatSetType,
): number {
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

export function calculateItemUnitPrice(item: {
  matSet: MatSetType;
  modelId?: string;
  edgeColor: { id: string };
  badge?: { id: string } | null | undefined;
}): number {
  const profile = findProfileByModelId(item.modelId);
  const base = getMatSetPrice(profile, item.matSet);
  const edge = EDGE_SURCHARGE[item.edgeColor.id] ?? 0;
  const badge = item.badge ? BADGE_PRICE : 0;
  return base + edge + badge;
}

export function calculateItemTotal(item: PriceableItem): number {
  return calculateItemUnitPrice(item) * item.quantity;
}

export function calculateOrderTotal(items: PriceableItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(0)}`;
}
