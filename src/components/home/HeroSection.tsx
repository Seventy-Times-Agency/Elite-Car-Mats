"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/i18n/I18nProvider";
import { useShippingVars } from "@/context/PriceOverridesContext";

/*
 * Desktop art direction is drawn in the photo's own 1440×810 coordinate
 * space (the 16:9 frame below never distorts), so the gold seam, the
 * honeycomb panel and the callout markers stay pinned to the mat at any
 * viewport width. Mobile shows the plain photo with a bottom-up fade.
 */
const VB_W = 1440;
const VB_H = 810;
// Seam: straight line from (SEAM_TOP, 60) to (SEAM_BOT, 800).
const SEAM_TOP = 700;
const SEAM_BOT = 610;
const seamX = (y: number) => SEAM_TOP + ((y - 60) * (SEAM_BOT - SEAM_TOP)) / 740;
const X0 = seamX(0);
const X1 = seamX(VB_H);

const HEX_R = 26;
const HEX_W = HEX_R * Math.sqrt(3);
const hex = (cx: number, cy: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = ((60 * k + 30) * Math.PI) / 180;
    return `${k ? "L" : "M"}${(cx + HEX_R * Math.cos(a)).toFixed(2)} ${(cy + HEX_R * Math.sin(a)).toFixed(2)}`;
  }).join(" ") + "Z";
const HEX_PATH = [
  hex(HEX_W / 2, HEX_R),
  hex(0, 2.5 * HEX_R),
  hex(HEX_W, 2.5 * HEX_R),
  hex(0, -0.5 * HEX_R),
  hex(HEX_W, -0.5 * HEX_R),
].join(" ");

