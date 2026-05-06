"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useT } from "@/i18n/I18nProvider";
import { localizeBody } from "@/i18n/labels";

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const t = useT();

  if (items.length === 0) {
    return (
      <div className="py-20 lg:py-28 text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/30 text-gold/70 mb-5">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.687-4.5-1.935 0-3.597 1.126-4.313 2.733-.715-1.607-2.378-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold">{t("wish.emptyTitle")}</h1>
        <p className="mt-2 text-text-dim text-sm">{t("wish.emptyBody")}</p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex items-center gap-1.5 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-5 py-2.5 rounded-lg shadow-[0_2px_14px_rgba(212,165,74,0.3)] hover:shadow-[0_4px_22px_rgba(212,165,74,0.45)] transition-all"
        >
          {t("wish.browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-8">
          <div>
            <span className="section-label">{t("wish.label")}</span>
            <h1 className="mt-2 text-2xl lg:text-3xl font-bold">
              {t("wish.title")}
            </h1>
            <p className="mt-1 text-text-dim text-sm">
              {t("wish.count", { n: items.length })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => clear()}
            className="text-[11px] uppercase tracking-wider text-text-faint hover:text-error transition-colors"
          >
            {t("wish.clear")}
          </button>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((it) => (
            <li
              key={it.modelId}
              className="group relative glass-card glow-hover rounded-xl overflow-hidden"
            >
              <Link
                href={`/catalog/${it.brandSlug}/${it.modelSlug}`}
                className="block p-4 pr-12"
              >
                <div className="text-[10px] uppercase tracking-[0.18em] text-gold/60 font-semibold">
                  {it.brandName}
                </div>
                <div className="mt-1 text-text font-bold text-sm leading-tight group-hover:text-gold transition-colors">
                  {it.modelName}
                </div>
                {it.bodyType && (
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-text-dim">
                    {localizeBody(t, it.bodyType)}
                  </div>
                )}
              </Link>
              <button
                type="button"
                onClick={() => remove(it.modelId)}
                aria-label={t("wish.removeAria")}
                className="absolute top-2.5 right-2.5 w-8 h-8 inline-flex items-center justify-center rounded-full text-text-faint hover:text-error hover:bg-error/10 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
