"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/common/Reveal";
import { useT } from "@/i18n/I18nProvider";

/**
 * Before/after reveal slider. Two same-framed photos of the same footwell
 * (worn factory mat → clean EliteCarMats set) stacked; a draggable handle
 * wipes between them via clip-path so neither image is squished. Works with
 * mouse, touch and pen through Pointer Events, and is keyboard-accessible
 * (arrow keys move the divider).
 */
function Slider() {
  const t = useT();
  const [pos, setPos] = useState(50); // % revealed of the "before" image
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-border/40 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] select-none touch-none cursor-ew-resize"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) setFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      role="slider"
      aria-label={t("beforeAfter.hint")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
        if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
      }}
    >
      {/* AFTER — base layer (full) */}
      <Image
        src="/before-after/after.jpg"
        alt={t("beforeAfter.after")}
        fill
        sizes="(max-width: 640px) 92vw, 440px"
        className="object-cover pointer-events-none"
        priority={false}
      />
      {/* BEFORE — clipped to the left of the handle */}
      <Image
        src="/before-after/before.jpg"
        alt={t("beforeAfter.before")}
        fill
        sizes="(max-width: 640px) 92vw, 440px"
        className="object-cover pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      {/* Corner labels */}
      <span className="absolute top-3 left-3 rounded-full bg-black/65 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/90 pointer-events-none">
        {t("beforeAfter.before")}
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-gold/85 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-bg pointer-events-none">
        {t("beforeAfter.after")}
      </span>

      {/* Divider + handle */}
      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="h-full w-0.5 bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-bg shadow-[0_2px_12px_rgba(0,0,0,0.5)] flex items-center justify-center">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function BeforeAfterSection() {
  const t = useT();
  return (
    <section className="py-14 lg:py-20 relative">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <span className="section-label">{t("beforeAfter.label")}</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">
            {t("beforeAfter.title")}
          </h2>
          <p className="mt-3 text-text-dim text-base max-w-2xl mx-auto leading-relaxed">
            {t("beforeAfter.subtitle")}
          </p>
        </Reveal>

        <Reveal className="flex flex-col items-center">
          <div className="w-full max-w-[420px]">
            <Slider />
            <p className="mt-3 text-center text-text-faint text-xs uppercase tracking-[0.15em]">
              {t("beforeAfter.hint")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
