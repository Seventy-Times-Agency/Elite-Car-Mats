import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    title: t("contacts.metaTitle"),
    description: t("contacts.metaDesc"),
    openGraph: {
      title: t("contacts.ogTitle"),
      description: t("contacts.ogDesc"),
    },
  };
}

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
