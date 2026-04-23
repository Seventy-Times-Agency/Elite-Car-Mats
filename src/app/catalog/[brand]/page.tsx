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

const CATEGORY_LABEL_KEY: Record<VehicleCategory, string> = {
  car: "cat.cars",
  suv: "cat.suvs",
  truck: "cat.trucks",
  commercial: "cat.commercial",
};

// Subtle distinct accent per category — all stay inside the warm luxury
// palette but each reads as its own chip so scanning the list is easy.
const CATEGORY_CHIP: Record<VehicleCategory, string> = {
  car: "bg-gold/10 text-gold/90 ring-1 ring-inset ring-gold/25",
  suv: "bg-[#E8B974]/10 text-[#E8B974] ring-1 ring-inset ring-[#E8B974]/25",
  truck: "bg-[#C88A3E]/12 text-[#E2A25A] ring-1 ring-inset ring-[#C88A3E]/30",
  commercial:
    "bg-[#B4B4B8]/10 text-[#CFCFD4] ring-1 ring-inset ring-[#B4B4B8]/25",
};

const CATEGORY_RAIL: Record<VehicleCategory, string> = {
  car: "from-gold/0 via-gold/70 to-gold/0",
  suv: "from-[#E8B974]/0 via-[#E8B974] to-[#E8B974]/0",
  truck: "from-[#C88A3E]/0 via-[#E2A25A] to-[#C88A3E]/0",
  commercial: "from-[#B4B4B8]/0 via-[#CFCFD4] to-[#B4B4B8]/0",
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
      <div className="py-20 text-center px-4">
        <h1 className="text-xl font-bold">{t("brand.notFound")}</h1>
        <Link
          href="/custom-order"
          className="mt-5 inline-flex items-center gap-2 text-gold hover:text-gold-light text-sm transition-colors"
        >
          {t("custom.ctaFromSearch")}
        </Link>
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
          <div className="flex flex-wrap gap-2 mb-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {visibleModels.map((m) => {
            const yFirst = m.years[0];
            const yLast = m.years[m.years.length - 1];
            return (
              <Link
                key={m.id}
                href={`/catalog/${brand.slug}/${m.slug}`}
                className="group relative flex items-stretch rounded-lg overflow-hidden bg-[linear-gradient(135deg,#1a1a1a_0%,#111_100%)] border border-border/55 hover:border-gold/50 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.5),0_0_16px_rgba(212,165,74,0.1)]"
              >
                {/* Category-tinted rail on the left, glows on hover */}
                <div
                  className={`w-[3px] bg-gradient-to-b ${CATEGORY_RAIL[m.category]} opacity-55 group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex-1 min-w-0 px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2 min-w-0">
                    <h3 className="text-[13px] font-bold leading-tight text-text group-hover:text-gold transition-colors duration-300 truncate">
                      {m.name}
                    </h3>
                    <span className="text-[9px] font-mono font-medium text-text-faint group-hover:text-gold/80 transition-colors tabular-nums whitespace-nowrap shrink-0">
                      {yFirst === yLast ? yFirst : `${yFirst}–${yLast}`}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border/25 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-[2px] rounded-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] leading-none ${CATEGORY_CHIP[m.category]}`}
                    >
                      {localizeBody(t, m.bodyType)}
                    </span>
                    <svg
                      className="w-3 h-3 text-gold/35 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0"
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
          <div className="text-center py-10 text-text-dim">
            {q
              ? t("catalog.noResults", { query })
              : t("brand.emptyCategory")}
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`/custom-order?make=${encodeURIComponent(brand.name)}${q ? `&model=${encodeURIComponent(query)}` : ""}`}
            className="group relative block rounded-xl overflow-hidden border border-gold/30 bg-gradient-to-br from-[#1a1500] via-[#141110] to-[#0F0F0F] hover:border-gold/55 transition-all duration-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.5),0_0_22px_rgba(212,165,74,0.15)]"
          >
            <div className="relative px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold/15 text-gold shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-text text-sm lg:text-base font-bold">
                  {t("brand.customCta", { brand: brand.name })}
                </h3>
                <p className="mt-0.5 text-text-dim text-xs leading-relaxed">
                  {t("brand.customCtaSub")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-[0.12em] uppercase whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
                {t("brand.customCtaBtn")}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
