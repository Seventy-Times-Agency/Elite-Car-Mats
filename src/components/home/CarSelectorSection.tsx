"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    "w-full bg-transparent border-0 px-5 py-4 text-sm text-text-primary focus:outline-none appearance-none cursor-pointer disabled:text-light-text disabled:cursor-not-allowed";

  return (
    <section className="py-24 lg:py-32 bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label">Конфигуратор</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">
            Подберите коврики
          </h2>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            Выберите марку, модель и год выпуска
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="border border-light-border bg-light-soft">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-light-border">
              <div>
                <label className="block section-label text-light-text px-5 pt-4 text-[10px]">Марка</label>
                <select value={selectedBrand} onChange={(e) => handleBrandChange(e.target.value)} className={selectClasses}>
                  <option value="">Выберите</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block section-label text-light-text px-5 pt-4 text-[10px]">Модель</label>
                <select value={selectedModel} onChange={(e) => handleModelChange(e.target.value)} disabled={!selectedBrand} className={selectClasses}>
                  <option value="">Выберите</option>
                  {availableModels.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block section-label text-light-text px-5 pt-4 text-[10px]">Год</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} disabled={!selectedModel} className={selectClasses}>
                  <option value="">Выберите</option>
                  {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedBrand || !selectedModel}
            className="w-full bg-dark hover:bg-gold disabled:bg-light-border disabled:text-light-text text-light text-sm font-medium tracking-wider uppercase py-4 transition-all duration-300 disabled:cursor-not-allowed"
          >
            Показать коврики
          </button>
        </motion.div>
      </div>
    </section>
  );
}
