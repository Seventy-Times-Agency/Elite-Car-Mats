import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    title: t("co.meta"),
    robots: { index: false, follow: false },
  };
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
