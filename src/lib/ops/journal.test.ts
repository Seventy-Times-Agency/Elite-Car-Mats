import { describe, expect, it } from "vitest";
import { fingerprint, normalizeForFingerprint, reportProblem, listProblems } from "./journal";

describe("problem journal", () => {
  it("folds repeats that differ only by ids and numbers", () => {
    const a = fingerprint("order.create", "Order ECM-20260927-4821 failed: P2003 on cmukfdgby000004kz17y0ghtj");
    const b = fingerprint("order.create", "Order ECM-20260928-1177 failed: P2003 on cmukfdggl000104kzvj3vqnaa");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{8}$/);
  });

  it("keeps different areas and different messages apart", () => {
    expect(fingerprint("order.create", "timeout")).not.toBe(fingerprint("checkout.session", "timeout"));
    expect(fingerprint("email.send", "rate limited")).not.toBe(fingerprint("email.send", "invalid from"));
  });

  it("normalises case and whitespace", () => {
    expect(normalizeForFingerprint("  Card   DECLINED 402 ")).toBe("card declined #");
  });

  it("is a silent no-op without Redis", async () => {
    await expect(reportProblem({ area: "capi", severity: "warning", message: "x" })).resolves.toBeUndefined();
    await expect(listProblems()).resolves.toBeNull();
  });
});
