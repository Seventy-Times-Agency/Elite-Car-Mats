"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { brands, mockModels } from "@/data/mock";
import { VehicleCategory } from "@/types";
import { useT } from "@/i18n/I18nProvider";
import { localizeBody } from "@/i18n/labels";

const CATEGORY_ORDER: VehicleCategory[] = ["car", "suv", "truck", "commercial"];

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
  commercial: (
    <svg viewBox="0 0 48 24" fill="none" className="w-full h-full" aria-hidden>
      <path d="M3 18 L3 9 Q3 6.5, 5.5 6.5 L15 6.5 L15 18 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M15 18 L15 11 L18 11 L20 14 L20 18 Z" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.85" />
      <rect x="20" y="7.5" width="24" height="10.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <line x1="3" y1="18" x2="44" y2="18" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9" cy="20" r="2.6" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <circle cx="27" cy="20" r="2.6" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <circle cx="35" cy="20" r="2.6" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  ),
};

const CATEGORY_LABEL_KEY: Record<VehicleCategory, string> = {
  car: "cat.cars",
  suv: "cat.suvs",
  truck: "cat.trucks",
  commercial: "cat.commercial",
};

export default function BrandPage() {
  const params = useParams();
  const t = useT();
  const brand = brands.find((b) => b.slug === params.brand);
  const [filter, setFilter] = useState<VehicleCategory | "all">("all");
  const [query, setQuery] = useState("");

  const allModels = useMemo(
    () => (brand ? mockModels.filter((m) => m.brandId === brand.id) : []),
    [brand],
  );

  const availableCategories = useMemo(() => {
    const set = new Set(allModels.map((m) => m.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [allModels]);

  if (!brand)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">{t("brand.notFound")}</h1>
      </div>
    );

  const byCategory =
    filter === "all"
      ? allModels
      : allModels.filter((m) => m.category === filter);

  const q = query.trim().toLowerCase();
  const visibleModels = q
    ? byCategory.filter((m) => m.name.toLowerCase().includes(q))
    : byCategory;

  const showFilter = availableCategories.length > 1;

  return (
    <div className="py-12 lg:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 text-xs text-text-dim">
          <Link href="/catalog" className="hover:text-gold transition-colors">
            {t("brand.breadcrumbCatalog")}
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-text">{brand.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-4">
            {brand.logo && (
              <div className="w-14 h-11 relative shrink-0">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                {t("brand.titlePrefix")}{" "}
                <span className="text-gold">{brand.name}</span>
              </h1>
              <p className="mt-0.5 text-text-dim text-xs">
                {t("catalog.modelsCount", { n: allModels.length })}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("catalog.searchPh")}
              aria-label={t("catalog.searchAria")}
              className="w-full glass-card rounded-lg pl-10 pr-9 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-gold p-1"
                aria-label={t("catalog.clearAria")}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {showFilter && (
          <div className="flex flex-wrap gap-2 mb-7">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${filter === "all" ? "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_2px_12px_rgba(212,165,74,0.3)]" : "glass-card text-text-dim hover:text-gold hover:border-gold/30"}`}
            >
              {t("brand.allFilter")} · {allModels.length}
            </button>
            {availableCategories.map((c) => {
              const count = allModels.filter((m) => m.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${filter === c ? "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_2px_12px_rgba(212,165,74,0.3)]" : "glass-card text-text-dim hover:text-gold hover:border-gold/30"}`}
                >
                  {t(CATEGORY_LABEL_KEY[c])} · {count}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {visibleModels.map((m) => {
            const yFirst = m.years[0];
            const yLast = m.years[m.years.length - 1];
            return (
              <Link
                key={m.id}
                href={`/catalog/${brand.slug}/${m.slug}`}
                className="group relative rounded-xl overflow-hidden bg-[linear-gradient(180deg,#1C1C1C_0%,#121212_100%)] border border-border/60 hover:border-gold/50 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_22px_rgba(0,0,0,0.4),0_0_18px_rgba(212,165,74,0.1)]"
              >
                {/* Top accent strip */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-5 text-gold/60 group-hover:text-gold transition-colors duration-300 shrink-0">
                      {CATEGORY_ICONS[m.category]}
                    </div>
                    <span className="text-[9px] font-mono text-text-faint group-hover:text-gold/70 transition-colors tabular-nums whitespace-nowrap shrink-0">
                      {yFirst === yLast ? yFirst : `${yFirst}–${yLast}`}
                    </span>
                  </div>

                  <h3 className="mt-2 text-[13px] font-semibold leading-tight text-text group-hover:text-gold transition-colors duration-300 line-clamp-2 min-h-[2.4rem]">
                    {m.name}
                  </h3>

                  <div className="mt-2 pt-2 border-t border-border/35 flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase tracking-[0.12em] text-text-faint group-hover:text-text-dim transition-colors truncate">
                      {localizeBody(t, m.bodyType)}
                    </span>
                    <svg
                      className="w-3 h-3 text-gold/40 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {visibleModels.length === 0 && (
          <div className="text-center py-16 text-text-dim">
            {q
              ? t("catalog.noResults", { query })
              : t("brand.emptyCategory")}
          </div>
        )}
      </div>
    </div>
  );
}
