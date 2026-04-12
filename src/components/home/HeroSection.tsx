"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-black via-brand-dark to-brand-black" />

      {/* Decorative honeycomb pattern (like EVA texture) */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #D4A843 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
            <span className="text-brand-gold text-sm font-medium">
              Премиальные EVA коврики
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
            <span className="text-brand-white">Коврики для авто</span>
            <br />
            <span className="text-gradient-gold">элитного класса</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-brand-text-muted max-w-xl leading-relaxed">
            Индивидуальный раскрой под вашу модель. EVA материал премиум-класса.
            Идеальная посадка. Доставка по всем США.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-gold hover:bg-brand-gold-light text-brand-black font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-brand-gold/20 text-base"
            >
              Подобрать коврики
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 border border-brand-gray-light hover:border-brand-gold/50 text-brand-text hover:text-brand-gold rounded-lg transition-all duration-200 text-base"
            >
              О продукте
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md">
            {[
              { value: "200+", label: "Моделей авто" },
              { value: "EVA", label: "Премиум материал" },
              { value: "2 года", label: "Гарантия" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-brand-gold">
                  {stat.value}
                </div>
                <div className="text-sm text-brand-text-muted mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
