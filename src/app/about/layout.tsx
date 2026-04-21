import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    title: t("about.metaTitle"),
    description: t("about.metaDesc"),
    openGraph: {
      title: t("about.ogTitle"),
      description: t("about.ogDesc"),
    },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
