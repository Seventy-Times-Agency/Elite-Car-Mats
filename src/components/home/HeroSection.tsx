"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden -mt-16 lg:-mt-20 pt-16 lg:pt-20">
      {/* Ambient glow */}
      <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-gold/[0.04] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[88vh] flex items-center py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <p className="section-label mb-6">Premium EVA Car Mats</p>

            <h1 className="text-[clamp(2.8rem,7vw,5rem)] font-bold leading-[1.05] tracking-tight">
              Коврики,<br />достойные<br /><span className="text-gold-gradient">вашего авто</span>
            </h1>

            <p className="mt-8 text-text-dim text-lg max-w-lg leading-relaxed">
              Индивидуальный раскрой под вашу модель. Премиальный EVA материал. Доставка по всем США.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <a href="#configurator" className="group inline-flex items-center gap-3 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-bg px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-300 shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.35)]">
                Подобрать коврики
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <Link href="/about" className="inline-flex items-center px-8 py-4 border border-border hover:border-gold/40 text-text-dim hover:text-gold text-sm font-medium tracking-wide uppercase transition-all duration-300">
                О продукте
              </Link>
            </div>

            <div className="mt-20 flex gap-16">
              {[{ v: "200+", l: "Моделей" }, { v: "5 лет", l: "Служат" }, { v: "2 года", l: "Гарантия" }].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl font-bold text-gold">{s.v}</div>
                  <div className="text-text-faint text-xs uppercase tracking-[0.15em] mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
    </section>
  );
}
