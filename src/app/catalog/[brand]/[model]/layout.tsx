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
  if (!brand || !model) return { title: "Модель не найдена" };

  const price = MAT_SET_PRICE.full;
  const yearMin = model.years[0];
  const yearMax = model.years[model.years.length - 1];

  return {
    title: `EVA коврики для ${brand.name} ${model.name}`,
    description: `Премиальные EVA коврики для ${brand.name} ${model.name} ${yearMin}–${yearMax}. Индивидуальный раскрой, 4 цвета окантовки. От $${price}. Доставка по США.`,
    openGraph: {
      title: `${brand.name} ${model.name} — EVA коврики`,
      description: `Точный раскрой под ${brand.name} ${model.name}. От $${price}.`,
    },
    alternates: {
      canonical: `/catalog/${brand.slug}/${model.slug}`,
    },
  };
}

export default function ModelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
