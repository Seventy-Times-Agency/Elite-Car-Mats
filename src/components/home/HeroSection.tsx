"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/i18n/I18nProvider";
import { useShippingVars } from "@/context/PriceOverridesContext";

export function HeroSection() {
  const t = useT();
  const ship = useShippingVars();
  return (
    <section className="relative overflow-hidden -mt-16 lg:-mt-20 pt-16 lg:pt-20 min-h-[88vh] lg:min-h-[92vh] flex items-center">
      {/* Full-bleed photo. The subject sits on the right; the left side is
          kept dark by the overlays below so the copy stays readable. */}
      <Image
        src="/hero/hero-interior.jpg"
        alt={t("hero.imageAlt")}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center] lg:object-right"
      />
      {/* Readability: horizontal fade on desktop, bottom-up fade on mobile. */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/30 lg:hidden" aria-hidden />
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-bg via-bg/85 via-35% to-transparent to-70%" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" aria-hidden />
      <div className="absolute top-0 left-0 w-[700px] h-[500px] bg-gold/[0.05] rounded-full blur-[140px] pointer-events-none" aria-hidden />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-14 lg:py-20 max-w-2xl animate-hero-in-up">
          <p className="section-label mb-5">{t("hero.label")}</p>

          <h1 className="text-[clamp(2.6rem,6.5vw,4.5rem)] font-bold leading-[1.05] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]">
            {t("hero.titleLine1")}<br />{t("hero.titleLine2")}<br /><span className="text-gold-gradient">{t("hero.titleLine3")}</span>
          </h1>

          <p className="mt-6 text-text-dim text-base lg:text-lg max-w-lg leading-relaxed">
            {t("hero.subtitle", ship)}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#configurator" className="group inline-flex items-center gap-3 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-bg px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-300 shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.35)] rounded-lg">
              {t("cta.buildMats")}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <Link href="/about" className="inline-flex items-center px-8 py-4 border border-border hover:border-gold/40 bg-bg/40 backdrop-blur-sm text-text-dim hover:text-gold text-sm font-medium tracking-wide uppercase transition-all duration-300 rounded-lg">
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
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
    </section>
  );
}
