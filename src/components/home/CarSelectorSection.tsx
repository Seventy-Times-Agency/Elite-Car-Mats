"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { brands, mockModels } from "@/data/mock";

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
        className={`w-full text-left glass-card glow-hover rounded-xl p-5 transition-all duration-300 ${
          disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
        } ${open ? "!border-gold/40 shadow-[0_0_24px_rgba(212,165,74,0.1)]" : ""}`}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
            active ? "bg-gradient-to-br from-gold to-gold-dark text-bg shadow-[0_0_10px_rgba(212,165,74,0.3)]" : "bg-border text-text-faint"
          }`}>{step}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">{label}</span>
        </div>
        <div className="flex items-center justify-between pl-8">
          <span className={`text-[15px] font-medium ${value ? "text-text" : "text-text-faint"}`}>
            {value ? display : placeholder}
          </span>
          <svg className={`w-4 h-4 text-gold/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <section id="configurator" className="py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Конфигуратор</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Подберите коврики</h2>
          <p className="mt-3 text-text-dim max-w-md mx-auto">3 шага до идеальных ковриков для вашего авто</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomSelect label="Марка" step={1} value={brandId} display={brand?.name||""} placeholder="Выберите марку"
              options={brands.map((b) => ({ id: b.id, label: b.name }))} onChange={onBrand} />
            <CustomSelect label="Модель" step={2} value={modelId} display={model?.name||""} placeholder="Выберите модель"
              options={models.map((m) => ({ id: m.id, label: m.name }))} onChange={onModel} disabled={!brandId} />
            <CustomSelect label="Год" step={3} value={yearId} display={yearId} placeholder="Выберите год"
              options={years.map((y) => ({ id: String(y), label: String(y) }))} onChange={setYearId} disabled={!modelId} />
          </div>

          <button onClick={go} disabled={!ready}
            className={`w-full mt-5 py-4 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
              ready
                ? "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_24px_rgba(212,165,74,0.3)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.4)] hover:from-gold-light hover:to-gold"
                : "bg-surface border border-border text-text-faint cursor-not-allowed"
            }`}>
            {ready ? "Показать коврики →" : "Выберите марку и модель"}
          </button>
        </div>
      </div>
    </section>
  );
}
