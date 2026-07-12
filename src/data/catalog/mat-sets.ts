import type { MatSet, MatSetType } from "@/types";
import type { VehicleConfigProfile } from "@/lib/vehicle-profile";

/**
 * Source-of-truth options + prices per vehicle profile.
 *
 * The configurator UI and the server-side pricing helper read directly
 * from this table — never hardcode prices anywhere else.
 *
 * MatSetType values are reused across profiles with profile-specific
 * meaning (e.g. for a minivan `front` means "front + middle row" while
 * for a sedan `front` would only mean the two front-row mats — sedans
 * don't sell that option anymore).
 */
export interface MatSetOption {
  type: MatSetType;
  /** Russian label persisted into CartItem.matSetLabel and emails. */
  label: string;
  /** Russian short description shown under the option in the configurator. */
  description: string;
  /** USD price for this set on this profile. */
  price: number;
  /**
   * Number of physical mats in the set — caps how many brand-logo
   * plates the customer can add (one plate per mat, cargo included).
   */
  mats: number;
}

const SEDAN_SETS: MatSetOption[] = [
  {
    type: "full",
    label: "Перед + зад",
    description: "Весь салон (4 коврика)",
    price: 119,
    mats: 4,
  },
  {
    type: "cargo",
    label: "Только багажник",
    description: "Багажное отделение",
    price: 79,
    mats: 1,
  },
  {
    type: "full-cargo",
    label: "Полный комплект",
    description: "Салон и багажник",
    price: 198,
    mats: 5,
  },
];

const PICKUP_SETS: MatSetOption[] = [
  {
    type: "full",
    label: "Перед + зад",
    description: "Весь салон (4 коврика)",
    price: 119,
    mats: 4,
  },
];

const TWO_SEATER_SETS: MatSetOption[] = [
  {
    type: "front",
    label: "Только первый ряд",
    description: "Водитель + пассажир",
    price: 119,
    mats: 2,
  },
  {
    type: "cargo",
    label: "Только багажник",
    description: "Багажное отделение",
    price: 79,
    mats: 1,
  },
  {
    type: "full-cargo",
    label: "Всё вместе",
    description: "Салон и багажник",
    price: 198,
    mats: 3,
  },
];

const SEMI_SETS: MatSetOption[] = [
  {
    type: "front",
    label: "Кабина",
    description: "Большой комплект в кабину тягача",
    price: 119,
    mats: 3,
  },
];

const MINIVAN_SETS: MatSetOption[] = [
  {
    type: "front",
    label: "Перед + середина",
    description: "1-й и 2-й ряд",
    price: 119,
    mats: 4,
  },
  {
    type: "full",
    label: "Перед + середина + зад",
    description: "Все три ряда сидений",
    price: 198,
    mats: 6,
  },
  {
    type: "cargo",
    label: "Только багажник",
    description: "Багажное отделение",
    price: 79,
    mats: 1,
  },
  {
    type: "full-cargo",
    label: "Полный комплект",
    description: "Все три ряда + багажник",
    price: 277,
    mats: 7,
  },
];

export const MAT_SETS_BY_PROFILE: Record<VehicleConfigProfile, MatSetOption[]> = {
  standard: SEDAN_SETS,
  pickup: PICKUP_SETS,
  twoSeater: TWO_SEATER_SETS,
  semi: SEMI_SETS,
  minivan: MINIVAN_SETS,
};

export function getMatSetOption(
  profile: VehicleConfigProfile,
  type: MatSetType,
): MatSetOption | undefined {
  return MAT_SETS_BY_PROFILE[profile].find((s) => s.type === type);
}

/**
 * Physical mat count for a (profile, set) pair — the cap on brand-logo
 * plates. Falls back to the standard profile's entry (stale carts whose
 * set isn't sold for the profile), then to 1.
 */
export function getMatCount(
  profile: VehicleConfigProfile,
  type: MatSetType,
): number {
  const opt = getMatSetOption(profile, type);
  if (opt) return opt.mats;
  const std = MAT_SETS_BY_PROFILE.standard.find((s) => s.type === type);
  return std?.mats ?? 1;
}

/**
 * Flat list of every mat-set type that exists across profiles. Used by the
 * DB seed to make sure a Product row exists for every (model, matSet) pair
 * — even matSet values not currently sold for a given profile, so legacy
 * orders still resolve their FKs cleanly.
 */
export const matSets: MatSet[] = [
  { type: "front", label: "Передние", description: "Водитель + пассажир" },
  { type: "full", label: "Перед + зад", description: "Весь салон" },
  { type: "cargo", label: "Только багажник", description: "Багажное отделение" },
  { type: "full-cargo", label: "Полный комплект", description: "Салон и багажник" },
];

