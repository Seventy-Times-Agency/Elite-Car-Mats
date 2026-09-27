/**
 * Hand-written notes for the best-selling US models.
 *
 * Why: the ~1 360 model pages share one template, so to Google they read
 * as near-duplicates that differ only by the car's name. These guides give
 * the models people actually search for a block of text that is about that
 * car: its generations, cabin layouts and what to tell us when ordering.
 *
 * Rules for this file:
 *  - Facts only, checked against manufacturer / Wikipedia / Edmunds-type
 *    sources (Sep 2026). Nothing about a car goes in on a hunch; if a
 *    detail could not be confirmed it was left out.
 *  - No promises about the mats beyond what the product page already
 *    says (hand-cut per model and year, free re-cut if it doesn't sit
 *    right). Fit details that depend on the cabin go into `tips` as
 *    "tell us X in the trim field", not as claims.
 *  - English only. The page renders a guide on the English locale only.
 *
 * Key: `${brandSlug}/${modelSlug}` exactly as in the catalog URL.
 */

import type { ModelGuide } from "./types";
import { CROSSOVER_GUIDES } from "./crossovers";
import { TRUCK_GUIDES } from "./trucks";
import { CAR_GUIDES } from "./cars";
import { FAMILY_GUIDES } from "./family";

export type { ModelGuide, ModelGeneration } from "./types";

export const MODEL_GUIDES: Record<string, ModelGuide> = {
  ...CROSSOVER_GUIDES,
  ...TRUCK_GUIDES,
  ...CAR_GUIDES,
  ...FAMILY_GUIDES,
};

export function getModelGuide(
  brandSlug: string,
  modelSlug: string,
): ModelGuide | null {
  return MODEL_GUIDES[`${brandSlug}/${modelSlug}`] ?? null;
}
