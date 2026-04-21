"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { brands, mockModels } from "@/data/mock";
import { VehicleCategory } from "@/types";
import { useT } from "@/i18n/I18nProvider";
import { localizeBody } from "@/i18n/labels";

const CATEGORY_ORDER: VehicleCategory[] = ["car", "suv", "truck"];

const CATEGORY_ICONS: Record<VehicleCategory, React.ReactNode> = {
  car: (
    <svg viewBox="0 0 40 24" fill="none" className="w-full h-full" aria-hidden>
      <path d="M3 16 L5 11 Q7 7, 11 6.5 L29 6.5 Q33 7, 35 11 L37 16 L37 19 L3 19 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M8 11.5 Q10 8.5, 13 8.2 L27 8.2 Q30 8.5, 32 11.5 L32 13.5 L8 13.5 Z" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.55" />
      <circle cx="10" cy="19" r="2.8" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <circle cx="30" cy="19" r="2.8" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  ),
  suv: (
    <svg viewBox="0 0 40 24" fill="none" className="w-full h-full" aria-hidden>
      <path d="M3 17 L4 10 Q5 6, 9 5.5 L30 5.5 Q34 6, 35 10 L37 17 L37 20 L3 20 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M7 10 Q8 7.5, 11 7.2 L28 7.2 Q31 7.5, 32 10 L32 12.5 L7 12.5 Z" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.55" />
      <circle cx="10" cy="20" r="2.8" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <circle cx="30" cy="20" r="2.8" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 40 24" fill="none" className="w-full h-full" aria-hidden>
      <path d="M3 17 L4 11 Q5 7.5, 9 7.2 L18 7.2 L18 17 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M7 11.5 Q8 9, 10 8.8 L16 8.8 L16 12 L7 12 Z" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.55" />
      <rect x="18" y="9" width="19" height="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <line x1="3" y1="17" x2="37" y2="17" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10" cy="20" r="2.8" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <circle cx="30" cy="20" r="2.8" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  ),
};

const CATEGORY_LABEL_KEY: Record<VehicleCategory, string> = {
  car: "cat.cars",
  suv: "cat.suvs",
  truck: "cat.trucks",
};

export default function BrandPage() {
  const params = useParams();
  const t = useT();
  const brand = brands.find((b) => b.slug === params.brand);
  const [filter, setFilter] = useState<VehicleCategory | "all">("all");

  const models = useMemo(
    () => (brand ? mockModels.filter((m) => m.brandId === brand.id) : []),
    [brand],
  );

  const availableCategories = useMemo(() => {
    const set = new Set(models.map((m) => m.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [models]);

  if (!brand)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">{t("brand.notFound")}</h1>
      </div>
    );

  const visibleModels =
    filter === "all" ? models : models.filter((m) => m.category === filter);
  const showFilter = availableCategories.length > 1;

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-10 text-xs text-text-dim">
          <Link href="/catalog" className="hover:text-gold transition-colors">
            {t("brand.breadcrumbCatalog")}
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-text">{brand.name}</span>
        </nav>

        <div className="flex items-center gap-4 mb-10">
          {brand.logo && (
            <div className="w-16 h-12 relative shrink-0">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              {t("brand.titlePrefix")} <span className="text-gold">{brand.name}</span>
            </h1>
            <p className="mt-1 text-text-dim text-sm">{t("brand.subtitle")}</p>
          </div>
        </div>

        {showFilter && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${filter === "all" ? "bg-gradient-to-r from-gold to-gold-light text-bg font-medium shadow-[0_2px_12px_rgba(212,165,74,0.3)]" : "glass-card text-text-dim hover:text-gold hover:border-gold/30"}`}
            >
              {t("brand.allFilter")} ({models.length})
            </button>
            {availableCategories.map((c) => {
              const count = models.filter((m) => m.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${filter === c ? "bg-gradient-to-r from-gold to-gold-light text-bg font-medium shadow-[0_2px_12px_rgba(212,165,74,0.3)]" : "glass-card text-text-dim hover:text-gold hover:border-gold/30"}`}
                >
                  {t(CATEGORY_LABEL_KEY[c])} ({count})
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {visibleModels.map((m) => {
            const y = m.years[m.years.length - 1];
            return (
              <Link
                key={m.id}
                href={`/catalog/${brand.slug}/${m.slug}`}
                className="group relative rounded-xl p-4 bg-gradient-to-b from-[#1A1A1A] to-[#131313] border border-border/60 hover:border-gold/50 transition-all duration-300 overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_24px_rgba(212,165,74,0.08)]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-gold/[0.06] via-transparent to-transparent pointer-events-none" aria-hidden />
                <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden>
                  <div className="absolute top-2.5 right-2.5 w-5 h-[1px] bg-gradient-to-l from-gold to-transparent" />
                  <div className="absolute top-2.5 right-2.5 h-5 w-[1px] bg-gradient-to-b from-gold to-transparent" />
                </div>

                <div className="w-10 h-6 text-text-faint group-hover:text-gold transition-colors duration-300 mb-3">
                  {CATEGORY_ICONS[m.category]}
                </div>

                <h3 className="text-sm font-semibold leading-tight text-text group-hover:text-gold transition-colors duration-300 min-h-[2.6rem] line-clamp-2">
                  {m.name}
                </h3>

                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-text-faint group-hover:text-text-dim transition-colors">
                    {localizeBody(t, m.bodyType)}
                  </span>
                  <span className="text-[10px] font-medium text-text-faint group-hover:text-gold/70 transition-colors tabular-nums">
                    {m.years[0]}–{y}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {visibleModels.length === 0 && (
          <div className="text-center py-16 text-text-dim">
            {t("brand.emptyCategory")}
          </div>
        )}
      </div>
    </div>
  );
}
