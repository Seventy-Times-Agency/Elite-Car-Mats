import BrandClient from "./BrandClient";
import { getMergedCatalog } from "@/lib/catalog-merge";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ brand: string }>;
}

export default async function BrandPage({ params }: Params) {
  const { brand: brandSlug } = await params;
  const { brands, models } = await getMergedCatalog();
  const brand = brands.find((b) => b.slug === brandSlug) ?? null;
  const brandModels = brand
    ? models.filter((m) => m.brandId === brand.id)
    : [];

  return <BrandClient brand={brand} models={brandModels} />;
}
