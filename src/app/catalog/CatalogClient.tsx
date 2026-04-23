"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Brand } from "@/types";
import { useT } from "@/i18n/I18nProvider";

export function CatalogClient({ brands }: { brands: Brand[] }) {
  const [query, setQuery] = useState("");
  const t = useT();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, query]);

  return (
    <>
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint pointer-events-none"
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
            className="w-full glass-card rounded-xl pl-11 pr-12 py-3 text-sm text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-gold p-1"
              aria-label={t("catalog.clearAria")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-dim">
            {t("catalog.noResults", { query })}
          </p>
          <p className="text-text-faint text-xs mt-2">
            {t("catalog.noResultsContact")}{" "}
            <a
              href="mailto:info@elitecarmats.us"
              className="text-gold hover:text-gold-light"
            >
              info@elitecarmats.us
            </a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((b) => (
            <Link
              key={b.id}
              href={`/catalog/${b.slug}`}
              className="group glass-card glow-hover rounded-xl p-5 text-center"
            >
              {b.logo ? (
                <div className="w-16 h-12 mx-auto relative">
                  <Image
                    src={b.logo}
                    alt={`${b.name} logo`}
                    fill
                    className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-12 mx-auto flex items-center justify-center text-text-dim group-hover:text-gold text-xl font-bold transition-colors">
                  {b.name.charAt(0)}
                </div>
              )}
              <h3 className="mt-3 text-text text-sm font-medium group-hover:text-gold transition-colors duration-300">
                {b.name}
              </h3>
              <p className="text-text-faint text-xs mt-1">
                {t("catalog.modelsCount", { n: b.modelsCount })}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Custom-order CTA — always visible under the brand grid */}
      <div className="mt-10">
        <Link
          href="/custom-order"
          className="group relative block rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-[#1a1500] via-[#141110] to-[#0F0F0F] hover:border-gold/55 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_28px_rgba(212,165,74,0.18)]"
        >
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z' stroke='%23D4A54A' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          }} aria-hidden />
          <div className="relative px-5 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold/15 text-gold shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-text text-base lg:text-lg font-bold">
                {t("catalog.customCta")}
              </h3>
              <p className="mt-1 text-text-dim text-sm leading-relaxed">
                {t("catalog.customCtaSub")}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.12em] uppercase px-4 py-2.5 rounded-lg shadow-[0_2px_14px_rgba(212,165,74,0.3)] group-hover:shadow-[0_4px_22px_rgba(212,165,74,0.45)] transition-all whitespace-nowrap shrink-0">
              {t("catalog.customCtaBtn")}
            </span>
          </div>
        </Link>
      </div>
    </>
  );
}
