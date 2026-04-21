import type { Metadata } from "next";
import { brands } from "@/data/mock";

interface Params {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) return { title: "Бренд не найден" };

  return {
    title: `Коврики для ${brand.name}`,
    description: `Премиальные EVA автоковрики для ${brand.name}: индивидуальный раскрой под все модели и годы. Бесплатная доставка по США от $99.`,
    openGraph: {
      title: `Коврики для ${brand.name} — Elite Car Mats`,
      description: `EVA коврики для ${brand.name}. ${brand.modelsCount} моделей. Точная подгонка по году выпуска.`,
    },
    alternates: {
      canonical: `/catalog/${brand.slug}`,
    },
  };
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
