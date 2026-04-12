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

  const selectClasses =
    "w-full bg-white border border-brand-gray-200 rounded-none px-4 py-3.5 text-brand-text text-sm focus:border-brand-gold focus:outline-none transition-colors appearance-none cursor-pointer disabled:bg-brand-gray-100 disabled:text-brand-gray-400 disabled:cursor-not-allowed";

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-3">
            Конфигуратор
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-black">
            Подберите коврики для вашего авто
          </h2>
          <p className="mt-4 text-brand-text-secondary max-w-lg mx-auto">
            Выберите марку, модель и год — мы подберём идеальный комплект
          </p>
        </div>

        {/* Selector — like PrimeEVA: horizontal steps */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-brand-gray-200">
            {/* Brand */}
            <div className="border-b sm:border-b-0 sm:border-r border-brand-gray-200">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium px-4 pt-3">
                Марка
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className={selectClasses + " border-0"}
              >
                <option value="">Выберите марку</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="border-b sm:border-b-0 sm:border-r border-brand-gray-200">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium px-4 pt-3">
                Модель
              </label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={!selectedBrand}
                className={selectClasses + " border-0"}
              >
                <option value="">Выберите модель</option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium px-4 pt-3">
                Год
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedModel}
                className={selectClasses + " border-0"}
              >
                <option value="">Выберите год</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedBrand || !selectedModel}
            className="mt-0 w-full bg-brand-black hover:bg-brand-gold disabled:bg-brand-gray-200 disabled:text-brand-gray-400 text-white text-sm font-medium tracking-wide uppercase py-4 transition-colors disabled:cursor-not-allowed"
          >
            Показать коврики
          </button>
        </div>
      </div>
    </section>
  );
}
