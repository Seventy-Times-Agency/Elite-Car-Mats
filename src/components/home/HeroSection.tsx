"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative bg-dark eva-pattern overflow-hidden -mt-18 lg:-mt-22 pt-18 lg:pt-22">
      {/* Ambient gold glow */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[85vh] flex items-center py-20">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left content */}
            <div className="lg:col-span-7">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="section-label mb-6"
              >
                Premium EVA Car Mats
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight"
              >
                <span className="text-text-inverse">Коврики,</span>
                <br />
                <span className="text-text-inverse">достойные</span>
                <br />
                <span className="text-gold-gradient">вашего авто</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-7 text-text-inverse-muted text-lg max-w-md leading-relaxed"
              >
                Индивидуальный раскрой. Премиальный EVA. Доставка по всем США.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link
                  href="/catalog"
                  className="group inline-flex items-center gap-3 bg-gold hover:bg-gold-light text-dark px-8 py-4 text-sm font-medium tracking-wide uppercase transition-all duration-300"
                >
                  Подобрать коврики
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center px-8 py-4 border border-text-inverse-muted/20 text-text-inverse-muted hover:border-gold hover:text-gold text-sm font-medium tracking-wide uppercase transition-all duration-300"
                >
                  О продукте
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mt-16 flex gap-12"
              >
                {[
                  { value: "200+", label: "Моделей" },
                  { value: "5 лет", label: "Служат" },
                  { value: "2 года", label: "Гарантия" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-gold">{stat.value}</div>
                    <div className="text-text-inverse-muted/50 text-xs uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — decorative */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block lg:col-span-5"
            >
              <div className="relative aspect-square">
                {/* Honeycomb circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 border border-gold/10 rounded-full" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-60 h-60 border border-gold/15 rounded-full" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gold/5 border border-gold/20 rounded-full flex items-center justify-center">
                    <div>
                      <div className="text-4xl font-bold text-gold/30 text-center">EC</div>
                      <div className="text-[10px] text-text-inverse-muted/30 tracking-[0.3em] uppercase text-center">Mats</div>
                    </div>
                  </div>
                </div>
                {/* Floating dots */}
                <div className="absolute top-12 right-16 w-2 h-2 bg-gold/30 rounded-full" />
                <div className="absolute bottom-20 left-12 w-1.5 h-1.5 bg-gold/20 rounded-full" />
                <div className="absolute top-1/3 right-8 w-1 h-1 bg-gold/40 rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
}
