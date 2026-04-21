"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useT } from "@/i18n/I18nProvider";

export function HeroSection() {
  const t = useT();
  return (
    <section className="relative overflow-hidden -mt-16 lg:-mt-20 pt-16 lg:pt-20">
      {/* Ambient glow */}
      <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-gold/[0.04] rounded-full blur-[150px] pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/[0.02] rounded-full blur-[100px] pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[70vh] py-14 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
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
                  <div className="text-3xl font-bold text-gold">{s.v}</div>
                  <div className="text-text-faint text-xs uppercase tracking-[0.15em] mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right visual: glass card with mat silhouette + honeycomb pattern */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="hidden lg:block relative"
            aria-hidden
          >
            <div className="relative aspect-[4/5] max-w-md mx-auto">
              {/* Gold glow behind */}
              <div className="absolute -inset-8 bg-gradient-to-br from-gold/15 via-gold/5 to-transparent rounded-[40px] blur-3xl" />

              {/* Frame */}
              <div className="relative h-full rounded-[28px] p-[1.5px] bg-gradient-to-br from-gold/40 via-gold/10 to-gold/30 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <div className="h-full rounded-[26px] bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0F0F0F] overflow-hidden relative">
                  {/* Honeycomb backdrop */}
                  <div
                    className="absolute inset-0 opacity-[0.18]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z M30 34.64 L60 51.96 M30 34.64 L0 51.96 M30 34.64 L30 0' stroke='%23D4A54A' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Mat silhouette */}
                  <svg viewBox="0 0 220 280" className="absolute inset-0 m-auto w-[78%] h-[78%]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="hero-hex" x="0" y="0" width="10" height="17" patternUnits="userSpaceOnUse">
                        <path d="M5 0 L10 2.9 L10 8.7 L5 11.6 L0 8.7 L0 2.9 Z" stroke="#1f1f1f" strokeWidth="0.6" fill="#0a0a0a" />
                      </pattern>
                      <linearGradient id="hero-edge" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#E8C068" />
                        <stop offset="0.5" stopColor="#D4A54A" />
                        <stop offset="1" stopColor="#B8912E" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M30 25 Q35 15 55 14 L165 14 Q185 14 190 26 L205 250 Q205 262 192 262 L28 262 Q15 262 15 250 Z"
                      fill="url(#hero-hex)"
                      stroke="url(#hero-edge)"
                      strokeWidth="3.5"
                    />
                    {/* Brand badge */}
                    <g transform="translate(60, 50)">
                      <rect x="0" y="0" width="42" height="22" rx="3" fill="#0a0a0a" stroke="#D4A54A" strokeWidth="0.8" />
                      <text x="21" y="15" textAnchor="middle" fill="#D4A54A" fontSize="9" fontFamily="Georgia, serif" fontWeight="700" letterSpacing="0.5">
                        E
                      </text>
                    </g>
                  </svg>

                  {/* Top corner label */}
                  <div className="absolute top-5 left-5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold/80 font-semibold">EVA · 10mm</span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-text-faint">Edge</div>
                      <div className="text-gold font-semibold text-sm mt-0.5">Gold Premium</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-text-faint">Fit</div>
                      <div className="text-text font-semibold text-sm mt-0.5">±1 mm CNC</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
    </section>
  );
}
