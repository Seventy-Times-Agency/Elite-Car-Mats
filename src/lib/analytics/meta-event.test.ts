import { describe, expect, it } from "vitest";
import {
  metaEventSchema,
  allowedHosts,
  isAllowedUrl,
  readCookie,
  adSignalsFromRequest,
  adSignalsToMetadata,
  adSignalsFromMetadata,
  isCrawlerUserAgent,
} from "./meta-event";

const valid = {
  eventName: "AddToCart",
  eventId: "addtocart-0b9c2a4e-6d1f-4c8a-9f53-3e2d1c0b9a87",
  eventSourceUrl: "https://elitecarmats.us/catalog/toyota/camry",
  customData: {
    currency: "USD",
    value: 119,
    content_type: "product",
    content_ids: ["ECM-toyota-camry-full"],
    contents: [{ id: "ECM-toyota-camry-full", quantity: 1, item_price: 119 }],
  },
};

describe("metaEventSchema", () => {
  it("accepts what the storefront sends", () => {
    expect(metaEventSchema.safeParse(valid).success).toBe(true);
    expect(
      metaEventSchema.safeParse({
        eventName: "ViewContent",
        eventId: "viewcontent-x",
        eventSourceUrl: "https://elitecarmats.us/",
        customData: { content_type: "product", content_ids: ["a"], content_name: "Toyota Camry" },
      }).success,
    ).toBe(true);
  });

  it("only allows the three mirrored events — never Purchase", () => {
    expect(metaEventSchema.safeParse({ ...valid, eventName: "Purchase" }).success).toBe(false);
    expect(metaEventSchema.safeParse({ ...valid, eventName: "Lead" }).success).toBe(false);
  });

  it("rejects out-of-range values and unknown keys", () => {
    const bad = (customData: Record<string, unknown>) =>
      metaEventSchema.safeParse({ ...valid, customData: { ...valid.customData, ...customData } }).success;
    expect(bad({ value: 5001 })).toBe(false);
    expect(bad({ value: -1 })).toBe(false);
    expect(bad({ currency: "EUR" })).toBe(false);
    expect(bad({ content_ids: Array.from({ length: 21 }, (_, i) => `s${i}`) })).toBe(false);
    expect(bad({ content_ids: ["x".repeat(65)] })).toBe(false);
    expect(bad({ content_name: "x".repeat(201) })).toBe(false);
    expect(bad({ email: "a@b.c" })).toBe(false);
    expect(metaEventSchema.safeParse({ ...valid, eventId: "x".repeat(65) }).success).toBe(false);
    expect(metaEventSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
  });
});

describe("isCrawlerUserAgent", () => {
  it("flags JS-executing crawlers", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36 (compatible; Storebot-Google/1.0)",
      "AdsBot-Google (+http://www.google.com/adsbot.html)",
      "facebookexternalhit/1.1",
      "Mozilla/5.0 HeadlessChrome/120.0",
      "Mozilla/5.0 (compatible; bingbot/2.0)",
    ]) {
      expect(isCrawlerUserAgent(ua)).toBe(true);
    }
  });

  it("lets real browsers through", () => {
    expect(
      isCrawlerUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
    expect(isCrawlerUserAgent(null)).toBe(false);
  });
});

describe("origin checks", () => {
  const req = new Request("https://elitecarmats.us/api/meta/event", {
    method: "POST",
    headers: { host: "elitecarmats.us" },
  });
  const hosts = allowedHosts(req);

  it("accepts same-site URLs", () => {
    expect(isAllowedUrl("https://elitecarmats.us", hosts)).toBe(true);
    expect(isAllowedUrl("https://elitecarmats.us/checkout?x=1", hosts)).toBe(true);
  });

  it("rejects other origins and junk", () => {
    expect(isAllowedUrl("https://evil.example/elitecarmats.us", hosts)).toBe(false);
    expect(isAllowedUrl("https://elitecarmats.us.evil.example/", hosts)).toBe(false);
    expect(isAllowedUrl("javascript:alert(1)", hosts)).toBe(false);
    expect(isAllowedUrl("null", hosts)).toBe(false);
    expect(isAllowedUrl(null, hosts)).toBe(false);
  });
});

describe("readCookie", () => {
  it("finds a cookie by exact name", () => {
    const h = "a=1; _fbp=fb.1.2.3; x_fbp=nope; _fbc=fb.1.2.IwAR";
    expect(readCookie(h, "_fbp")).toBe("fb.1.2.3");
    expect(readCookie(h, "_fbc")).toBe("fb.1.2.IwAR");
    expect(readCookie(h, "missing")).toBeUndefined();
    expect(readCookie(null, "_fbp")).toBeUndefined();
  });
});

describe("ad signals", () => {
  it("captures cookies, IP and a truncated UA from the request", () => {
    const req = new Request("https://elitecarmats.us/api/checkout/stripe", {
      method: "POST",
      headers: {
        cookie: "_fbp=fb.1.1727500000000.123; _fbc=fb.1.1727500000000.IwAR_x",
        "x-vercel-forwarded-for": "203.0.113.9",
        "user-agent": "U".repeat(1000),
      },
    });
    const s = adSignalsFromRequest(req);
    expect(s.fbp).toBe("fb.1.1727500000000.123");
    expect(s.fbc).toBe("fb.1.1727500000000.IwAR_x");
    expect(s.ip).toBe("203.0.113.9");
    expect(s.ua).toHaveLength(400);
  });

  it("round-trips through Stripe metadata within the 500-char cap", () => {
    const signals = {
      fbp: "fb.1.1727500000000.123",
      fbc: "fb.1.1727500000000.IwAR_x",
      ip: "2001:db8::1",
      ua: "Mozilla/5.0",
    };
    const md = adSignalsToMetadata(signals);
    for (const v of Object.values(md)) expect(v.length).toBeLessThanOrEqual(500);
    expect(adSignalsFromMetadata({ orderId: "o1", orderNumber: "ECM-1", ...md })).toEqual(signals);
  });

  it("yields nothing for sessions created without consent", () => {
    expect(adSignalsToMetadata(undefined)).toEqual({});
    expect(adSignalsFromMetadata({ orderId: "o1", orderNumber: "ECM-1" })).toBeUndefined();
    expect(adSignalsFromMetadata(null)).toBeUndefined();
  });
});
