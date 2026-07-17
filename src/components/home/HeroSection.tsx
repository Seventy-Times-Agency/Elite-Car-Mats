"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/i18n/I18nProvider";

export function HeroSection() {
  const t = useT();
  return (
    <section className="relative overflow-hidden -mt-16 lg:-mt-20 pt-16 lg:pt-20">
      {/* Ambient glow */}
      <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-gold/[0.04] rounded-full blur-[150px] pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/[0.02] rounded-full blur-[100px] pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[70vh] py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div className="max-w-2xl animate-hero-in-up">
            <p className="section-label mb-5">{t("hero.label")}</p>

            <h1 className="text-[clamp(2.6rem,6.5vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
              {t("hero.titleLine1")}<br />{t("hero.titleLine2")}<br /><span className="text-gold-gradient">{t("hero.titleLine3")}</span>
            </h1>

            <p className="mt-6 text-text-dim text-base lg:text-lg max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#configurator" className="group inline-flex items-center gap-3 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-bg px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-300 shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.35)] rounded-lg">
                {t("cta.buildMats")}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <Link href="/about" className="inline-flex items-center px-8 py-4 border border-border hover:border-gold/40 text-text-dim hover:text-gold text-sm font-medium tracking-wide uppercase transition-all duration-300 rounded-lg">
                {t("hero.learnMore")}
              </Link>
            </div>

            <div className="mt-12 flex gap-10 sm:gap-14 lg:gap-16">
              {[
                { v: t("hero.statModelsValue"), l: t("hero.statModels") },
                { v: t("hero.statLifespanValue"), l: t("hero.statLifespan") },
                { v: t("hero.statWarrantyValue"), l: t("hero.statWarranty") },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl font-bold text-gold tabular-nums">{s.v}</div>
                  <div className="text-text-faint text-xs uppercase tracking-[0.15em] mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual: real product shot in a gold-glow frame.
              File lives at public/hero-mat.jpg — keep the photo at
              roughly 5:4 / 4:3 landscape so the mat reads at hero size. */}
          <div className="block relative animate-hero-in-right">
            <div className="relative aspect-[5/4] max-w-xl mx-auto">
              {/* Gold glow behind */}
              <div className="absolute -inset-8 bg-gradient-to-br from-gold/15 via-gold/5 to-transparent rounded-[40px] blur-3xl pointer-events-none" />

              {/* Frame */}
              <div className="relative h-full rounded-[28px] p-[1.5px] bg-gradient-to-br from-gold/40 via-gold/10 to-gold/30 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <div className="h-full rounded-[26px] overflow-hidden relative bg-[#0a0a0a]">
                  <Image
                    src="/hero-mat.jpg"
                    alt={t("hero.imageAlt")}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />

                  {/* Top corner label */}
                  <div className="absolute top-5 left-5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden />
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold/90 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      EVA · 10mm
                    </span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-text-faint">{t("hero.cardEdge")}</div>
                      <div className="text-gold font-semibold text-sm mt-0.5">{t("hero.cardEdgeValue")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-text-faint">{t("hero.cardFit")}</div>
                      <div className="text-text font-semibold text-sm mt-0.5">{t("hero.cardFitValue")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
    </section>
  );
}
