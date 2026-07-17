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
    <ProductClient
      brand={brand}
      model={model ?? null}
      addonAvailability={addonAvailability}
    />
  );
}
