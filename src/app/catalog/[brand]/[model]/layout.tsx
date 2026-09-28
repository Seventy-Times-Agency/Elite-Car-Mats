import type { Metadata } from "next";
import { getMergedCatalogCached } from "@/lib/catalog-merge";
import { getMatSetPrice, shippingCopyVars } from "@/lib/pricing";
import { loadPriceOverridesCached } from "@/lib/pricing-overrides";
import { getVehicleProfile, getDefaultMatSet } from "@/lib/vehicle-profile";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";
import { getModelGuide } from "@/data/model-guides";

const MODEL_OG_IMAGE = "/mats/black-black.jpg";

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
  const { locale, dict, fallback } = await getDictionary();
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
    ...shippingCopyVars(overrides),
  };

  const guide = locale === "en" ? getModelGuide(brand.slug, model.slug) : null;

  return {
    title: t("prod.metaTitle", vars),
    description: guide?.metaDescription ?? t("prod.metaDesc", vars),
    openGraph: {
      title: t("prod.ogTitle", vars),
      description: t("prod.ogDesc", vars),
      // Real product photo — the model page's share card and the one
      // Google may pick for the rich result.
      images: [{ url: MODEL_OG_IMAGE, width: 900, height: 1350 }],
    },
    alternates: await localeAlternates(`/catalog/${brand.slug}/${model.slug}`),
  };
}

export default function ModelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
