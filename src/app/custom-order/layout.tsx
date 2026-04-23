import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    title: t("custom.metaTitle"),
    description: t("custom.metaDesc"),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
