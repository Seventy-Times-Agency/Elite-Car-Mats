import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    alternates: await localeAlternates("/track"),
    title: t("track.meta"),
    description: t("track.metaDesc"),
    robots: { index: false, follow: false },
  };
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
