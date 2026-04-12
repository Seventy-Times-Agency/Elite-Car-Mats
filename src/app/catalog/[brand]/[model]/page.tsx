"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { brands, mockModels, matSets, evaColors, edgeColors, badges } from "@/data/mock";
import { useCart } from "@/context/CartContext";
import { MatSetType } from "@/types";

export default function ProductPage() {
  const params = useParams();
  const brandSlug = params.brand as string;
  const modelSlug = params.model as string;

  const brand = brands.find((b) => b.slug === brandSlug);
  const model = mockModels.find(
    (m) => m.slug === modelSlug && m.brandId === brand?.id
  );

  const { addItem } = useCart();

  const [selectedSet, setSelectedSet] = useState<MatSetType>("full-cargo");
  const [selectedColor, setSelectedColor] = useState(evaColors[0]);
  const [selectedEdge, setSelectedEdge] = useState(edgeColors[0]);
  const [selectedYear, setSelectedYear] = useState(
    model ? model.years[model.years.length - 1] : 0
  );
  const [addBadge, setAddBadge] = useState(false);
  const [added, setAdded] = useState(false);

  if (!brand || !model) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-black">Модель не найдена</h1>
        <Link href="/catalog" className="mt-4 inline-block text-brand-gold hover:text-brand-gold-dark transition-colors">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const badge = badges.find((b) => b.brandName === brand.name);
  const currentMatSet = matSets.find((s) => s.type === selectedSet)!;

  const handleAddToCart = () => {
    addItem({
      modelId: model.id,
      brandName: brand.name,
      modelName: model.name,
      year: selectedYear,
      matSet: selectedSet,
      matSetLabel: currentMatSet.label,
      color: selectedColor,
      edgeColor: selectedEdge,
      badge: addBadge && badge ? badge : undefined,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="bg-brand-offwhite border-b border-brand-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-xs text-brand-gray-400">
            <Link href="/catalog" className="hover:text-brand-gold transition-colors">Каталог</Link>
            <span className="mx-2">/</span>
            <Link href={`/catalog/${brand.slug}`} className="hover:text-brand-gold transition-colors">{brand.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-black">{model.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left — Image area */}
          <div className="space-y-4">
            <div className="aspect-square bg-brand-offwhite border border-brand-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-brand-gray-200">{brand.name.charAt(0)}</div>
                <p className="mt-2 text-brand-gray-300 text-xs tracking-wide uppercase">Фото коврика</p>
              </div>
            </div>
            {/* Color preview */}
            <div className="flex gap-2 h-12">
              <div className="flex-1 border border-brand-gray-200" style={{ backgroundColor: selectedColor.hex }} />
              <div className="w-12 border border-brand-gray-200" style={{ backgroundColor: selectedEdge.hex }} title="Окантовка" />
            </div>
          </div>

          {/* Right — Configurator */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black">
              {brand.name} {model.name}
            </h1>
            <p className="text-brand-text-secondary text-sm mt-1">{model.bodyType}</p>

            <div className="mt-8 space-y-8">
              {/* Step 1: Year */}
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-3">
                  1. Год выпуска
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...model.years].sort((a, b) => b - a).map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-2 text-sm transition-all ${
                        selectedYear === year
                          ? "bg-brand-black text-white"
                          : "border border-brand-gray-200 text-brand-gray-500 hover:border-brand-gold hover:text-brand-gold"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Mat Set */}
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-3">
                  2. Комплект
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {matSets.map((set) => (
                    <button
                      key={set.type}
                      onClick={() => setSelectedSet(set.type)}
                      className={`p-4 text-left transition-all ${
                        selectedSet === set.type
                          ? "border-2 border-brand-gold bg-brand-gold/5"
                          : "border border-brand-gray-200 hover:border-brand-gray-300"
                      }`}
                    >
                      <div className={`text-sm font-medium ${selectedSet === set.type ? "text-brand-gold-dark" : "text-brand-black"}`}>
                        {set.label}
                      </div>
                      <div className="text-xs text-brand-gray-400 mt-1">
                        {set.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Color */}
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-3">
                  3. Цвет коврика — <span className="text-brand-black normal-case">{selectedColor.name}</span>
                </h3>
                <div className="flex gap-3">
                  {evaColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        selectedColor.id === color.id
                          ? "ring-2 ring-brand-gold ring-offset-2"
                          : "ring-1 ring-brand-gray-200 hover:ring-brand-gray-300"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Step 4: Edge Color */}
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-3">
                  4. Цвет окантовки — <span className="text-brand-black normal-case">{selectedEdge.name}</span>
                </h3>
                <div className="flex gap-3">
                  {edgeColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedEdge(color)}
                      className={`w-9 h-9 rounded-full transition-all ${
                        selectedEdge.id === color.id
                          ? "ring-2 ring-brand-gold ring-offset-2"
                          : "ring-1 ring-brand-gray-200 hover:ring-brand-gray-300"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Step 5: Badge */}
              {badge && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-3">
                    5. Шильдик
                  </h3>
                  <label className="flex items-center gap-3 cursor-pointer group border border-brand-gray-200 p-4 hover:border-brand-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={addBadge}
                      onChange={(e) => setAddBadge(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-brand-gray-300 text-brand-gold focus:ring-brand-gold accent-brand-gold"
                    />
                    <div>
                      <span className="text-brand-black text-sm font-medium">
                        Металлический шильдик {brand.name}
                      </span>
                      <p className="text-brand-gray-400 text-xs mt-0.5">
                        Логотип марки на коврик
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 text-sm font-medium tracking-wide uppercase transition-all ${
                  added
                    ? "bg-brand-success text-white"
                    : "bg-brand-black hover:bg-brand-gold text-white"
                }`}
              >
                {added ? "Добавлено в корзину!" : "Добавить в корзину"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
