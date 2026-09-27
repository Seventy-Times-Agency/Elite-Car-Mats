import type { MatSetType } from "@/types";

/** Google Merchant Center caps `id` at 50 characters. */
export const FEED_ID_MAX = 50;

const SHORT_SET: Record<MatSetType, string> = {
  front: "fr",
  full: "f",
  cargo: "c",
  "full-cargo": "fc",
};

/**
 * Feed item id: `ECM-<brand>-<model>-<set>`. Ids are identity in Merchant
 * Center — change one and Google sees a new product with fresh review
 * history — so the readable form stays for every item that fits, and
 * only an over-long id (one model as of 2026-09: the Oldsmobile Cutlass
 * Supreme Convertible) drops to the abbreviated set suffix. Deterministic
 * either way, so the same catalog always yields the same ids.
 */
export function feedSku(
  brandSlug: string,
  modelSlug: string,
  set: MatSetType,
): string {
  const readable = `ECM-${brandSlug}-${modelSlug}-${set}`;
  if (readable.length <= FEED_ID_MAX) return readable;
  return `ECM-${brandSlug}-${modelSlug}-${SHORT_SET[set]}`;
}

/** Item group (one per model) — shares the brand/model prefix with ids. */
export function feedItemGroupId(brandSlug: string, modelSlug: string): string {
  return `ECM-${brandSlug}-${modelSlug}`;
}
