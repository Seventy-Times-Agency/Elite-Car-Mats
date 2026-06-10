import type { VehicleCategory } from "@/types";

/**
 * Normalisers for admin-entered CustomBrand / CustomModel rows. Shared by
 * the public catalog merge (lib/catalog-merge.ts) and the DB seed mirror
 * (lib/db/seed.ts) so both shape custom rows identically.
 */

const VALID_CATEGORIES: ReadonlySet<VehicleCategory> = new Set([
  "car",
  "suv",
  "truck",
  "commercial",
]);

export function asCategory(s: string): VehicleCategory {
  return VALID_CATEGORIES.has(s as VehicleCategory)
    ? (s as VehicleCategory)
    : "car";
}

export function parseYears(s: string): number[] {
  return s
    .split(",")
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n >= 1900 && n <= 2100)
    .sort((a, b) => a - b);
}
