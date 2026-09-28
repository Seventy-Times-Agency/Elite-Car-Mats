import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildUserData,
  cleanFbCookie,
  cleanIp,
  normalizePhone,
} from "./meta-capi";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

describe("normalizePhone", () => {
  it("prefixes bare 10-digit US numbers with 1", () => {
    expect(normalizePhone("(585) 555-0123")).toBe("15855550123");
  });
  it("keeps numbers that already carry a country code", () => {
    expect(normalizePhone("+1 585 555 0123")).toBe("15855550123");
    expect(normalizePhone("+380 67 123 4567")).toBe("380671234567");
  });
});

describe("buildUserData", () => {
  it("hashes PII after normalizing it", () => {
    const u = buildUserData({
      email: "  Jane@Example.COM ",
      phone: "585-555-0123",
      customerName: "Jane  Q  Doe",
      city: "New York",
      state: "ny",
      zip: "14604",
    });
    expect(u.em).toEqual([sha("jane@example.com")]);
    expect(u.external_id).toEqual(u.em);
    expect(u.ph).toEqual([sha("15855550123")]);
    expect(u.fn).toEqual([sha("jane")]);
    expect(u.ln).toEqual([sha("doe")]);
    expect(u.ct).toEqual([sha("newyork")]);
    expect(u.st).toEqual([sha("ny")]);
    expect(u.zp).toEqual([sha("14604")]);
  });

  it("skips a free-text state Meta could never match", () => {
    expect(buildUserData({ state: "New York" }).st).toBeUndefined();
  });

  // Meta's spec: fbc, fbp, IP and UA must NOT be hashed.
  it("passes fbc / fbp / IP / UA through in the clear", () => {
    const u = buildUserData({
      fbc: "fb.1.1727500000000.IwAR2F4-dbP0l7Mn1Iaw_QQ",
      fbp: "fb.1.1727500000000.1234567890",
      ip: "203.0.113.7",
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
    });
    expect(u.fbc).toBe("fb.1.1727500000000.IwAR2F4-dbP0l7Mn1Iaw_QQ");
    expect(u.fbp).toBe("fb.1.1727500000000.1234567890");
    expect(u.client_ip_address).toBe("203.0.113.7");
    expect(u.client_user_agent).toBe(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
    );
    expect(u.em).toBeUndefined();
  });

  it("drops malformed identifiers instead of sending them", () => {
    const u = buildUserData({ fbc: "IwAR-bare-fbclid", fbp: "", ip: "unknown" });
    expect(u).toEqual({});
  });
});

describe("cleanFbCookie", () => {
  it("accepts the pixel's cookie format", () => {
    expect(cleanFbCookie(" fb.2.1727500000000.abc ")).toBe("fb.2.1727500000000.abc");
  });
  it("rejects foreign shapes, whitespace and oversize values", () => {
    expect(cleanFbCookie("fb.1.abc.def")).toBeUndefined();
    expect(cleanFbCookie("fb.1.1727500000000.a b")).toBeUndefined();
    expect(cleanFbCookie(`fb.1.1.${"x".repeat(600)}`)).toBeUndefined();
    expect(cleanFbCookie(null)).toBeUndefined();
  });
});

describe("cleanIp", () => {
  it("accepts IPv4 and IPv6, rejects the rate limiter's 'unknown'", () => {
    expect(cleanIp("198.51.100.1")).toBe("198.51.100.1");
    expect(cleanIp("2001:db8::1")).toBe("2001:db8::1");
    expect(cleanIp("unknown")).toBeUndefined();
  });
});