type Callout = {
  key: string;
  point: [number, number];
  box: [number, number, number, number]; // x, y, w, h in VB units
};
const CALLOUTS: Callout[] = [
  { key: "fit", point: [812, 398], box: [1030, 150, 300, 66] },
  { key: "material", point: [965, 430], box: [1115, 300, 250, 66] },
  { key: "edge", point: [1010, 632], box: [1150, 520, 250, 66] },
];
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function HeroSection() {
  const t = useT();
  const ship = useShippingVars();
  return (
    <section className="relative overflow-hidden -mt-16 lg:-mt-20 pt-16 lg:pt-20 min-h-[88vh] lg:min-h-0 lg:h-[max(92vh,720px)] flex items-center">
      {/* Mobile / tablet: plain photo, readable copy via a bottom-up fade. */}
      <div className="absolute inset-x-0 top-0 h-[58vh] lg:hidden" aria-hidden>
        <Image
          src="/hero/hero-interior.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 via-45% to-bg/40" />
      </div>

      {/* Desktop: exact 16:9 frame anchored right, at least as tall as the
          section and at least as wide as the viewport. */}
      <div
        className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 aspect-[16/9]"
        style={{ width: "max(100%, calc(max(92vh, 720px) * 16 / 9))" }}
      >
        <Image
          src="/hero/hero-interior.jpg"
          alt={t("hero.imageAlt")}
          fill
          priority
          sizes="(min-width: 1024px) 100vw, 1px"
          className="object-cover"
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <clipPath id="hero-panel">
              <polygon points={`0,0 ${X0},0 ${X1},${VB_H} 0,${VB_H}`} />
            </clipPath>
            <clipPath id="hero-photo">
              <polygon points={`${X0},0 ${VB_W},0 ${VB_W},${VB_H} ${X1},${VB_H}`} />
            </clipPath>
            {/* soft darkening of the photo along the seam, perpendicular to it */}
            <linearGradient id="hero-seam-shade" gradientUnits="userSpaceOnUse" x1={seamX(430)} y1="430" x2={seamX(430) + 109} y2="443">
              <stop offset="0" stopColor="#0F0F0F" stopOpacity="0.75" />
              <stop offset="1" stopColor="#0F0F0F" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="hero-glow" cx="245" cy="365" r="380" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#D4A54A" stopOpacity="0.14" />
              <stop offset="1" stopColor="#D4A54A" stopOpacity="0" />
            </radialGradient>
            <pattern id="hero-hex" width={HEX_W} height={3 * HEX_R} patternUnits="userSpaceOnUse">
              <path d={HEX_PATH} fill="none" stroke="#D4A54A" strokeWidth="1" />
            </pattern>
            <linearGradient id="hero-hex-fade-x" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={X1 - 40} y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hero-hex-fade-y" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.45" />
            </linearGradient>
            <mask id="hero-hex-mask-x"><rect width={VB_W} height={VB_H} fill="url(#hero-hex-fade-x)" /></mask>
            <mask id="hero-hex-mask-y"><rect width={VB_W} height={VB_H} fill="url(#hero-hex-fade-y)" /></mask>
            {/* seam fades in and out identically at both ends */}
            <linearGradient id="hero-seam" gradientUnits="userSpaceOnUse" x1={seamX(60)} y1="60" x2={seamX(800)} y2="800">
              <stop offset="0" stopColor="#D4A54A" stopOpacity="0" />
              <stop offset="0.22" stopColor="#E7C27A" stopOpacity="1" />
              <stop offset="0.78" stopColor="#E7C27A" stopOpacity="1" />
              <stop offset="1" stopColor="#D4A54A" stopOpacity="0" />
            </linearGradient>
            <filter id="hero-seam-blur" x="-50%" y="-10%" width="200%" height="120%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <rect width={VB_W} height={VB_H} fill="url(#hero-seam-shade)" clipPath="url(#hero-photo)" />
          <g clipPath="url(#hero-panel)">
            <rect width={VB_W} height={VB_H} fill="#0F0F0F" />
            <rect width={VB_W} height={VB_H} fill="url(#hero-glow)" />
            <g mask="url(#hero-hex-mask-y)" opacity="0.09">
              <rect width={VB_W} height={VB_H} fill="url(#hero-hex)" mask="url(#hero-hex-mask-x)" />
            </g>
          </g>
          <line x1={seamX(60)} y1="60" x2={seamX(800)} y2="800" stroke="url(#hero-seam)" strokeWidth="12" opacity="0.28" filter="url(#hero-seam-blur)" />
          <line x1={seamX(60)} y1="60" x2={seamX(800)} y2="800" stroke="url(#hero-seam)" strokeWidth="1.6" />

          {CALLOUTS.map(({ key, point: [px, py], box: [bx, by, bw, bh] }) => {
            const ax = px < bx ? bx : bx + bw;
            return (
              <g key={key}>
                <line x1={ax} y1={by + bh / 2} x2={px} y2={py} stroke="#D4A54A" strokeOpacity="0.8" strokeWidth="1" />
                <circle cx={px} cy={py} r="17" fill="none" stroke="#D4A54A" strokeOpacity="0.25" strokeWidth="1.5" />
                <circle cx={px} cy={py} r="11" fill="none" stroke="#D4A54A" strokeOpacity="0.45" strokeWidth="1.5" />
                <circle cx={px} cy={py} r="5" fill="#F0CD82" />
              </g>
            );
          })}
        </svg>

        {CALLOUTS.map(({ key, box: [bx, by, bw, bh] }) => (
          <div
            key={key}
            className="absolute flex items-center gap-3 px-4 rounded-2xl border border-gold/50 bg-[#0c0c0c]/60 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
            style={{ left: pct(bx, VB_W), top: pct(by, VB_H), width: pct(bw, VB_W), height: pct(bh, VB_H) }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 text-gold" aria-hidden>
              <path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <div className="min-w-0 leading-tight">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{t(`hero.callout.${key}.label`)}</div>
              <div className="text-[15px] font-semibold text-text truncate">{t(`hero.callout.${key}.value`)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" aria-hidden />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-[34vh] pb-14 lg:py-0 max-w-2xl lg:max-w-[520px] animate-hero-in-up">
          <p className="section-label mb-5">{t("hero.label")}</p>

          <h1 className="text-[clamp(2.6rem,6.5vw,4.5rem)] lg:text-[clamp(3rem,4.2vw,3.75rem)] font-bold leading-[1.05] tracking-tight">
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
