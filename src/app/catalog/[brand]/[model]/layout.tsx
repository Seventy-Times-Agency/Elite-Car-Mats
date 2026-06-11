import type { Metadata } from "next";
import { getMergedCatalogCached } from "@/lib/catalog-merge";
import { getMatSetPrice } from "@/lib/pricing";
import { loadPriceOverridesCached } from "@/lib/pricing-overrides";
import { getVehicleProfile, getDefaultMatSet } from "@/lib/vehicle-profile";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";

interface Params {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params;
  const { brands, models } = await getMergedCatalogCached();
  const brand = brands.find((b) => b.slug === brandSlug);
  const model = models.find(
    (m) => m.slug === modelSlug && m.brandId === brand?.id,
  );
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  if (!brand || !model) return { title: t("prod.metaNotFound") };

  const profile = getVehicleProfile(model);
  const overrides = await loadPriceOverridesCached();
  const price = getMatSetPrice(profile, getDefaultMatSet(profile), overrides);
  const yMin = model.years[0];
  const yMax = model.years[model.years.length - 1];
  const vars = {
    brand: brand.name,
    model: model.name,
    yMin,
    yMax,
    price,
  };

  return {
    title: t("prod.metaTitle", vars),
    description: t("prod.metaDesc", vars),
    openGraph: {
      title: t("prod.ogTitle", vars),
      description: t("prod.ogDesc", vars),
    },
    alternates: await localeAlternates(`/catalog/${brand.slug}/${model.slug}`),
  };
}

export default function ModelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
