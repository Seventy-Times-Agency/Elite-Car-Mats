"use client";

import { Reveal } from "@/components/common/Reveal";
import { useT } from "@/i18n/I18nProvider";

export function ComparisonSection() {
  const t = useT();
  const rows = [
    { feat: t("comparison.row1Feat"), ours: t("comparison.row1Ours"), others: t("comparison.row1Others") },
    { feat: t("comparison.row2Feat"), ours: t("comparison.row2Ours"), others: t("comparison.row2Others") },
    { feat: t("comparison.row3Feat"), ours: t("comparison.row3Ours"), others: t("comparison.row3Others") },
    { feat: t("comparison.row4Feat"), ours: t("comparison.row4Ours"), others: t("comparison.row4Others") },
    { feat: t("comparison.row5Feat"), ours: t("comparison.row5Ours"), others: t("comparison.row5Others") },
    { feat: t("comparison.row6Feat"), ours: t("comparison.row6Ours"), others: t("comparison.row6Others") },
    { feat: t("comparison.row7Feat"), ours: t("comparison.row7Ours"), others: t("comparison.row7Others") },
    { feat: t("comparison.row8Feat"), ours: t("comparison.row8Ours"), others: t("comparison.row8Others") },
    { feat: t("comparison.row9Feat"), ours: t("comparison.row9Ours"), others: t("comparison.row9Others") },
  ];
  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <span className="section-label">{t("comparison.label")}</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">{t("comparison.title")}</h2>
          <p className="mt-3 text-text-dim text-base max-w-2xl mx-auto leading-relaxed">
            {t("comparison.subtitle")}
          </p>
        </Reveal>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] lg:grid-cols-[1.3fr_1fr_1fr] divide-x divide-border/30">
            <div className="p-5 lg:p-6 bg-bg/50">
              <span className="section-label text-[10px]">{t("comparison.featureCol")}</span>
            </div>
            <div className="p-5 lg:p-6 bg-gold/[0.08] border-b border-gold/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,165,74,0.6)]" />
                <span className="text-gold font-semibold text-sm uppercase tracking-[0.15em]">Elite Car Mats</span>
              </div>
            </div>
            <div className="p-5 lg:p-6 bg-bg/50">
              <span className="text-text-faint font-semibold text-sm uppercase tracking-[0.15em]">{t("comparison.othersCol")}</span>
            </div>
          </div>

          {rows.map((r, i) => (
            <div
              key={r.feat}
              className={`grid grid-cols-[1.1fr_1fr_1fr] lg:grid-cols-[1.3fr_1fr_1fr] divide-x divide-border/30 ${
                i !== rows.length - 1 ? "border-b border-border/20" : ""
              }`}
            >
              <div className="p-5 lg:p-6 text-text-dim text-sm font-medium">{r.feat}</div>
              <div className="p-5 lg:p-6 bg-gold/[0.03]">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-text text-sm leading-relaxed">{r.ours}</span>
                </div>
              </div>
              <div className="p-5 lg:p-6">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-text-faint shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="text-text-dim text-sm leading-relaxed">{r.others}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#configurator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light text-bg px-7 py-3.5 text-sm font-semibold tracking-[0.15em] uppercase rounded-xl shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.4)] transition-all"
          >
            {t("cta.orderElite")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
