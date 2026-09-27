import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ACCESSORIES } from "@/data/accessories";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";
import { loadPriceOverridesCached } from "@/lib/pricing-overrides";
import { formatPrice, getAccessoryPrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    title: t("acc.listMeta"),
    description: t("acc.listMetaDesc"),
    alternates: await localeAlternates("/accessories"),
  };
}

export default async function AccessoriesPage() {
  const [{ dict, fallback }, overrides] = await Promise.all([
    getDictionary(),
    loadPriceOverridesCached(),
  ]);
  const t = makeT(dict, fallback);
  return (
    <div className="py-14 lg:py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">{t("acc.listTitle")}</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">{t("acc.listTitle")}</h1>
          <p className="mt-3 text-text-dim text-sm">{t("acc.listSubtitle")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ACCESSORIES.map((a) => (
            <Link
              key={a.slug}
              href={`/accessories/${a.slug}`}
              className="glass-card rounded-2xl overflow-hidden group hover:border-gold/40 transition-colors"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={a.variants[0].images[0]}
                  alt={t(`acc.${a.slug}.name`)}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-text">{t(`acc.${a.slug}.name`)}</h2>
                <p className="mt-2 text-sm text-text-dim leading-relaxed">
                  {t(`acc.${a.slug}.short`)}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-gold font-semibold">
                    {formatPrice(getAccessoryPrice(a.slug, overrides))}
                  </span>
                  <span className="flex gap-1.5" aria-hidden>
                    {a.variants.map((v) => (
                      <span
                        key={v.id}
                        className="w-4 h-4 rounded-sm border-2"
                        style={{
                          backgroundColor: v.evaColorId === "black" ? "#2B2C30" : "#5B5E64",
                          borderColor: v.edgeColorId === "red" ? "#D0202A" : "#BEC1C6",
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
