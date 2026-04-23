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

/** Shared gold gradient defs — rendered once per page so every icon picks up
 *  the same polished-gold fill. */
function IconDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden
      className="absolute"
      style={{ position: "absolute" }}
    >
      <defs>
        <linearGradient id="ic-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5D680" />
          <stop offset="0.55" stopColor="#D4A54A" />
          <stop offset="1" stopColor="#9A7820" />
        </linearGradient>
        <linearGradient id="ic-gold-dim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C8A04A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7A5E18" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const CATEGORY_ICONS: Record<VehicleCategory, React.ReactNode> = {
  // Low sleek sedan silhouette
  car: (
    <svg viewBox="0 0 44 15" className="w-full h-full" aria-hidden>
      <path
        d="M2 11.5 L4.5 7.5 Q7 5 11.5 4.3 L18 3.2 Q22 3 26 3.2 L32.5 4.3 Q37 5.2 39 8 L42 11.5 L42 12.5 L2 12.5 Z"
        fill="url(#ic-gold)"
      />
      <path
        d="M8.5 8 Q10 5.8 14 5.3 L18.5 4.6 Q22 4.5 25.5 4.6 L30 5.3 Q34 5.8 35.5 8 L35.5 9 L8.5 9 Z"
        fill="#0C0C0C"
        opacity="0.6"
      />
      <circle cx="10" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="10" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.5" />
      <circle cx="34" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="34" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.5" />
    </svg>
  ),
  // Upright SUV — taller cabin, more glass, squarer rear
  suv: (
    <svg viewBox="0 0 44 15" className="w-full h-full" aria-hidden>
      <path
        d="M2 11.5 L3 5 Q4 3 7 2.6 L14 2.1 Q22 1.9 30 2.1 L37 2.6 Q40 3 41 5 L42 11.5 L42 12.5 L2 12.5 Z"
        fill="url(#ic-gold)"
      />
      <path
        d="M6 5.5 Q7 3.5 10 3.2 L15 2.9 Q22 2.75 29 2.9 L34 3.2 Q37 3.5 38 5.5 L38 8.2 L6 8.2 Z"
        fill="#0C0C0C"
        opacity="0.55"
      />
      <circle cx="10" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="10" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.5" />
      <circle cx="34" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="34" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.5" />
    </svg>
  ),
  // Pickup — short cab + lower OPEN bed clearly separate from the cab
  truck: (
    <svg viewBox="0 0 46 15" className="w-full h-full" aria-hidden>
      {/* Lower bed box (visually shorter than cab roof) */}
      <path
        d="M21 7 L42 7 L43 8.2 L43 12.5 L21 12.5 Z"
        fill="url(#ic-gold-dim)"
      />
      {/* Cab — raised, with slanted windshield */}
      <path
        d="M3 12.5 L3.8 6 Q4.5 4 7 3.4 L14 2.7 Q17.5 2.5 19.5 3.4 L21 5 L21 12.5 Z"
        fill="url(#ic-gold)"
      />
      {/* Cab windshield cutout */}
      <path
        d="M6 5.8 Q7 3.8 10 3.5 L14 3.2 L17 3.6 L19 4.8 L19 6.6 L6 6.6 Z"
        fill="#0C0C0C"
        opacity="0.6"
      />
      {/* Bed rim line — hints "open bed" */}
      <path d="M21 7 L42.5 7" stroke="#0C0C0C" strokeWidth="0.55" opacity="0.5" />
      {/* Tailgate hairline */}
      <path d="M42 7.2 L42 12" stroke="#0C0C0C" strokeWidth="0.35" opacity="0.4" />
      {/* Bed/cab split line */}
      <path d="M21 5 L21 12.5" stroke="#0C0C0C" strokeWidth="0.4" opacity="0.45" />
      <circle cx="10" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="10" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.5" />
      <circle cx="35" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="35" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.5" />
    </svg>
  ),
  // Semi-truck — tall flat-front tractor + long trailer + extra axles
  commercial: (
    <svg viewBox="0 0 58 15" className="w-full h-full" aria-hidden>
      {/* Trailer */}
      <rect x="17" y="2.2" width="40" height="10.3" rx="0.6" fill="url(#ic-gold-dim)" />
      {/* Trailer panel lines */}
      <line x1="27" y1="3" x2="27" y2="11.8" stroke="#0C0C0C" strokeWidth="0.3" opacity="0.5" />
      <line x1="37" y1="3" x2="37" y2="11.8" stroke="#0C0C0C" strokeWidth="0.3" opacity="0.5" />
      <line x1="47" y1="3" x2="47" y2="11.8" stroke="#0C0C0C" strokeWidth="0.3" opacity="0.5" />
      {/* Tractor — tall flat-front cab */}
      <path
        d="M2 12.5 L2.6 4.2 Q3 2.5 5 2.3 L13 2.3 L15.5 3.6 L15.5 12.5 Z"
        fill="url(#ic-gold)"
      />
      {/* Cab windshield */}
      <path
        d="M3.4 4.2 Q3.8 2.8 5.6 2.7 L12.5 2.7 L14.5 3.7 L14.5 5.4 L3.4 5.4 Z"
        fill="#0C0C0C"
        opacity="0.55"
      />
      {/* Tractor→trailer gap */}
      <rect x="15.5" y="8" width="1.5" height="4" fill="#0C0C0C" opacity="0.8" />
      {/* Axles: tractor (1) + trailer (3) */}
      <circle cx="8" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="8" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.45" />
      <circle cx="33" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="33" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.45" />
      <circle cx="42" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="42" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.45" />
      <circle cx="51" cy="13" r="2.2" fill="#0B0B0B" />
      <circle cx="51" cy="13" r="1.2" fill="#1A1A1A" stroke="url(#ic-gold)" strokeWidth="0.45" />
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
      <IconDefs />
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
          {visibleModels.map((m) => {
            const yFirst = m.years[0];
            const yLast = m.years[m.years.length - 1];
            return (
              <Link
                key={m.id}
                href={`/catalog/${brand.slug}/${m.slug}`}
                className="group relative rounded-[10px] overflow-hidden bg-[linear-gradient(180deg,#1C1C1C_0%,#121212_100%)] border border-border/60 hover:border-gold/55 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_22px_rgba(0,0,0,0.55),0_0_18px_rgba(212,165,74,0.12)]"
              >
                {/* Top accent strip */}
                <div className="h-[1.5px] bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="px-2.5 py-2">
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div
                      className={`${m.category === "commercial" ? "w-8 h-2.5" : "w-6 h-2.5"} transition-transform duration-300 group-hover:scale-[1.08] drop-shadow-[0_0_5px_rgba(212,165,74,0.3)]`}
                    >
                      {CATEGORY_ICONS[m.category]}
                    </div>
                    <span className="px-1.5 py-[1px] text-[8.5px] font-mono font-semibold text-gold/85 bg-gold/10 border border-gold/15 rounded-full tabular-nums whitespace-nowrap leading-none">
                      {yFirst === yLast ? yFirst : `${yFirst}–${yLast}`}
                    </span>
                  </div>

                  <h3 className="text-[12.5px] font-semibold leading-snug text-text group-hover:text-gold transition-colors duration-300 line-clamp-2 min-h-[2.2rem]">
                    {m.name}
                  </h3>

                  <div className="mt-2 pt-1.5 border-t border-border/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-[3px] h-[3px] rounded-full bg-gold/70 group-hover:bg-gold shrink-0" />
                      <span className="text-[8.5px] uppercase tracking-[0.12em] font-medium text-text-faint group-hover:text-text-dim transition-colors truncate">
                        {localizeBody(t, m.bodyType)}
                      </span>
                    </div>
                    <svg
                      className="w-2.5 h-2.5 text-gold/40 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0"
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
