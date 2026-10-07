import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import { getMergedCatalogCached } from "@/lib/catalog-merge";
import { getAddonAvailabilityCached } from "@/lib/availability";
import { getModelGuide } from "@/data/model-guides";
import { getDictionary } from "@/i18n/getDictionary";

// No paths at build time: each one renders on its first request and is
// then served from the ISR cache until a data tag it read (`catalog`,
// `pricing`, …) is revalidated or the hour-long data-cache TTL runs out.
export function generateStaticParams() {
  return [];
}

interface Params {
  params: Promise<{ brand: string; model: string }>;
}

export default async function ProductPage({ params }: Params) {
  const { brand: brandSlug, model: modelSlug } = await params;
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
    />
  );
}
