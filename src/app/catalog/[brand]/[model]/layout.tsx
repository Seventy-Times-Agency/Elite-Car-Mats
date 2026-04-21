import type { Metadata } from "next";
import { brands, mockModels } from "@/data/mock";
import { MAT_SET_PRICE } from "@/lib/pricing";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

interface Params {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brand = brands.find((b) => b.slug === brandSlug);
  const model = mockModels.find(
    (m) => m.slug === modelSlug && m.brandId === brand?.id,
  );
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  if (!brand || !model) return { title: t("prod.metaNotFound") };

  const price = MAT_SET_PRICE.full;
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
    alternates: {
      canonical: `/catalog/${brand.slug}/${model.slug}`,
    },
  };
}

export default function ModelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
