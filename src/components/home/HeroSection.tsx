"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function MatIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main mat shape - trapezoid with honeycomb */}
      <svg viewBox="0 0 500 400" className="w-full drop-shadow-[0_20px_60px_rgba(201,168,76,0.15)]">
        {/* Mat body */}
        <defs>
          <pattern id="honeycomb" width="20" height="17.32" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
            <polygon points="10,0 20,5.77 20,17.32 10,11.55 0,17.32 0,5.77" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5"/>
          </pattern>
          <linearGradient id="matGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a"/>
            <stop offset="100%" stopColor="#111111"/>
          </linearGradient>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9A84C"/>
            <stop offset="50%" stopColor="#DBBD6A"/>
            <stop offset="100%" stopColor="#C9A84C"/>
          </linearGradient>
        </defs>

        {/* Shadow */}
        <path d="M80,350 Q250,380 420,350 L450,180 Q250,160 50,180 Z" fill="rgba(0,0,0,0.2)" filter="blur(20px)"/>

        {/* Mat shape - perspective view */}
        <path d="M60,320 L440,320 L470,140 Q250,120 30,140 Z" fill="url(#matGrad)" stroke="url(#edgeGrad)" strokeWidth="3" rx="8"/>

        {/* Honeycomb pattern overlay */}
        <path d="M60,320 L440,320 L470,140 Q250,120 30,140 Z" fill="url(#honeycomb)"/>

        {/* Raised edges - 3D effect */}
        <path d="M60,320 L30,140 L50,135 L75,315 Z" fill="rgba(201,168,76,0.15)"/>
        <path d="M440,320 L470,140 L450,135 L425,315 Z" fill="rgba(201,168,76,0.1)"/>

        {/* Logo badge */}
        <rect x="200" y="260" width="100" height="30" rx="2" fill="rgba(201,168,76,0.2)" stroke="rgba(201,168,76,0.4)" strokeWidth="0.5"/>
        <text x="250" y="280" textAnchor="middle" fill="rgba(201,168,76,0.7)" fontSize="8" fontWeight="bold" letterSpacing="2">ELITE MATS</text>

        {/* Heel pad area */}
        <ellipse cx="250" cy="200" rx="50" ry="35" fill="rgba(201,168,76,0.05)" stroke="rgba(201,168,76,0.15)" strokeWidth="0.5"/>
      </svg>

      {/* Floating accent dots */}
      <div className="absolute top-8 right-4 w-2 h-2 bg-gold/40 rounded-full animate-pulse" />
      <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-gold/30 rounded-full animate-pulse [animation-delay:1s]" />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative bg-dark eva-pattern overflow-hidden -mt-18 lg:-mt-22 pt-18 lg:pt-22">
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[85vh] flex items-center py-20">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="section-label mb-6">Premium EVA Car Mats</p>

              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
                <span className="text-text-inverse">Коврики,</span><br />
                <span className="text-text-inverse">достойные</span><br />
                <span className="text-gold-gradient">вашего авто</span>
              </h1>

              <p className="mt-7 text-text-inverse-muted text-lg max-w-md leading-relaxed">
                Индивидуальный раскрой. Премиальный EVA. Доставка по всем США.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#configurator"
                  className="group inline-flex items-center gap-3 bg-gold hover:bg-gold-light text-dark px-8 py-4 text-sm font-medium tracking-wide uppercase transition-all duration-300"
                >
                  Подобрать коврики
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center px-8 py-4 border border-text-inverse-muted/20 text-text-inverse-muted hover:border-gold hover:text-gold text-sm font-medium tracking-wide uppercase transition-all duration-300"
                >
                  О продукте
                </Link>
              </div>

              <div className="mt-16 flex gap-12">
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
              </div>
            </motion.div>

            {/* Right — mat illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <MatIllustration />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
}
