import type { TFn } from "@/i18n/dictionary";
import { evaColors, edgeColors } from "@/data/catalog/colors";
import { accessorySku, findAccessoryVariant } from "@/data/accessories";

/**
 * Everything a renderer needs to show one accessory line. Shared by the
 * cart drawer, cart page, checkout summary, order page, admin order row
 * and the emails so the copy and the swatches match everywhere.
 */
export interface AccessoryView {
  title: string;
  /** Localised variant label, e.g. "Black · red trim". */
  variantLabel: string;
  image: string;
  evaHex: string;
  edgeHex: string;
  sku: string;
}

export function accessoryView(
  t: TFn,
  slug: string,
  variantId: string,
): AccessoryView {
  const found = findAccessoryVariant(slug, variantId);
  // An unknown pair can only come from a stale cart; render something
  // legible rather than crash — the order API rejects it anyway.
  const title = t(`acc.${slug}.name`);
  if (!found) {
    return { title, variantLabel: variantId, image: "", evaHex: "#444", edgeHex: "#888", sku: accessorySku(slug, variantId) };
  }
  const { variant } = found;
  return {
    title,
    variantLabel: t(`acc.variant.${variant.id}`),
    image: variant.images[0] ?? "",
    evaHex: evaColors.find((c) => c.id === variant.evaColorId)?.hex ?? "#444",
    edgeHex: edgeColors.find((c) => c.id === variant.edgeColorId)?.hex ?? "#888",
    sku: accessorySku(slug, variant.id),
  };
}
