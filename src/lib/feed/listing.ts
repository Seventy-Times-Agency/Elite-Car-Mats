import type { MatSetType } from "@/types";

/**
 * Shopping surfaces (Google Shopping, Facebook / Instagram shop) show only
 * the first few words of a title on a phone. Titles therefore lead with
 * the vehicle — what the shopper searched for — and the product words
 * follow, so 3.9k cards no longer read as one repeated "EVA Floor Mats
 * for…".
 */

// Canonical (Russian) set labels from src/data/catalog/mat-sets.ts →
// the plain-English part a US shopper understands.
const SET_PART_EN: Record<string, string> = {
  "Передние": "Front Row Set",
  "Только первый ряд": "Front Row Set",
  "Перед + зад": "Front & Rear Set",
  "Полный комплект": "Complete Set with Cargo Mat",
  "Всё вместе": "Complete Set with Cargo Mat",
  "Кабина": "Truck Cab Set",
  "Перед + середина": "Front & 2nd Row Set",
  "Перед + середина + зад": "3-Row Set",
};

export function feedYears(yMin: number, yMax: number): string {
  if (!yMin) return "";
  return yMin === yMax || !yMax ? String(yMin) : `${yMin}–${yMax}`;
}

export function feedTitle(opts: {
  brand: string;
  model: string;
  yMin: number;
  yMax: number;
  setType: MatSetType;
  setLabelRu: string;
  /** Localized fallback for a label missing from SET_PART_EN. */
  setLabelEn: string;
}): string {
  const car = [opts.brand, opts.model, feedYears(opts.yMin, opts.yMax)]
    .filter(Boolean)
    .join(" ");
  if (opts.setType === "cargo") {
    return `${car} Cargo Mat — Custom Fit EVA Trunk Liner`;
  }
  const part = SET_PART_EN[opts.setLabelRu] ?? opts.setLabelEn;
  return `${car} Floor Mats — ${part}, Custom Fit EVA`;
}

/**
 * Unbranded studio shots (public/mats/clean/) — Merchant Center rejects
 * main images carrying the store lockup. Several colour pairs so
 * neighbouring models in a feed grid don't show the identical picture;
 * the colour stays a configurator choice, the image only illustrates.
 */
export const FEED_CABIN_IMAGES = [
  "black-red",
  "black-beige",
  "beige-dark-brown",
  "black-navy",
  "gray-black",
  "black-white",
  "brown-dark-brown",
  "black-yellow",
  "beige-beige",
  "black-light-gray",
  "black-black",
] as const;

// Real install photos; none shows a car badge (the truck shot carries
// only our own sewn-on tag, part of the product).
const SEMI_CAB = "/mats/gallery/g15-truck-cabin.jpg";
const CARGO_SEDAN = "/mats/gallery/g06-trunk-sedan.jpg";
const CARGO_SUV = "/mats/gallery/g07-trunk-suv.jpg";
const SEDAN_LIKE = new Set(["Седан", "Купе", "Кабриолет"]);

function stableIndex(key: string, size: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % size;
}

/**
 * Main image path for one feed item. Deterministic per model, so every
 * set of the same car shares one colour and the feed doesn't churn
 * images (and re-trigger review) between fetches.
 */
export function feedImagePath(
  modelKey: string,
  setType: MatSetType,
  bodyType: string | undefined,
  profile?: string,
): string {
  if (profile === "semi") return SEMI_CAB;
  if (setType === "cargo") {
    return bodyType && SEDAN_LIKE.has(bodyType) ? CARGO_SEDAN : CARGO_SUV;
  }
  const colour = FEED_CABIN_IMAGES[stableIndex(modelKey, FEED_CABIN_IMAGES.length)];
  return `/mats/clean/${colour}.jpg`;
}
