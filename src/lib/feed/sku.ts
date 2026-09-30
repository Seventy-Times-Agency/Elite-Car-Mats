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
  return feedSkuForModel(`${brandSlug}-${modelSlug}`, set);
}

/**
 * Same id from the site's composite model id (`<brand>-<model>`, what
 * cart lines carry). Pixel / CAPI events must use this rather than a
 * hand-built string so the shortened long ids match the feed too.
 */
export function feedSkuForModel(modelId: string, set: MatSetType): string {
  const readable = `ECM-${modelId}-${set}`;
  if (readable.length <= FEED_ID_MAX) return readable;
  return `ECM-${modelId}-${SHORT_SET[set]}`;
}

const SETS_LONGEST_FIRST: MatSetType[] = ["full-cargo", "front", "full", "cargo"];

/** Feed id from an OrderItem.productId (`<brand>-<model>-<set>`). */
export function feedSkuFromProductId(productId: string): string {
  for (const set of SETS_LONGEST_FIRST) {
    if (productId.endsWith(`-${set}`)) {
      return feedSkuForModel(productId.slice(0, -(set.length + 1)), set);
    }
  }
  return `ECM-${productId}`;
}

/** Item group (one per model) — shares the brand/model prefix with ids. */
export function feedItemGroupId(brandSlug: string, modelSlug: string): string {
  return `ECM-${brandSlug}-${modelSlug}`;
}
