"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { brands, mockModels } from "@/data/mock";

type Step = "brand" | "model" | "year";

export function CarSelectorSection() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("brand");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const brand = brands.find((b) => b.id === selectedBrand);
  const availableModels = useMemo(
    () => mockModels.filter((m) => m.brandId === selectedBrand),
    [selectedBrand]
  );
  const model = mockModels.find((m) => m.id === selectedModel);
  const availableYears = useMemo(
    () => (model ? [...model.years].sort((a, b) => b - a) : []),
    [model]
  );

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel("");
    setStep("model");
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setStep("year");
  };

  const handleYearSelect = (year: number) => {
    if (brand && model) {
      router.push(`/catalog/${brand.slug}/${model.slug}?year=${year}`);
    }
  };

  const handleBack = () => {
    if (step === "year") { setStep("model"); setSelectedModel(""); }
    else if (step === "model") { setStep("brand"); setSelectedBrand(""); }
  };

  const stepNumber = step === "brand" ? 1 : step === "model" ? 2 : 3;

  return (
    <section id="configurator" className="py-24 lg:py-32 bg-light/80 backdrop-blur-sm scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="section-label">Конфигуратор</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">
            Подберите коврики
          </h2>
        </motion.div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { n: 1, label: "Марка", key: "brand" as Step },
            { n: 2, label: "Модель", key: "model" as Step },
            { n: 3, label: "Год", key: "year" as Step },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  stepNumber > s.n ? "bg-gold text-dark"
                  : stepNumber === s.n ? "bg-dark text-light"
                  : "bg-light-border text-light-text"
                }`}>
                  {stepNumber > s.n ? "✓" : s.n}
                </div>
                <span className={`text-xs tracking-wide uppercase hidden sm:block ${
                  stepNumber >= s.n ? "text-text-primary" : "text-light-text"
                }`}>
                  {s.key === "brand" && brand ? brand.name : s.key === "model" && model ? model.name : s.label}
                </span>
              </div>
              {i < 2 && <div className={`w-12 h-px ${stepNumber > s.n ? "bg-gold" : "bg-light-border"}`} />}
            </div>
          ))}
        </div>

        {/* Back button */}
        {step !== "brand" && (
          <div className="max-w-5xl mx-auto mb-6">
            <button onClick={handleBack} className="text-light-text hover:text-gold text-sm flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
          </div>
        )}

        {/* Content area */}
        <AnimatePresence mode="wait">
          {/* Step 1: Brand selection with logos */}
          {step === "brand" && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {brands.map((b, i) => (
                  <motion.button
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    onClick={() => handleBrandSelect(b.id)}
                    className="group bg-light border border-light-border hover:border-gold p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(201,168,76,0.1)]"
                  >
                    {b.logo ? (
                      <div className="w-12 h-9 relative">
                        <Image
                          src={b.logo}
                          alt={b.name}
                          fill
                          className="object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-9 flex items-center justify-center text-light-text group-hover:text-gold text-lg font-bold transition-colors">
                        {b.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-[11px] text-text-secondary group-hover:text-gold font-medium transition-colors text-center leading-tight">
                      {b.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Model selection */}
          {step === "model" && (
            <motion.div
              key="model"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              {availableModels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableModels.map((m, i) => (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      onClick={() => handleModelSelect(m.id)}
                      className="group bg-light border border-light-border hover:border-gold p-5 text-left transition-all duration-300 hover:shadow-[0_4px_16px_rgba(201,168,76,0.1)]"
                    >
                      <div className="text-base font-semibold text-text-primary group-hover:text-gold transition-colors">
                        {m.name}
                      </div>
                      <div className="text-xs text-light-text mt-1">
                        {m.bodyType} &middot; {m.years[0]}&ndash;{m.years[m.years.length - 1]}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  Модели для {brand?.name} скоро появятся
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Year selection */}
          {step === "year" && (
            <motion.div
              key="year"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-6">
                <p className="text-text-secondary text-sm">
                  Выберите год выпуска <span className="font-medium text-text-primary">{brand?.name} {model?.name}</span>
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {availableYears.map((year, i) => (
                  <motion.button
                    key={year}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    onClick={() => handleYearSelect(year)}
                    className="bg-light border border-light-border hover:border-gold hover:bg-gold hover:text-dark text-text-primary px-6 py-3 text-sm font-medium transition-all duration-300 hover:shadow-[0_4px_16px_rgba(201,168,76,0.15)]"
                  >
                    {year}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
