import { describe, expect, it } from "vitest";
import { FEED_ID_MAX, feedItemGroupId, feedSku } from "./sku";
import { brands } from "@/data/catalog/brands";
import { mockModels } from "@/data/catalog/models";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";

// Merchant Center rejected exactly one of 3 916 items on first fetch: an
// id over 50 characters. Walk the whole code catalog so the next long
// model name fails here, not in Google's diagnostics a day later.
describe("feedSku", () => {
  it("keeps the readable form when it fits", () => {
    expect(feedSku("toyota", "camry", "full-cargo")).toBe("ECM-toyota-camry-full-cargo");
  });

  it("abbreviates only the set suffix when over the limit", () => {
    const id = feedSku("oldsmobile", "cutlass-supreme-convertible", "full-cargo");
    expect(id).toBe("ECM-oldsmobile-cutlass-supreme-convertible-fc");
    expect(id.length).toBeLessThanOrEqual(FEED_ID_MAX);
  });

  it("stays within the limit and unique for every catalog model × set", () => {
    const brandById = new Map(brands.map((b) => [b.id, b.slug]));
    const setTypes = [...new Set(Object.values(MAT_SETS_BY_PROFILE).flat().map((s) => s.type))];
    const seen = new Set<string>();
    for (const m of mockModels) {
      const brandSlug = brandById.get(m.brandId) ?? m.brandId;
      expect(feedItemGroupId(brandSlug, m.slug).length).toBeLessThanOrEqual(FEED_ID_MAX);
      for (const set of setTypes) {
        const id = feedSku(brandSlug, m.slug, set);
        expect(id.length).toBeLessThanOrEqual(FEED_ID_MAX);
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    }
  });
});
