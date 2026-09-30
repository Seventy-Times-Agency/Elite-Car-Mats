import type { NewCartItem } from "@/context/CartContext";
import { brands, mockModels, evaColors, edgeColors } from "@/data/catalog";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";
import { getVehicleProfile } from "@/lib/vehicle-profile";
import { parseMetaProducts, resolveSku } from "@/lib/feed/resolve-sku";

/**
 * Turn Meta's `products=<id>:<qty>,…` into cart lines. Mats arrive as
 * `pendingSetup` lines (year 0, black/black) — the catalog item doesn't
 * say which year or colours the buyer wants, so /cart asks before
 * checkout. Unknown ids are dropped.
 */
export function cartLinesFromMeta(raw: string | null): NewCartItem[] {
  const lines: NewCartItem[] = [];
  for (const { sku, qty } of parseMetaProducts(raw)) {
    const target = resolveSku(sku);
    if (!target) continue;
    if (target.kind === "accessory") {
      lines.push({
        kind: "accessory",
        accessorySlug: target.slug,
        variantId: target.variant,
        quantity: qty,
      });
      continue;
    }
    const brand = brands.find((b) => b.slug === target.brandSlug);
    const model = brand
      ? mockModels.find((m) => m.brandId === brand.id && m.slug === target.modelSlug)
      : undefined;
    if (!brand || !model) continue;
    const profile = getVehicleProfile(model);
    const set = MAT_SETS_BY_PROFILE[profile].find((s) => s.type === target.set);
    if (!set) continue;
    lines.push({
      kind: "mat",
      modelId: `${brand.slug}-${model.slug}`,
      profile,
      brandName: brand.name,
      modelName: model.name,
      year: 0,
      matSet: set.type,
      matSetLabel: set.label,
      color: evaColors[0],
      edgeColor: edgeColors[0],
      quantity: qty,
      pendingSetup: true,
    });
  }
  return lines;
}
