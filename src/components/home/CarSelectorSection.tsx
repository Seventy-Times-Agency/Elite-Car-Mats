"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { brands, mockModels } from "@/data/mock";

export function CarSelectorSection() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

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

  return (
    <section id="configurator" className="py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 animate-[fadeUp_0.6s_ease]">
          <span className="section-label">Конфигуратор</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">
            Подберите коврики
          </h2>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            Выберите марку, модель и год выпуска
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Selector box */}
          <div className="bg-light border border-light-border shadow-[0_2px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {/* Brand */}
              <div className="border-b sm:border-b-0 sm:border-r border-light-border p-1">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-gold font-medium px-4 pt-3 pb-1">
                  Марка
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full bg-transparent px-4 pb-3 pt-0 text-sm text-text-primary focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Выберите марку</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div className="border-b sm:border-b-0 sm:border-r border-light-border p-1">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-gold font-medium px-4 pt-3 pb-1">
                  Модель
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!selectedBrand}
                  className="w-full bg-transparent px-4 pb-3 pt-0 text-sm text-text-primary focus:outline-none appearance-none cursor-pointer disabled:text-light-text disabled:cursor-not-allowed"
                >
                  <option value="">Выберите модель</option>
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="p-1">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-gold font-medium px-4 pt-3 pb-1">
                  Год
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={!selectedModel}
                  className="w-full bg-transparent px-4 pb-3 pt-0 text-sm text-text-primary focus:outline-none appearance-none cursor-pointer disabled:text-light-text disabled:cursor-not-allowed"
                >
                  <option value="">Выберите год</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedBrand || !selectedModel}
            className="w-full bg-dark hover:bg-gold disabled:bg-light-border disabled:text-light-text text-light text-sm font-medium tracking-wider uppercase py-4 transition-all duration-300 disabled:cursor-not-allowed mt-0"
          >
            Показать коврики
          </button>
        </div>
      </div>
    </section>
  );
}
