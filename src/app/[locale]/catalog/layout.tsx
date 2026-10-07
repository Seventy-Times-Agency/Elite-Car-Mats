import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    alternates: await localeAlternates("/catalog"),
    title: t("cat.metaTitle"),
    description: t("cat.metaDesc"),
    openGraph: {
      title: t("cat.ogTitle"),
      description: t("cat.ogDesc"),
      // Own openGraph object replaces the root one entirely (shallow
      // merge), so the default share card has to be restated here.
      images: ["/opengraph-image"],
    },
  };
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
