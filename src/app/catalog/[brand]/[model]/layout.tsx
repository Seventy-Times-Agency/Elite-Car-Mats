import type { Metadata } from "next";
import { brands, mockModels } from "@/data/mock";
import { MAT_SET_PRICE } from "@/lib/pricing";

interface Params {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brand = brands.find((b) => b.slug === brandSlug);
  const model = mockModels.find((m) => m.slug === modelSlug && m.brandId === brand?.id);
  if (!brand || !model) return { title: "Model not found" };

  const price = MAT_SET_PRICE.full;
  const yearMin = model.years[0];
  const yearMax = model.years[model.years.length - 1];

  return {
    title: `EVA Floor Mats for ${brand.name} ${model.name}`,
    description: `Premium EVA floor mats for ${brand.name} ${model.name} ${yearMin}–${yearMax}. Custom-cut, 4 edge colors. From $${price}. U.S. shipping.`,
    openGraph: {
      title: `${brand.name} ${model.name} — EVA Floor Mats`,
      description: `Precision fit for your ${brand.name} ${model.name}. From $${price}.`,
    },
    alternates: {
      canonical: `/catalog/${brand.slug}/${model.slug}`,
    },
  };
}

export default function ModelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
