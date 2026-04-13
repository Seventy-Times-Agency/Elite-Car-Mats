"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden -mt-16 lg:-mt-20 pt-16 lg:pt-20">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gold/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[85vh] flex items-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="section-label mb-6">Premium EVA Car Mats</p>

            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
              <span className="text-text-primary">Коврики,</span><br />
              <span className="text-text-primary">достойные</span><br />
              <span className="text-gold-gradient">вашего авто</span>
            </h1>

            <p className="mt-7 text-text-secondary text-lg max-w-md leading-relaxed">
              Индивидуальный раскрой. Премиальный EVA. Доставка по всем США.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#configurator" className="group inline-flex items-center gap-3 bg-gold hover:bg-gold-light text-dark px-8 py-4 text-sm font-medium tracking-wide uppercase transition-all duration-300">
                Подобрать коврики
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <Link href="/about" className="inline-flex items-center px-8 py-4 border border-dark-border text-text-secondary hover:border-gold hover:text-gold text-sm font-medium tracking-wide uppercase transition-all duration-300">
                О продукте
              </Link>
            </div>

            <div className="mt-16 flex gap-12">
              {[
                { value: "200+", label: "Моделей" },
                { value: "5 лет", label: "Служат" },
                { value: "2 года", label: "Гарантия" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-gold">{s.value}</div>
                  <div className="text-text-muted text-xs uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
