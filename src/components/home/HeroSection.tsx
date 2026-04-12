"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative bg-brand-black overflow-hidden">
      {/* Subtle honeycomb texture */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #C5A55A 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh] py-16 lg:py-0">
          {/* Left — text */}
          <div>
            <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-6">
              Премиум EVA коврики
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white">
              Идеальная
              <br />
              защита для
              <br />
              <span className="text-brand-gold">вашего авто</span>
            </h1>
            <p className="mt-6 text-white/50 text-lg max-w-md leading-relaxed">
              Индивидуальный раскрой под вашу модель. Водонепроницаемый материал. Доставка по всем США.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center px-8 py-3.5 bg-brand-gold hover:bg-brand-gold-light text-white text-sm font-medium tracking-wide uppercase transition-colors"
              >
                Подобрать коврики
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-3.5 border border-white/20 hover:border-brand-gold/50 text-white/70 hover:text-brand-gold text-sm font-medium tracking-wide uppercase transition-colors"
              >
                Подробнее
              </Link>
            </div>
          </div>

          {/* Right — visual placeholder */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Abstract mat shape */}
              <div className="absolute inset-8 bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 rounded-3xl border border-brand-gold/10" />
              <div className="absolute inset-16 bg-gradient-to-br from-brand-gold/10 to-transparent rounded-2xl border border-brand-gold/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-brand-gold/20">EC</div>
                  <div className="text-white/20 text-sm tracking-[0.4em] uppercase mt-2">Premium Mats</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
    </section>
  );
}
