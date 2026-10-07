import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";
import { getShippingCopyVars } from "@/lib/pricing-overrides";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    alternates: await localeAlternates("/delivery"),
    title: t("delivery.metaTitle"),
    description: t("delivery.metaDesc", await getShippingCopyVars()),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
