import { describe, expect, it } from "vitest";
import {
  channelFor,
  channelForTouch,
  isMeaningfulTouch,
  sanitizeAttribution,
  touchFromLocation,
  type Touch,
} from "./attribution";

const OWN = "elitecarmats.us";
const at = (u: string, ref?: string) =>
  touchFromLocation(new URL(u), ref, OWN, 1000);

describe("touchFromLocation", () => {
  it("reads utm tags and drops the query from the landing path", () => {
    const t = at(
      "https://elitecarmats.us/catalog/toyota/rav4?utm_source=google&utm_medium=shopping&utm_campaign=merchant-feed&set=full",
    );
    expect(t).toEqual({
      ts: 1000,
      source: "google",
      medium: "shopping",
      campaign: "merchant-feed",
      landing: "/catalog/toyota/rav4",
    });
  });

  it("ignores the site's own referrer but keeps an external one", () => {
    expect(at("https://elitecarmats.us/cart", "https://www.elitecarmats.us/catalog").referrer).toBeUndefined();
    expect(at("https://elitecarmats.us/", "https://l.instagram.com/").referrer).toBe("instagram.com");
  });

  it("notes the ad click id", () => {
    expect(at("https://elitecarmats.us/?fbclid=abc").click).toBe("fbclid");
    expect(at("https://elitecarmats.us/?gclid=abc").click).toBe("gclid");
  });

  it("a plain internal navigation is not a meaningful touch", () => {
    expect(isMeaningfulTouch(at("https://elitecarmats.us/cart"))).toBe(false);
    expect(isMeaningfulTouch(at("https://elitecarmats.us/", "https://google.com/"))).toBe(true);
  });
});

describe("channelForTouch", () => {
  const cases: [Partial<Touch>, string][] = [
    [{ source: "facebook", medium: "shop", campaign: "meta-shop" }, "meta-shop"],
    [{ source: "instagram", medium: "shop" }, "meta-shop"],
    [{ source: "facebook", medium: "cpc" }, "meta-ads"],
    [{ source: "ig", medium: "paid_social" }, "meta-ads"],
    [{ source: "facebook", click: "fbclid" }, "meta-ads"],
    [{ click: "fbclid" }, "meta-ads"],
    [{ source: "instagram" }, "meta-organic"],
    [{ referrer: "instagram.com" }, "meta-organic"],
    [{ source: "google", medium: "shopping" }, "google-shopping"],
    [{ source: "google", medium: "cpc" }, "google-ads"],
    [{ click: "gclid" }, "google-ads"],
    [{ referrer: "google.com" }, "google-organic"],
    [{ referrer: "google.co.uk" }, "google-organic"],
    [{ source: "etsy", medium: "listing" }, "etsy"],
    [{ referrer: "etsy.com" }, "etsy"],
    [{ referrer: "bing.com" }, "search"],
    [{ referrer: "reddit.com" }, "referral"],
    [{ source: "newsletter", medium: "email" }, "other"],
    [{}, "direct"],
  ];
  for (const [touch, channel] of cases) {
    it(`${JSON.stringify(touch)} → ${channel}`, () => {
      expect(channelForTouch({ ts: 0, ...touch })).toBe(channel);
    });
  }
});

describe("channelFor", () => {
  it("credits the last tagged touch", () => {
    expect(
      channelFor({
        first: { ts: 1, source: "google", medium: "shopping" },
        last: { ts: 2, source: "facebook", medium: "cpc" },
      }),
    ).toBe("meta-ads");
  });

  it("falls back to the first touch when the buyer came back directly", () => {
    expect(
      channelFor({
        first: { ts: 1, source: "facebook", medium: "cpc" },
        last: { ts: 2, landing: "/" },
      }),
    ).toBe("meta-ads");
  });

  it("direct stays direct", () => {
    expect(channelFor({ first: { ts: 1 }, last: { ts: 2 } })).toBe("direct");
    expect(channelFor(null)).toBe("direct");
  });
});

describe("sanitizeAttribution", () => {
  it("trims, lowercases and drops junk", () => {
    const a = sanitizeAttribution({
      first: { ts: 5, source: " Facebook ", medium: "Shop", landing: "/x", extra: 1 },
      last: { source: "google", click: "bogus", ts: "no" },
    });
    expect(a?.first).toEqual({ ts: 5, source: "facebook", medium: "shop", landing: "/x" });
    expect(a?.last.source).toBe("google");
    expect(a?.last.click).toBeUndefined();
    expect(typeof a?.last.ts).toBe("number");
  });

  it("rejects non-objects", () => {
    expect(sanitizeAttribution("x")).toBeNull();
    expect(sanitizeAttribution({ first: null })).toBeNull();
  });
});
