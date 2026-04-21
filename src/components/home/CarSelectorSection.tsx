"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { brands, mockModels } from "@/data/mock";
import { useT } from "@/i18n/I18nProvider";

function CustomSelect({ label, step, value, display, placeholder, options, onChange, disabled }: {
  label: string; step: number; value: string; display: string; placeholder: string;
  options: { id: string; label: string }[]; onChange: (id: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const active = !!value;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full text-left glass-card glow-hover rounded-xl p-6 transition-all duration-300 ${
          disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
        } ${open ? "!border-gold/50 shadow-[0_0_32px_rgba(212,165,74,0.15)]" : ""}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
            active ? "bg-gradient-to-br from-gold to-gold-dark text-bg shadow-[0_0_12px_rgba(212,165,74,0.35)]" : "bg-border text-text-faint"
          }`}>{step}</span>
          <span className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">{label}</span>
        </div>
        <div className="flex items-center justify-between pl-10">
          <span className={`text-[17px] font-medium truncate ${value ? "text-text" : "text-text-faint"}`}>
            {value ? display : placeholder}
          </span>
          <svg className={`w-4 h-4 text-gold/50 shrink-0 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && options.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 glass-card rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] max-h-56 overflow-y-auto border border-border">
          {options.map((opt) => (
            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-5 py-3 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                value === opt.id ? "text-gold bg-gold/8 font-medium" : "text-text-dim hover:text-text hover:bg-surface-hover"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CarSelectorSection() {
  const router = useRouter();
  const t = useT();
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [yearId, setYearId] = useState("");

  const brand = brands.find((b) => b.id === brandId);
  const model = mockModels.find((m) => m.id === modelId);
  const models = useMemo(() => mockModels.filter((m) => m.brandId === brandId), [brandId]);
  const years = useMemo(() => model ? [...model.years].sort((a, b) => b - a) : [], [model]);

  const onBrand = (id: string) => { setBrandId(id); setModelId(""); setYearId(""); };
  const onModel = (id: string) => { setModelId(id); setYearId(""); };
  const ready = !!(brandId && modelId);

  const go = () => {
    if (brand && model) router.push(`/catalog/${brand.slug}/${model.slug}${yearId ? `?year=${yearId}` : ""}`);
  };

  return (
    <section id="configurator" className="py-14 lg:py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">{t("cfg.label")}</span>
          <h2 className="mt-4 text-3xl lg:text-5xl font-bold tracking-tight">{t("cfg.titleA")} <span className="text-gold-gradient">{t("cfg.titleB")}</span></h2>
          <p className="mt-3 text-text-dim text-base max-w-lg mx-auto">{t("cfg.subtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Ambient gold glow behind the frame */}
          <div className="absolute -inset-4 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 rounded-[32px] blur-2xl pointer-events-none" aria-hidden />

          <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-br from-gold/60 via-gold/20 to-gold/50 shadow-[0_12px_48px_rgba(0,0,0,0.4),0_0_32px_rgba(212,165,74,0.12)]">
            <div className="rounded-[26px] bg-gradient-to-b from-[#161616] to-[#0F0F0F] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <CustomSelect label={t("cfg.make")} step={1} value={brandId} display={brand?.name||""} placeholder={t("cfg.makePh")}
                  options={brands.map((b) => ({ id: b.id, label: b.name }))} onChange={onBrand} />
                <CustomSelect label={t("cfg.model")} step={2} value={modelId} display={model?.name||""} placeholder={t("cfg.modelPh")}
                  options={models.map((m) => ({ id: m.id, label: m.name }))} onChange={onModel} disabled={!brandId} />
                <CustomSelect label={t("cfg.year")} step={3} value={yearId} display={yearId} placeholder={t("cfg.yearPh")}
                  options={years.map((y) => ({ id: String(y), label: String(y) }))} onChange={setYearId} disabled={!modelId} />
              </div>

              <button onClick={go} disabled={!ready}
                className={`w-full mt-7 py-5 rounded-xl text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300 ${
                  ready
                    ? "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_24px_rgba(212,165,74,0.35)] hover:shadow-[0_6px_36px_rgba(212,165,74,0.5)] hover:from-gold-light hover:to-gold"
                    : "bg-surface border border-border text-text-faint cursor-not-allowed"
                }`}>
                {ready ? t("cfg.submit") : t("cfg.submitDisabled")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
