import type { MatSetType } from "@/types";
import { brands, mockModels } from "@/data/catalog";
import { ACCESSORIES, accessorySku } from "@/data/accessories";
import { feedSku } from "./sku";

export type ResolvedSku =
  | { kind: "mat"; brandSlug: string; modelSlug: string; set: MatSetType }
  | { kind: "accessory"; slug: string; variant: string };

const SETS: MatSetType[] = ["front", "full", "cargo", "full-cargo"];

let matIndex: Map<string, Extract<ResolvedSku, { kind: "mat" }>> | null = null;

/**
 * Reverse of `feedSku`. Slugs contain hyphens (`land-rover`,
 * `grand-cherokee`, set `full-cargo`), so the id can't be split — build
 * the id for every catalog entry once and look it up instead.
 */
function getMatIndex() {
  if (matIndex) return matIndex;
  const brandSlug = new Map(brands.map((b) => [b.id, b.slug]));
  matIndex = new Map();
  for (const model of mockModels) {
    const b = brandSlug.get(model.brandId);
    if (!b) continue;
    for (const set of SETS) {
      matIndex.set(feedSku(b, model.slug, set), {
        kind: "mat",
        brandSlug: b,
        modelSlug: model.slug,
        set,
      });
    }
  }
  return matIndex;
}

export function resolveSku(sku: string): ResolvedSku | null {
  const id = sku.trim();
  if (id.startsWith("ECM-ACC-")) {
    for (const acc of ACCESSORIES) {
      for (const v of acc.variants) {
        if (id === accessorySku(acc.slug, v.id)) {
          return { kind: "accessory", slug: acc.slug, variant: v.id };
        }
      }
    }
    return null;
  }
  return getMatIndex().get(id) ?? null;
}

/**
 * Meta Shops checkout URL: `products=<id>:<qty>,<id>:<qty>` (URL-encoded).
 * Malformed pairs are skipped; quantity defaults to 1 and is clamped.
 */
export function parseMetaProducts(raw: string | null): { sku: string; qty: number }[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((pair) => {
      const i = pair.lastIndexOf(":");
      const sku = (i > 0 ? pair.slice(0, i) : pair).trim();
      const n = i > 0 ? Number.parseInt(pair.slice(i + 1), 10) : 1;
      return { sku, qty: Number.isFinite(n) ? Math.min(Math.max(n, 1), 10) : 1 };
    })
    .filter((p) => p.sku.length > 0);
}
