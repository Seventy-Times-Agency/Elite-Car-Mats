import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import { getMergedCatalogCached } from "@/lib/catalog-merge";
import { getAddonAvailabilityCached } from "@/lib/availability";
import { getModelGuide } from "@/data/model-guides";
import { getDictionary } from "@/i18n/getDictionary";
import type { MatSetType } from "@/types";

/**
 * Server render of a model page, shared by the plain route and the
 * `set/[set]` variant that src/proxy.ts rewrites `?set=` deep links onto.
 * `initialSet` lets the variant ship the right set — visible price and
 * Product JSON-LD — in its HTML for crawlers that don't run JS.
 */
export async function renderProductPage(
  brandSlug: string,
  modelSlug: string,
  initialSet?: MatSetType,
) {
  const [{ brands, models }, addonAvailability, { locale }] = await Promise.all([
    getMergedCatalogCached(),
    getAddonAvailabilityCached(),
    getDictionary(),
  ]);
  const brand = brands.find((b) => b.slug === brandSlug) ?? null;
  const model =
    brand &&
    (models.find((m) => m.slug === modelSlug && m.brandId === brand.id) ??
      null);
  // Real 404 for unknown brand/model — see the note in ../page.tsx.
  if (!brand || !model) notFound();
  // Guides are English-only; ru/uk pages keep the generic copy rather
  // than mixing languages.
  const guide = locale === "en" ? getModelGuide(brand.slug, model.slug) : null;

  return (
    // Keyed by brand+model: App Router reuses the client component
    // instance across product→product navigation (⌘K search), which let
    // the previous car's `year` / configNote state leak into the next
    // order. The key remounts the configurator with fresh state.
    <ProductClient
      key={`${brandSlug}-${modelSlug}`}
      brand={brand}
      model={model ?? null}
      addonAvailability={addonAvailability}
      guide={guide}
      initialSet={initialSet}
    />
  );
}
