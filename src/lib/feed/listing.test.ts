import { describe, expect, it } from "vitest";
import { feedImagePath, feedTitle, FEED_CABIN_IMAGES } from "./listing";

const base = { brand: "Toyota", model: "Camry", yMin: 2018, yMax: 2024, setLabelEn: "x" };

describe("feedTitle", () => {
  it("leads with the vehicle and years", () => {
    expect(feedTitle({ ...base, setType: "full", setLabelRu: "Перед + зад" })).toBe(
      "Toyota Camry 2018–2024 Floor Mats — Front & Rear Set, Custom Fit EVA",
    );
  });

  it("names the cargo mat as a trunk liner", () => {
    expect(feedTitle({ ...base, setType: "cargo", setLabelRu: "Только багажник" })).toBe(
      "Toyota Camry 2018–2024 Cargo Mat — Custom Fit EVA Trunk Liner",
    );
  });

  it("falls back to the localized label and skips missing years", () => {
    expect(
      feedTitle({ ...base, yMin: 0, yMax: 0, setType: "front", setLabelRu: "?", setLabelEn: "Odd" }),
    ).toBe("Toyota Camry Floor Mats — Odd, Custom Fit EVA");
  });
});

describe("feedImagePath", () => {
  it("is stable per model and uses a clean cabin shot", () => {
    const a = feedImagePath("toyota-camry", "full", "Седан");
    expect(a).toBe(feedImagePath("toyota-camry", "full-cargo", "Седан"));
    expect(FEED_CABIN_IMAGES.map((c) => `/mats/clean/${c}.jpg`)).toContain(a);
  });

  it("uses a real trunk photo for the cargo set", () => {
    expect(feedImagePath("toyota-camry", "cargo", "Седан")).toContain("trunk-sedan");
    expect(feedImagePath("toyota-rav4", "cargo", "Кроссовер")).toContain("trunk-suv");
  });

  it("shows the real truck cab for semis", () => {
    expect(feedImagePath("freightliner-cascadia", "front", "Седельный тягач", "semi")).toContain("truck-cabin");
  });

  it("spreads colours across models", () => {
    const keys = ["toyota-camry", "honda-civic", "ford-f-150", "bmw-x5", "kia-sorento", "audi-a4"];
    const set = new Set(keys.map((k) => feedImagePath(k, "full", "Седан")));
    expect(set.size).toBeGreaterThan(2);
  });
});
