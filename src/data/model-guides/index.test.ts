import { describe, expect, it } from "vitest";
import { MODEL_GUIDES, getModelGuide } from ".";
import { brands, mockModels } from "@/data/catalog";

describe("model guides", () => {
  const urls = new Set(
    mockModels.map((m) => {
      const brand = brands.find((b) => b.id === m.brandId);
      return `${brand?.slug}/${m.slug}`;
    }),
  );

  it("every guide key is a real catalog URL", () => {
    for (const key of Object.keys(MODEL_GUIDES)) {
      expect(urls.has(key), key).toBe(true);
    }
  });

  it("every guide is complete and its meta description fits a snippet", () => {
    for (const [key, g] of Object.entries(MODEL_GUIDES)) {
      expect(g.intro.length, key).toBeGreaterThan(0);
      expect(g.generations.length, key).toBeGreaterThan(0);
      expect(g.tips.length, key).toBeGreaterThan(0);
      expect(g.metaDescription.length, key).toBeLessThanOrEqual(160);
      expect(g.metaDescription.length, key).toBeGreaterThan(70);
    }
  });

  it("meta descriptions are unique", () => {
    const all = Object.values(MODEL_GUIDES).map((g) => g.metaDescription);
    expect(new Set(all).size).toBe(all.length);
  });

  it("unknown models have no guide", () => {
    expect(getModelGuide("toyota", "no-such-model")).toBeNull();
  });
});
