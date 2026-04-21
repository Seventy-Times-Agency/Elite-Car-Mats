import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    title: t("cat.metaTitle"),
    description: t("cat.metaDesc"),
    openGraph: {
      title: t("cat.ogTitle"),
      description: t("cat.ogDesc"),
    },
  };
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
