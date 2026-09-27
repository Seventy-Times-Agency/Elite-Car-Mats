import { describe, expect, it } from "vitest";
import {
  ACCESSORIES,
  accessorySku,
  findAccessoryVariant,
  organizerVariantForEdge,
} from "./accessories";
import { evaColors, edgeColors } from "@/data/catalog/colors";
import { getAccessoryPrice } from "@/lib/pricing";

describe("accessories catalog", () => {
  it("every variant reuses real mat colour ids (order rows keep their colour FKs)", () => {
    const eva = new Set(evaColors.map((c) => c.id));
    const edge = new Set(edgeColors.map((c) => c.id));
    for (const a of ACCESSORIES) {
      for (const v of a.variants) {
        expect(eva.has(v.evaColorId)).toBe(true);
        expect(edge.has(v.edgeColorId)).toBe(true);
        expect(v.images.length).toBeGreaterThan(0);
        expect(accessorySku(a.slug, v.id).length).toBeLessThanOrEqual(50);
      }
    }
  });

  it("looks up slug + variant, rejects unknown pairs", () => {
    expect(findAccessoryVariant("trunk-organizer", "gray")?.variant.edgeColorId).toBe("light-gray");
    expect(findAccessoryVariant("trunk-organizer", "purple")).toBeUndefined();
    expect(findAccessoryVariant("cup-holder", "gray")).toBeUndefined();
  });

  it("matches the organizer trim to the chosen mat edge: red → black/red, anything else → grey", () => {
    expect(organizerVariantForEdge("red").id).toBe("black-red");
    expect(organizerVariantForEdge("navy").id).toBe("gray");
    expect(organizerVariantForEdge("light-gray").id).toBe("gray");
  });

  it("prices from the catalog default, admin override wins, unknown slug is 0", () => {
    expect(getAccessoryPrice("trunk-organizer")).toBe(49);
    expect(getAccessoryPrice("trunk-organizer", new Map([["accessory:trunk-organizer", 59]]))).toBe(59);
    expect(getAccessoryPrice("cup-holder")).toBe(0);
  });
});
