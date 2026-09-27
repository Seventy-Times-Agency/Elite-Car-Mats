import { describe, expect, it } from "vitest";
import { recentDayKeys, shopDayKey, shopDayStart } from "./funnel";

// The panel's Postgres window must start exactly where the Redis day
// bucket starts. New York is UTC-4 in summer and UTC-5 in winter; a
// hard-coded offset silently shifted five months of the year by an hour.
describe("shopDayStart", () => {
  it("is 04:00Z during daylight time", () => {
    expect(shopDayStart("2026-07-01").toISOString()).toBe("2026-07-01T04:00:00.000Z");
  });
  it("is 05:00Z during standard time", () => {
    expect(shopDayStart("2026-01-15").toISOString()).toBe("2026-01-15T05:00:00.000Z");
  });
  it("round-trips with shopDayKey on both sides of the boundary", () => {
    const start = shopDayStart("2026-11-01"); // DST ends that day in the US
    expect(shopDayKey(start)).toBe("2026-11-01");
    expect(shopDayKey(new Date(start.getTime() - 1))).toBe("2026-10-31");
  });
});

describe("recentDayKeys", () => {
  it("returns n keys, oldest first, ending today", () => {
    const keys = recentDayKeys(7);
    expect(keys).toHaveLength(7);
    expect(keys[6]).toBe(shopDayKey());
    expect([...keys].sort()).toEqual(keys);
  });
});
