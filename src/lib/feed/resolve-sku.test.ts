import { describe, expect, it } from "vitest";
import { parseMetaProducts, resolveSku } from "./resolve-sku";
import { feedSku } from "./sku";
import { accessorySku, ACCESSORIES } from "@/data/accessories";

describe("resolveSku", () => {
  it("round-trips feed ids, including hyphenated slugs and full-cargo", () => {
    expect(resolveSku(feedSku("toyota", "rav4", "full"))).toEqual({
      kind: "mat",
      brandSlug: "toyota",
      modelSlug: "rav4",
      set: "full",
    });
    expect(resolveSku(feedSku("toyota", "rav4", "full-cargo"))).toMatchObject({ set: "full-cargo" });
  });

  it("resolves accessory ids", () => {
    const acc = ACCESSORIES[0];
    const v = acc.variants[0];
    expect(resolveSku(accessorySku(acc.slug, v.id))).toEqual({
      kind: "accessory",
      slug: acc.slug,
      variant: v.id,
    });
  });

  it("returns null for unknown ids", () => {
    expect(resolveSku("ECM-nope-nope-full")).toBeNull();
    expect(resolveSku("ECM-ACC-nope-red")).toBeNull();
  });
});

describe("parseMetaProducts", () => {
  it("parses Meta's products param", () => {
    expect(parseMetaProducts("A:2,B:1")).toEqual([
      { sku: "A", qty: 2 },
      { sku: "B", qty: 1 },
    ]);
  });
  it("defaults and clamps quantity, skips empties", () => {
    expect(parseMetaProducts("A,B:0,C:99,")).toEqual([
      { sku: "A", qty: 1 },
      { sku: "B", qty: 1 },
      { sku: "C", qty: 10 },
    ]);
    expect(parseMetaProducts(null)).toEqual([]);
  });
});
