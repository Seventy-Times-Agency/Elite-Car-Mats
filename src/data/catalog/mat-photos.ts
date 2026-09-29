import { evaColors, edgeColors } from "@/data/catalog/colors";

/**
 * Studio product cards per (mat color × edge color) in
 * `public/mats/<mat>-<edge>.jpg` (square, main image) and the matching
 * macro close-up in `public/mats/detail/<mat>-<edge>.jpg`. Every EVA ×
 * edge combination from the palette has both, rendered from one master
 * shot so shape and lighting are identical across colours. The set is
 * derived from the palette, so a colour added to colors.ts must ship
 * with its renders in both folders (a missing file would 404).
 *
 * Key format: `${matColorId}-${edgeColorId}`.
 */
export const MAT_PHOTOS: ReadonlySet<string> = new Set<string>(
  evaColors.flatMap((m) => edgeColors.map((e) => `${m.id}-${e.id}`)),
);

/**
 * Path to the studio photo for a (mat, edge) pair, or null when none
 * exists yet.
 */
export function matPhotoSrc(
  matColorId: string,
  edgeColorId: string,
): string | null {
  const key = `${matColorId}-${edgeColorId}`;
  return MAT_PHOTOS.has(key) ? `/mats/${key}.jpg` : null;
}

/** Macro close-up (cells, grommet, edge tape) for a (mat, edge) pair. */
export function matDetailSrc(
  matColorId: string,
  edgeColorId: string,
): string | null {
  const key = `${matColorId}-${edgeColorId}`;
  return MAT_PHOTOS.has(key) ? `/mats/detail/${key}.jpg` : null;
}
