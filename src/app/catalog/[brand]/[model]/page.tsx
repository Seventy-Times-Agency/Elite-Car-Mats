"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { brands, mockModels, matSets, evaColors, edgeColors, badges } from "@/data/mock";
import { useCart } from "@/context/CartContext";
import { MatSetType } from "@/types";

export default function ProductPage() {
  const params = useParams();
  const brand = brands.find((b) => b.slug === params.brand);
  const model = mockModels.find((m) => m.slug === params.model && m.brandId === brand?.id);

  const { addItem } = useCart();
  const [selectedSet, setSelectedSet] = useState<MatSetType>("full-cargo");
  const [selectedColor, setSelectedColor] = useState(evaColors[0]);
  const [selectedEdge, setSelectedEdge] = useState(edgeColors[0]);
  const [selectedYear, setSelectedYear] = useState(model ? model.years[model.years.length - 1] : 0);
  const [addBadge, setAddBadge] = useState(false);
  const [added, setAdded] = useState(false);

  if (!brand || !model) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Модель не найдена</h1>
        <Link href="/catalog" className="mt-3 inline-block text-gold text-sm">Каталог</Link>
      </div>
    );
  }

  const badge = badges.find((b) => b.brandName === brand.name);
  const currentMatSet = matSets.find((s) => s.type === selectedSet)!;

  const handleAddToCart = () => {
    addItem({
      modelId: model.id, brandName: brand.name, modelName: model.name,
      year: selectedYear, matSet: selectedSet, matSetLabel: currentMatSet.label,
      color: selectedColor, edgeColor: selectedEdge,
      badge: addBadge && badge ? badge : undefined, quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-light">
      {/* Breadcrumbs */}
      <div className="border-b border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-xs text-light-text">
            <Link href="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
            <span className="mx-2">/</span>
            <Link href={`/catalog/${brand.slug}`} className="hover:text-gold transition-colors">{brand.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{model.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left — preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-light-soft border border-light-border flex items-center justify-center relative overflow-hidden">
              {/* EVA pattern background */}
              <div className="absolute inset-0 eva-pattern opacity-50" />
              <div className="relative text-center">
                <div className="text-6xl font-bold text-light-border">{brand.name.charAt(0)}</div>
                <p className="mt-2 text-light-text text-xs tracking-wider uppercase">Фото коврика</p>
              </div>
            </div>
            {/* Color preview bar */}
            <div className="flex gap-2 h-14">
              <motion.div
                key={selectedColor.id}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="flex-1 border border-light-border relative"
                style={{ backgroundColor: selectedColor.hex }}
              >
                <span className="absolute bottom-2 left-3 text-[10px] text-white/60 tracking-wider uppercase">Коврик</span>
              </motion.div>
              <motion.div
                key={selectedEdge.id}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="w-14 border border-light-border relative"
                style={{ backgroundColor: selectedEdge.hex }}
              >
                <span className="absolute bottom-2 left-1.5 text-[9px] text-white/60 tracking-wider uppercase">Кант</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right — configurator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
              {brand.name} {model.name}
            </h1>
            <p className="text-text-secondary text-sm mt-1">{model.bodyType} &middot; EVA коврики</p>

            <div className="mt-10 space-y-8">
              {/* 1: Year */}
              <div>
                <h3 className="section-label text-light-text text-[10px] mb-3">1 &mdash; Год выпуска</h3>
                <div className="flex flex-wrap gap-2">
                  {[...model.years].sort((a, b) => b - a).map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-2.5 text-sm transition-all duration-200 ${
                        selectedYear === year
                          ? "bg-dark text-light"
                          : "border border-light-border text-text-secondary hover:border-gold hover:text-gold"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2: Set */}
              <div>
                <h3 className="section-label text-light-text text-[10px] mb-3">2 &mdash; Комплект</h3>
                <div className="grid grid-cols-2 gap-3">
                  {matSets.map((set) => (
                    <button
                      key={set.type}
                      onClick={() => setSelectedSet(set.type)}
                      className={`p-4 text-left transition-all duration-200 ${
                        selectedSet === set.type
                          ? "border-2 border-gold bg-gold-muted"
                          : "border border-light-border hover:border-gold/40"
                      }`}
                    >
                      <div className={`text-sm font-medium ${selectedSet === set.type ? "text-gold-dark" : "text-text-primary"}`}>
                        {set.label}
                      </div>
                      <div className="text-xs text-light-text mt-1">{set.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3: Color */}
              <div>
                <h3 className="section-label text-light-text text-[10px] mb-3">
                  3 &mdash; Цвет коврика: <span className="normal-case text-text-primary">{selectedColor.name}</span>
                </h3>
                <div className="flex gap-3">
                  {evaColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColor(c)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${
                        selectedColor.id === c.id
                          ? "ring-2 ring-gold ring-offset-2 scale-110"
                          : "ring-1 ring-light-border hover:ring-gold/50"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* 4: Edge */}
              <div>
                <h3 className="section-label text-light-text text-[10px] mb-3">
                  4 &mdash; Окантовка: <span className="normal-case text-text-primary">{selectedEdge.name}</span>
                </h3>
                <div className="flex gap-3">
                  {edgeColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedEdge(c)}
                      className={`w-9 h-9 rounded-full transition-all duration-200 ${
                        selectedEdge.id === c.id
                          ? "ring-2 ring-gold ring-offset-2 scale-110"
                          : "ring-1 ring-light-border hover:ring-gold/50"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* 5: Badge */}
              {badge && (
                <div>
                  <h3 className="section-label text-light-text text-[10px] mb-3">5 &mdash; Шильдик</h3>
                  <label className="flex items-center gap-4 cursor-pointer border border-light-border p-4 hover:border-gold/40 transition-colors duration-200 group">
                    <input
                      type="checkbox"
                      checked={addBadge}
                      onChange={(e) => setAddBadge(e.target.checked)}
                      className="w-4 h-4 border-light-border text-gold focus:ring-gold accent-[#C9A84C]"
                    />
                    <div>
                      <span className="text-text-primary text-sm font-medium group-hover:text-gold transition-colors">
                        Металлический шильдик {brand.name}
                      </span>
                      <p className="text-light-text text-xs mt-0.5">Логотип марки на коврик</p>
                    </div>
                  </label>
                </div>
              )}

              {/* CTA */}
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
                  added
                    ? "bg-success text-light"
                    : "bg-dark hover:bg-gold text-light"
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={added ? "added" : "add"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    {added ? "Добавлено в корзину!" : "Добавить в корзину"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
