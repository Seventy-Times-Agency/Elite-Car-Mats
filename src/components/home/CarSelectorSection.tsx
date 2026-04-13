"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { brands, mockModels } from "@/data/mock";

interface DropdownProps {
  label: string;
  step: number;
  value: string;
  displayValue: string;
  placeholder: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
  disabled?: boolean;
  active: boolean;
}

function Dropdown({ label, step, value, displayValue, placeholder, options, onChange, disabled, active }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full text-left p-5 border rounded-lg transition-all duration-200 ${
          open ? "border-gold bg-gold/5" : disabled ? "border-dark-border/40 opacity-30 cursor-not-allowed" : "border-dark-border hover:border-gold/40"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${active ? "bg-gold text-dark" : "bg-dark-border text-text-muted"}`}>{step}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold/50 font-medium">{label}</span>
        </div>
        <div className="flex items-center justify-between pl-7">
          <span className={`text-base font-medium ${value ? "text-text-primary" : "text-text-muted"}`}>
            {value ? displayValue : placeholder}
          </span>
          <svg className={`w-4 h-4 text-gold/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && options.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-dark-card border border-dark-border rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.6)] max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                value === opt.id ? "text-gold bg-gold/5" : "text-text-secondary hover:text-text-primary hover:bg-dark-border/30"
              }`}
            >
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
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const brand = brands.find((b) => b.id === selectedBrand);
  const model = mockModels.find((m) => m.id === selectedModel);
  const availableModels = useMemo(() => mockModels.filter((m) => m.brandId === selectedBrand), [selectedBrand]);
  const availableYears = useMemo(() => model ? [...model.years].sort((a, b) => b - a) : [], [model]);

  const handleBrandChange = (id: string) => { setSelectedBrand(id); setSelectedModel(""); setSelectedYear(""); };
  const handleModelChange = (id: string) => { setSelectedModel(id); setSelectedYear(""); };

  const handleSubmit = () => {
    if (brand && model) {
      router.push(`/catalog/${brand.slug}/${model.slug}${selectedYear ? `?year=${selectedYear}` : ""}`);
    }
  };

  const isReady = !!(selectedBrand && selectedModel);

  return (
    <section id="configurator" className="py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Конфигуратор</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Подберите коврики</h2>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">3 шага до идеальных ковриков для вашего авто</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Dropdown label="Марка" step={1} value={selectedBrand} displayValue={brand?.name || ""} placeholder="Выберите" options={brands.map((b) => ({ id: b.id, label: b.name }))} onChange={handleBrandChange} active={!!selectedBrand} />
            <Dropdown label="Модель" step={2} value={selectedModel} displayValue={model?.name || ""} placeholder="Выберите" options={availableModels.map((m) => ({ id: m.id, label: m.name }))} onChange={handleModelChange} disabled={!selectedBrand} active={!!selectedModel} />
            <Dropdown label="Год" step={3} value={selectedYear} displayValue={selectedYear} placeholder="Выберите" options={availableYears.map((y) => ({ id: String(y), label: String(y) }))} onChange={setSelectedYear} disabled={!selectedModel} active={!!selectedYear} />
          </div>
          <button onClick={handleSubmit} disabled={!isReady}
            className={`w-full mt-4 py-4 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
              isReady ? "bg-gold hover:bg-gold-light text-dark shadow-[0_4px_20px_rgba(201,168,76,0.25)]" : "bg-dark-border/40 text-text-muted cursor-not-allowed"
            }`}>
            {isReady ? "Показать коврики →" : "Выберите марку и модель"}
          </button>
        </div>
      </div>
    </section>
  );
}
