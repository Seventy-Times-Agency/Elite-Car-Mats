import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import { getMergedCatalogCached } from "@/lib/catalog-merge";
import { getAddonAvailability } from "@/lib/availability";

interface Params {
  params: Promise<{ brand: string; model: string }>;
}

export default async function ProductPage({ params }: Params) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const [{ brands, models }, addonAvailability] = await Promise.all([
    getMergedCatalogCached(),
    getAddonAvailability(),
  ]);
  const brand = brands.find((b) => b.slug === brandSlug) ?? null;
  const model =
    brand &&
    (models.find((m) => m.slug === modelSlug && m.brandId === brand.id) ??
      null);
  // Real 404 for unknown brand/model — see the note in ../page.tsx.
  if (!brand || !model) notFound();

  return (
    // Keyed by brand+model: App Router reuses the client component
    // instance across product→product navigation (⌘K search), which let
    // the previous car's `year` / configNote state leak into the next
    // order. The key remounts the configurator with fresh state.
    // Suspense: ProductClient consumes useSearchParams (?set= deep-links),
    // which Next 16 requires to sit under a boundary once any static
    // rendering is enabled for the route.
    <Suspense fallback={null}>
      <ProductClient
        key={`${brandSlug}-${modelSlug}`}
        brand={brand}
        model={model ?? null}
        addonAvailability={addonAvailability}
      />
    </Suspense>
  );
}
