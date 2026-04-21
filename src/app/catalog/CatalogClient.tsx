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

  const noResultsFn = t.raw("catalog.noResults") as
    | ((q: string) => string)
    | undefined;
  const modelsCountFn = t.raw("catalog.modelsCount") as
    | ((n: number) => string)
    | undefined;

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
            {noResultsFn ? noResultsFn(query) : query}
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
                {modelsCountFn ? modelsCountFn(b.modelsCount) : b.modelsCount}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
