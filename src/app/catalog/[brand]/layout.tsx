import type { Metadata } from "next";
import { brands } from "@/data/mock";

interface Params {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) return { title: "Brand not found" };

  return {
    title: `${brand.name} Floor Mats`,
    description: `Premium EVA floor mats for ${brand.name}: custom-cut for every model and year. Free U.S. shipping on orders over $99.`,
    openGraph: {
      title: `${brand.name} Floor Mats — Elite Car Mats`,
      description: `EVA mats for ${brand.name}. ${brand.modelsCount} models. Precision fit by year.`,
    },
    alternates: {
      canonical: `/catalog/${brand.slug}`,
    },
  };
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
