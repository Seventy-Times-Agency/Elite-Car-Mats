import "server-only";
import type { MatSetType } from "@/types";

/**
 * Approximate finished weight of each mat-set bucket, in grams. ShipStation
 * needs a weight to quote carrier rates. These are rough but conservative
 * (slightly over real) so the rate the operator sees in ShipStation is
 * never less than the rate that ships.
 *
 * Sourced from our packed-mat measurements (10 mm EVA + PVC edge):
 *   front pair  ≈ 2.2 kg
 *   full set    ≈ 4.5 kg
 *   cargo mat   ≈ 1.8 kg
 *   full+cargo  ≈ 6.0 kg
 *
 * Add-ons:
 *   metal badge ≈ 0.05 kg
 *   heel pad    ≈ 0.05 kg
 *   packaging   ≈ 0.30 kg (kraft envelope + padding)
 */
const MAT_SET_BASE_GRAMS: Record<MatSetType, number> = {
  front: 2200,
  full: 4500,
  cargo: 1800,
  "full-cargo": 6000,
};

const BADGE_GRAMS = 50;
const HEEL_PAD_GRAMS = 50;
const PACKAGING_GRAMS = 300;

export function estimateItemWeightGrams(opts: {
  matSet: MatSetType;
  hasBadge: boolean;
  hasHeelPad: boolean;
  quantity: number;
}): number {
  const unit =
    MAT_SET_BASE_GRAMS[opts.matSet] +
    (opts.hasBadge ? BADGE_GRAMS : 0) +
    (opts.hasHeelPad ? HEEL_PAD_GRAMS : 0);
  return unit * Math.max(1, opts.quantity);
}

/**
 * Total parcel weight = sum of item weights + a single packaging allowance
 * per order. ShipStation expects grams as integer.
 */
export function estimateParcelWeightGrams(
  items: ReadonlyArray<{
    matSet: MatSetType;
    hasBadge: boolean;
    hasHeelPad: boolean;
    quantity: number;
  }>,
): number {
  const itemsTotal = items.reduce(
    (sum, it) => sum + estimateItemWeightGrams(it),
    0,
  );
  return itemsTotal + PACKAGING_GRAMS;
}
