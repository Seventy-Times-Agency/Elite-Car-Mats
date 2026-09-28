import { describe, expect, it } from "vitest";
import { fbcValue, shouldWriteFbc } from "./fbclid";

const stash = { fbclid: "IwAR2F4-dbP0l7Mn1Iaw_QQ", ts: 1727500000000 };

describe("fbcValue", () => {
  it("matches the pixel's own _fbc format", () => {
    expect(fbcValue(stash)).toBe("fb.1.1727500000000.IwAR2F4-dbP0l7Mn1Iaw_QQ");
  });
});

describe("shouldWriteFbc", () => {
  it("writes when there is no cookie yet", () => {
    expect(shouldWriteFbc(null, stash)).toBe(true);
    expect(shouldWriteFbc("", stash)).toBe(true);
  });
  it("leaves the pixel's cookie for the same click alone", () => {
    expect(shouldWriteFbc(`fb.1.1727500000999.${stash.fbclid}`, stash)).toBe(false);
  });
  it("replaces an older click, keeps a newer one", () => {
    expect(shouldWriteFbc("fb.1.1700000000000.older", stash)).toBe(true);
    expect(shouldWriteFbc("fb.1.1800000000000.newer", stash)).toBe(false);
  });
  it("replaces a malformed cookie", () => {
    expect(shouldWriteFbc("garbage", stash)).toBe(true);
  });
});
