import { describe, expect, it } from "vitest";
import {
  BADGE_PRICE,
  HEEL_PAD_PRICE,
  THIRD_ROW_PRICE,
  calculateItemUnitPrice,
  calculateOrderTotal,
  clampBadgeCount,
  getMatSetPrice,
  getShippingSettings,
  bundleSavings,
  shippingFor,
  SHIPPING_FEE,
  FREE_SHIPPING_FROM,
  type PriceOverrideMap,
} from "./pricing";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";

// The one module every billing path trusts (orders, Stripe checkout,
// webhook re-derivation, admin overrides). These pin the rules that were
// only ever described in comments; a change here is a price change for
// real customers and should fail loudly.

const price = (profile: keyof typeof MAT_SETS_BY_PROFILE, type: string) =>
  MAT_SETS_BY_PROFILE[profile].find((s) => s.type === type)!.price;

describe("getMatSetPrice", () => {
  it("reads the profile's own table", () => {
    expect(getMatSetPrice("standard", "full")).toBe(price("standard", "full"));
    expect(getMatSetPrice("minivan", "full-cargo")).toBe(
      price("minivan", "full-cargo"),
    );
  });

  it("falls back to the standard table for a set the profile does not sell", () => {
    const sold = MAT_SETS_BY_PROFILE.semi.map((s) => s.type);
    expect(sold).not.toContain("full-cargo");
    expect(getMatSetPrice("semi", "full-cargo")).toBe(
      price("standard", "full-cargo"),
    );
  });

  it("prefers an admin override for the exact (profile, set) pair only", () => {
    const overrides: PriceOverrideMap = new Map([["standard:full", 129]]);
    expect(getMatSetPrice("standard", "full", overrides)).toBe(129);
    expect(getMatSetPrice("pickup", "full", overrides)).toBe(
      price("pickup", "full"),
    );
  });

  it("ignores a non-finite override instead of billing NaN", () => {
    const overrides: PriceOverrideMap = new Map([["standard:full", NaN]]);
    expect(getMatSetPrice("standard", "full", overrides)).toBe(
      price("standard", "full"),
    );
  });
});

describe("clampBadgeCount", () => {
  it("is zero without a badge, whatever the count says", () => {
    expect(
      clampBadgeCount({ matSet: "full", profile: "standard", badge: null, badgeCount: 4 }),
    ).toBe(0);
  });

  it("defaults to one plate and caps at the mats in the set", () => {
    const base = { matSet: "full" as const, profile: "standard" as const, badge: { id: "b" } };
    expect(clampBadgeCount(base)).toBe(1);
    expect(clampBadgeCount({ ...base, badgeCount: 99 })).toBe(4);
    expect(clampBadgeCount({ ...base, matSet: "cargo", badgeCount: 3 })).toBe(1);
  });

  it("never bills less than one plate when a badge is chosen", () => {
    expect(
      clampBadgeCount({ matSet: "full", profile: "standard", badge: { id: "b" }, badgeCount: 0 }),
    ).toBe(1);
    expect(
      clampBadgeCount({ matSet: "full", profile: "standard", badge: { id: "b" }, badgeCount: -5 }),
    ).toBe(1);
  });
});

describe("calculateItemUnitPrice", () => {
  const edge = { id: "black" };

  it("is the bare set price with no add-ons", () => {
    expect(
      calculateItemUnitPrice({ matSet: "full", profile: "standard", edgeColor: edge }),
    ).toBe(price("standard", "full"));
  });

  it("adds every add-on exactly once, badge per plate", () => {
    const unit = calculateItemUnitPrice({
      matSet: "full-cargo",
      profile: "standard",
      edgeColor: edge,
      badge: { id: "b" },
      badgeCount: 5,
      heelPad: true,
      thirdRow: true,
    });
    expect(unit).toBe(
      price("standard", "full-cargo") + 5 * BADGE_PRICE + HEEL_PAD_PRICE + THIRD_ROW_PRICE,
    );
  });

  it("resolves the profile from a catalog model id when none is given", () => {
    // Ford F-150 is a pickup in src/data/catalog/models.ts; an unknown id
    // must degrade to the standard table, not throw.
    expect(
      calculateItemUnitPrice({ matSet: "full", modelId: "ford-f-150", edgeColor: edge }),
    ).toBe(price("pickup", "full"));
    expect(
      calculateItemUnitPrice({ matSet: "full", modelId: "no-such-model", edgeColor: edge }),
    ).toBe(price("standard", "full"));
  });

  it("lets an explicit profile win over the model id (admin custom models)", () => {
    expect(
      calculateItemUnitPrice({
        matSet: "full",
        modelId: "no-such-model",
        profile: "minivan",
        edgeColor: edge,
      }),
    ).toBe(price("minivan", "full"));
  });

  it("applies add-on overrides from the pseudo-profile rows", () => {
    const overrides: PriceOverrideMap = new Map([
      ["addon:badge", 12],
      ["addon:heelPad", 20],
    ]);
    const unit = calculateItemUnitPrice(
      { matSet: "cargo", profile: "standard", edgeColor: edge, badge: { id: "b" }, heelPad: true },
      overrides,
    );
    expect(unit).toBe(price("standard", "cargo") + 12 + 20);
  });
});

describe("calculateOrderTotal", () => {
  it("multiplies by quantity and sums lines", () => {
    const edge = { id: "black" };
    const total = calculateOrderTotal([
      { matSet: "full", profile: "standard", edgeColor: edge, quantity: 2 },
      { matSet: "cargo", profile: "standard", edgeColor: edge, quantity: 1, badge: { id: "b" } },
    ]);
    expect(total).toBe(
      2 * price("standard", "full") + price("standard", "cargo") + BADGE_PRICE,
    );
  });

  it("is zero for an empty cart", () => {
    expect(calculateOrderTotal([])).toBe(0);
  });
});

describe("shipping", () => {
  it("charges the flat fee below the threshold and nothing from it", () => {
    expect(shippingFor(119)).toBe(SHIPPING_FEE);
    expect(shippingFor(FREE_SHIPPING_FROM - 0.01)).toBe(SHIPPING_FEE);
    expect(shippingFor(FREE_SHIPPING_FROM)).toBe(0);
    expect(shippingFor(277)).toBe(0);
  });

  it("follows admin overrides: fee 0 = always free, threshold 0 = always paid", () => {
    expect(shippingFor(50, new Map([["shipping:fee", 0]]))).toBe(0);
    expect(shippingFor(500, new Map([["shipping:freeFrom", 0]]))).toBe(SHIPPING_FEE);
    const ov = new Map([["shipping:fee", 12], ["shipping:freeFrom", 150]]);
    expect(shippingFor(149, ov)).toBe(12);
    expect(shippingFor(150, ov)).toBe(0);
    expect(getShippingSettings(ov)).toEqual({ fee: 12, freeFrom: 150 });
  });
});

describe("bundle savings", () => {
  it("is zero at code defaults (combo = sum of parts)", () => {
    expect(bundleSavings("standard", "full-cargo")).toBe(0);
    expect(bundleSavings("minivan", "full-cargo")).toBe(0);
    expect(bundleSavings("standard", "full")).toBe(0);
  });

  it("shows the gap once the admin lowers the combo price", () => {
    const ov = new Map([["standard:full-cargo", 179]]);
    expect(bundleSavings("standard", "full-cargo", ov)).toBe(
      getMatSetPrice("standard", "full") + getMatSetPrice("standard", "cargo") - 179,
    );
    // pickups sell no combo
    expect(bundleSavings("pickup", "full-cargo", ov)).toBe(0);
  });
});
