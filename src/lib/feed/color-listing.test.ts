import { describe, expect, it } from "vitest";
import {
  COLOR_COMBOS,
  colorComboFeedId,
  parseColorCombo,
} from "@/data/catalog/color-combos";
import { edgeColors, evaColors } from "@/data/catalog/colors";
import { ACCESSORIES } from "@/data/accessories";
import { en } from "@/i18n/dictionaries/en";
import { makeT } from "@/i18n/dictionary";
import { getMatSetPrice } from "@/lib/pricing";
import {
  colorComboDescription,
  colorComboTitle,
  colorNamesEn,
  metaFeedItems,
} from "./color-listing";

const tEn = makeT(en, en);

describe("parseColorCombo", () => {
  it("covers every base × trim pair once", () => {
    expect(COLOR_COMBOS).toHaveLength(evaColors.length * edgeColors.length);
    expect(new Set(COLOR_COMBOS.map((c) => c.slug)).size).toBe(COLOR_COMBOS.length);
  });

  it("parses trims whose ids contain hyphens", () => {
    const c = parseColorCombo("beige-dark-brown");
    expect(c?.eva.id).toBe("beige");
    expect(c?.edge.id).toBe("dark-brown");
    expect(parseColorCombo("black-light-gray")?.edge.id).toBe("light-gray");
    expect(parseColorCombo("red-light-beige")?.edge.id).toBe("light-beige");
  });

  it("round-trips every slug", () => {
    for (const c of COLOR_COMBOS) {
      expect(parseColorCombo(c.slug)).toBe(c);
    }
  });

  it("rejects unknown and partial slugs", () => {
    for (const bad of ["", "black", "black-", "-red", "black-pink", "pink-red", "dark-brown-black", "black-red-x"]) {
      expect(parseColorCombo(bad)).toBeNull();
    }
  });
});

describe("Meta colour feed", () => {
  const overrides = new Map<string, number>();
  const items = metaFeedItems({
    site: "https://example.test",
    overrides,
    organizerInStock: true,
    tEn,
  });
  const accessoryItems = ACCESSORIES.reduce((n, a) => n + a.variants.length, 0);

  it("has one item per colour combo plus the accessories", () => {
    expect(items).toHaveLength(COLOR_COMBOS.length + accessoryItems);
    expect(COLOR_COMBOS.length).toBe(65);
  });

  it("uses stable ids, no item groups, and the front + rear price", () => {
    const combos = items.slice(0, COLOR_COMBOS.length);
    const price = getMatSetPrice("standard", "full", overrides).toFixed(2);
    combos.forEach((xml, i) => {
      const c = COLOR_COMBOS[i];
      expect(xml).toContain(`<g:id>${colorComboFeedId(c.eva.id, c.edge.id)}</g:id>`);
      expect(xml).toContain(`<g:image_link>https://example.test/mats/${c.slug}.jpg</g:image_link>`);
      expect(xml).toContain(`/colors/${c.slug}?utm_source=facebook&amp;utm_medium=shop&amp;utm_campaign=meta-catalog`);
      expect(xml).toContain(`<g:price>${price} USD</g:price>`);
      expect(xml).not.toContain("item_group_id");
    });
  });

  it("tags accessory links for the Meta shop", () => {
    const acc = items.slice(COLOR_COMBOS.length);
    for (const xml of acc) {
      expect(xml).toContain("utm_source=facebook");
      expect(xml).not.toContain("utm_source=google");
    }
  });
});

describe("colorComboTitle", () => {
  it("names base and trim in English", () => {
    const c = parseColorCombo("black-red")!;
    const n = colorNamesEn(tEn, c);
    expect(colorComboTitle(n.eva, n.edge)).toBe(
      "Custom EVA Car Floor Mats — Black Base, Red Trim | Made to Fit Your Car",
    );
  });

  it("capitalises every word and stays under 150 chars", () => {
    const n = colorNamesEn(tEn, parseColorCombo("beige-light-beige")!);
    expect(n.edge).toBe("Light Beige");
    for (const c of COLOR_COMBOS) {
      const names = colorNamesEn(tEn, c);
      const title = colorComboTitle(names.eva, names.edge);
      expect(title.length).toBeLessThanOrEqual(150);
      expect(title).not.toMatch(/color\./);
    }
  });

  it("describes the pair and the colour range", () => {
    const d = colorComboDescription("Gray", "Navy Blue");
    expect(d).toContain("gray with navy blue trim");
    expect(d).toContain(`${evaColors.length} base and ${edgeColors.length} trim colors`);
    expect(d).toContain("Free shipping on orders over $200");
  });
});
