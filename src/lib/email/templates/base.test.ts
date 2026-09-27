import { describe, expect, it } from "vitest";
import { itemsTable } from "./base";
import { makeT } from "@/i18n/dictionary";
import { en } from "@/i18n/dictionaries/en";

const t = makeT(en, en);

describe("itemsTable", () => {
  it("renders an accessory line by its catalog copy, a mat line by brand/model", () => {
    const html = itemsTable(t, [
      {
        brandName: "Toyota",
        modelName: "Camry",
        matSet: "full",
        profile: "standard",
        colorName: "Чёрный",
        edgeColorName: "Чёрный",
        year: 2025,
        quantity: 1,
        unitPrice: 129,
      },
      {
        accessory: { slug: "trunk-organizer", variantId: "gray" },
        brandName: "",
        modelName: "",
        matSet: "accessory",
        colorName: "Серый",
        edgeColorName: "Светло-серый",
        quantity: 2,
        unitPrice: 49,
      },
    ]);
    expect(html).toContain("Toyota Camry · 2025");
    expect(html).toContain("EVA Trunk Organizer");
    expect(html).toContain("Gray · light-gray trim");
    expect(html).toContain("×2");
    expect(html).toContain("$98");
    // The accessory row must not fall through to the mat-set label.
    expect(html).not.toContain("accessory ·");
  });
});
