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
    <section className="py-16 lg:py-24 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-white">
            Подберите <span className="text-gradient-gold">коврики</span> для
            вашего авто
          </h2>
          <p className="mt-4 text-brand-text-muted text-lg">
            Выберите марку, модель и год выпуска
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-gray/30 backdrop-blur-sm border border-brand-gray/50 rounded-2xl p-6 lg:p-8 border-glow-gold">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-brand-text-muted mb-2">
                  Марка
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Выберите марку</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-brand-text-muted mb-2">
                  Модель
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!selectedBrand}
                  className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Выберите модель</option>
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-brand-text-muted mb-2">
                  Год
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={!selectedModel}
                  className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Выберите год</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedBrand || !selectedModel}
              className="mt-6 w-full bg-brand-gold hover:bg-brand-gold-light disabled:bg-brand-gray disabled:cursor-not-allowed text-brand-black font-semibold py-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-brand-gold/20 text-base"
            >
              Показать коврики
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
