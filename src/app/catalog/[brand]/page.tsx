import { notFound } from "next/navigation";
import BrandClient from "./BrandClient";
import { getMergedCatalogCached } from "@/lib/catalog-merge";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ brand: string }>;
}

export default async function BrandPage({ params }: Params) {
  const { brand: brandSlug } = await params;
  const { brands, models } = await getMergedCatalogCached();
  const brand = brands.find((b) => b.slug === brandSlug) ?? null;
  // A real 404, not a 200 with a "not found" body — otherwise every
  // /catalog/<garbage> URL is an indexable soft-404 with canonical +
  // hreflang attached, silently eating crawl budget.
  if (!brand) notFound();
  const brandModels = brand
    ? models.filter((m) => m.brandId === brand.id)
    : [];

  return <BrandClient brand={brand} models={brandModels} />;
}
