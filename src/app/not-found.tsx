"use client";

import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";

export default function NotFound() {
  const t = useT();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <svg
          viewBox="0 0 320 200"
          className="w-full max-w-xs mx-auto mb-8"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <pattern id="nf-hex" x="0" y="0" width="14" height="24" patternUnits="userSpaceOnUse">
              <path d="M7 0 L14 4 L14 12 L7 16 L0 12 L0 4 Z" stroke="#1f1f1f" strokeWidth="0.6" fill="#0a0a0a" />
            </pattern>
            <linearGradient id="nf-edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#E8C068" />
              <stop offset="1" stopColor="#B8912E" />
            </linearGradient>
          </defs>
          <g transform="rotate(-8 160 100)">
            <path
              d="M40 30 Q50 20 70 18 L250 18 Q270 20 280 35 L290 175 Q288 188 270 188 L50 188 Q32 188 30 175 Z"
              fill="url(#nf-hex)"
              stroke="url(#nf-edge)"
              strokeWidth="3"
            />
          </g>
          <text
            x="160"
            y="120"
            textAnchor="middle"
            fontSize="72"
            fontWeight="800"
            fill="url(#nf-edge)"
            fontFamily="Georgia, serif"
            opacity="0.95"
          >
            404
          </text>
        </svg>

        <h1 className="text-2xl lg:text-3xl font-bold mb-3">{t("nf.title")}</h1>
        <p className="text-text-dim text-sm leading-relaxed mb-8">
          {t("nf.subtitle")}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold px-5 py-3 rounded-xl shadow-[0_4px_18px_rgba(212,165,74,0.25)]"
          >
            {t("nf.home")}
          </Link>
          <Link
            href="/catalog"
            className="glass-card text-text-dim hover:text-gold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            {t("nf.catalog")}
          </Link>
          <Link
            href="/contacts"
            className="text-text-faint hover:text-gold text-sm px-3 py-3 transition-colors"
          >
            {t("nf.contact")}
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border/30 text-sm">
          <Link
            href="/custom-order"
            className="inline-flex items-center gap-2 text-gold/85 hover:text-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            {t("custom.ctaFromSearch")}
          </Link>
        </div>
      </div>
    </div>
  );
}
