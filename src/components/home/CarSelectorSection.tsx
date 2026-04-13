"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { brands, mockModels } from "@/data/mock";

export function CarSelectorSection() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const availableModels = useMemo(
    () => mockModels.filter((m) => m.brandId === selectedBrand),
    [selectedBrand]
  );

  const availableYears = useMemo(() => {
    const model = mockModels.find((m) => m.id === selectedModel);
    return model ? [...model.years].sort((a, b) => b - a) : [];
  }, [selectedModel]);

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel("");
    setSelectedYear("");
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setSelectedYear("");
  };

  const handleSubmit = () => {
    if (selectedBrand && selectedModel) {
      const brand = brands.find((b) => b.id === selectedBrand);
      const model = mockModels.find((m) => m.id === selectedModel);
      if (brand && model) {
        const yearPath = selectedYear ? `?year=${selectedYear}` : "";
        router.push(`/catalog/${brand.slug}/${model.slug}${yearPath}`);
      }
    }
  };

  const isReady = selectedBrand && selectedModel;

  return (
    <section id="configurator" className="py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Конфигуратор</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">
            Подберите коврики
          </h2>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            3 шага до идеальных ковриков для вашего авто
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Modern card selector */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-light-border/50 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Brand */}
              <div className={`relative p-6 border-b md:border-b-0 md:border-r border-light-border/50 transition-colors duration-300 ${focused === "brand" ? "bg-gold-muted" : ""}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold text-[10px] font-bold">1</span>
                  <label className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium">Марка</label>
                </div>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  onFocus={() => setFocused("brand")}
                  onBlur={() => setFocused(null)}
                  className="w-full bg-transparent text-text-primary text-base font-medium focus:outline-none appearance-none cursor-pointer pr-6"
                >
                  <option value="" className="text-light-text">Выберите марку</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <svg className="absolute right-6 bottom-7 w-4 h-4 text-gold/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Model */}
              <div className={`relative p-6 border-b md:border-b-0 md:border-r border-light-border/50 transition-colors duration-300 ${focused === "model" ? "bg-gold-muted" : ""}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${selectedBrand ? "bg-gold/10 text-gold" : "bg-light-border/50 text-light-text"}`}>2</span>
                  <label className={`text-[10px] uppercase tracking-[0.25em] font-medium transition-colors ${selectedBrand ? "text-gold" : "text-light-text"}`}>Модель</label>
                </div>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!selectedBrand}
                  onFocus={() => setFocused("model")}
                  onBlur={() => setFocused(null)}
                  className="w-full bg-transparent text-text-primary text-base font-medium focus:outline-none appearance-none cursor-pointer disabled:text-light-text disabled:cursor-not-allowed pr-6"
                >
                  <option value="" className="text-light-text">Выберите модель</option>
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <svg className="absolute right-6 bottom-7 w-4 h-4 text-gold/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Year */}
              <div className={`relative p-6 transition-colors duration-300 ${focused === "year" ? "bg-gold-muted" : ""}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${selectedModel ? "bg-gold/10 text-gold" : "bg-light-border/50 text-light-text"}`}>3</span>
                  <label className={`text-[10px] uppercase tracking-[0.25em] font-medium transition-colors ${selectedModel ? "text-gold" : "text-light-text"}`}>Год</label>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={!selectedModel}
                  onFocus={() => setFocused("year")}
                  onBlur={() => setFocused(null)}
                  className="w-full bg-transparent text-text-primary text-base font-medium focus:outline-none appearance-none cursor-pointer disabled:text-light-text disabled:cursor-not-allowed pr-6"
                >
                  <option value="" className="text-light-text">Выберите год</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <svg className="absolute right-6 bottom-7 w-4 h-4 text-gold/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Submit */}
            <div className="p-4 bg-light-soft/50 border-t border-light-border/50">
              <button
                onClick={handleSubmit}
                disabled={!isReady}
                className={`w-full py-4 rounded-xl text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
                  isReady
                    ? "bg-gold hover:bg-gold-light text-dark shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_24px_rgba(201,168,76,0.4)]"
                    : "bg-light-border text-light-text cursor-not-allowed"
                }`}
              >
                {isReady ? "Показать коврики →" : "Выберите марку и модель"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
