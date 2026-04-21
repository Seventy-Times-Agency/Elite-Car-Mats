"use client";

import { useT } from "@/i18n/I18nProvider";

export default function AboutPage() {
  const t = useT();
  const values = [
    { t: t("about.v1Title"), d: t("about.v1Desc") },
    { t: t("about.v2Title"), d: t("about.v2Desc") },
    { t: t("about.v3Title"), d: t("about.v3Desc") },
    { t: t("about.v4Title"), d: t("about.v4Desc") },
  ];
  const specs: [string, string][] = [
    [t("about.spec1K"), t("about.spec1V")],
    [t("about.spec2K"), t("about.spec2V")],
    [t("about.spec3K"), t("about.spec3V")],
    [t("about.spec4K"), t("about.spec4V")],
    [t("about.spec5K"), t("about.spec5V")],
    [t("about.spec6K"), t("about.spec6V")],
  ];
  const stats = [
    { n: t("about.stat1N"), l: t("about.stat1L") },
    { n: t("about.stat2N"), l: t("about.stat2L") },
    { n: t("about.stat3N"), l: t("about.stat3L") },
    { n: t("about.stat4N"), l: t("about.stat4L") },
  ];
  return (
    <div>
      <section className="py-24 lg:py-40 border-b border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] to-transparent pointer-events-none" aria-hidden />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="section-label">{t("about.label")}</span>
          <h1 className="mt-5 text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            {t("about.h1Line1")}<br />
            <span className="text-gold-gradient">{t("about.h1Line2")}</span>
          </h1>
          <p className="mt-8 text-text-dim text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <span className="section-label">{t("about.storyLabel")}</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight">{t("about.storyTitle")}</h2>
            </div>
            <div className="space-y-5 text-text-dim text-[15px] lg:text-base leading-relaxed">
              <p>{t("about.storyP1")}</p>
              <p>{t("about.storyP2")}</p>
              <p>{t("about.storyP3")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">{t("about.principlesLabel")}</span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-bold">{t("about.principlesTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <div key={v.t} className="glass-card rounded-2xl p-7 relative overflow-hidden group hover:border-gold/30 transition-colors">
                <div className="text-[10px] text-gold/40 font-semibold tracking-[0.25em] mb-4">0{i + 1}</div>
                <h3 className="text-gold font-semibold text-lg mb-3">{v.t}</h3>
                <p className="text-text-dim text-sm leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="section-label">{t("about.materialLabel")}</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight">{t("about.materialTitle")}</h2>
              <p className="mt-6 text-text-dim text-[15px] leading-relaxed">{t("about.materialP1")}</p>
              <p className="mt-4 text-text-dim text-[15px] leading-relaxed">{t("about.materialP2")}</p>
            </div>
            <div className="glass-card rounded-2xl p-8 lg:p-10 border-gold/20">
              <div className="text-[10px] text-gold font-semibold tracking-[0.25em] mb-6">{t("about.specsLabel")}</div>
              <dl className="space-y-4 text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <dt className="text-text-dim">{k}</dt>
                    <dd className="text-text font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s) => (
              <div key={s.l} className="text-center py-8 glass-card rounded-2xl">
                <div className="text-3xl lg:text-5xl font-bold text-gold-gradient">{s.n}</div>
                <div className="mt-2 text-text-dim text-[11px] lg:text-xs uppercase tracking-[0.18em]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
            {t("about.ctaTitleA")} <span className="text-gold-gradient">{t("about.ctaTitleB")}</span>
          </h2>
          <p className="mt-5 text-text-dim text-base max-w-xl mx-auto">
            {t("about.ctaSubtitle")}
          </p>
          <a
            href="/catalog"
            className="mt-8 inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-[0.15em] uppercase shadow-[0_4px_24px_rgba(212,165,74,0.3)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.45)] transition-all"
          >
            {t("about.ctaBtn")}
          </a>
        </div>
      </section>
    </div>
  );
}
