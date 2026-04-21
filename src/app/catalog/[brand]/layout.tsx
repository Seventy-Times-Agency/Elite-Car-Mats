import type { Metadata } from "next";
import { brands } from "@/data/mock";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

interface Params {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  if (!brand) return { title: t("brand.metaNotFound") };

  return {
    title: t("brand.metaTitle", { brand: brand.name }),
    description: t("brand.metaDesc", { brand: brand.name }),
    openGraph: {
      title: t("brand.ogTitle", { brand: brand.name }),
      description: t("brand.ogDesc", {
        brand: brand.name,
        count: brand.modelsCount,
      }),
    },
    alternates: {
      canonical: `/catalog/${brand.slug}`,
    },
  };
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
