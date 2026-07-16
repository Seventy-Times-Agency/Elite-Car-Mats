/**
 * Which (mat color × edge color) combinations have a real studio photo
 * in `public/mats/<mat>-<edge>.jpg`. The configurator shows the photo
 * view only for combos listed here; everything else falls back to the
 * schematic preview. Add a key the moment a new supplier photo lands.
 *
 * Key format: `${matColorId}-${edgeColorId}`.
 */
export const MAT_PHOTOS: ReadonlySet<string> = new Set<string>([
  // Black mat — full set of 11 edge colors
  "black-black",
  "black-dark-brown",
  "black-navy",
  "black-dark-green",
  "black-purple",
  "black-red",
  "black-yellow",
  "black-beige",
  "black-ivory",
  "black-light-gray",
  "black-white",

  // Gray mat — arriving edge by edge
  "gray-red",
]);

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
