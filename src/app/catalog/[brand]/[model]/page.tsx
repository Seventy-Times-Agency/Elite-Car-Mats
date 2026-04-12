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
        <h1 className="text-2xl font-bold text-brand-white">
          Модель не найдена
        </h1>
        <Link
          href="/catalog"
          className="mt-4 inline-block text-brand-gold hover:text-brand-gold-light transition-colors"
        >
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
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center gap-2 text-brand-text-muted flex-wrap">
            <li>
              <Link
                href="/catalog"
                className="hover:text-brand-gold transition-colors"
              >
                Каталог
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/catalog/${brand.slug}`}
                className="hover:text-brand-gold transition-colors"
              >
                {brand.name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-brand-gold">{model.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left: Image */}
          <div>
            <div className="aspect-square bg-brand-dark-light border border-brand-gray/30 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-32 h-32 text-brand-gray-light mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={0.5}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21z"
                  />
                </svg>
                <p className="mt-4 text-brand-text-muted text-sm">
                  Фото коврика
                </p>
              </div>
            </div>

            {/* Color preview strip */}
            <div className="mt-4 flex gap-2">
              <div
                className="flex-1 h-12 rounded-lg border-2 border-brand-gold/50"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div
                className="w-12 h-12 rounded-lg border border-brand-gray/50"
                style={{ backgroundColor: selectedEdge.hex }}
                title="Цвет окантовки"
              />
            </div>
          </div>

          {/* Right: Configuration */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-white">
              {brand.name} {model.name}
            </h1>
            <p className="text-brand-text-muted mt-1">
              {model.bodyType} &middot; EVA коврики премиум-класса
            </p>

            <div className="mt-8 space-y-8">
              {/* Year Selection */}
              <div>
                <h3 className="text-sm font-medium text-brand-text-muted mb-3">
                  Год выпуска
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...model.years].sort((a, b) => b - a).map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedYear === year
                          ? "bg-brand-gold text-brand-black"
                          : "bg-brand-dark border border-brand-gray/50 text-brand-text-muted hover:border-brand-gold/50"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mat Set Selection */}
              <div>
                <h3 className="text-sm font-medium text-brand-text-muted mb-3">
                  Комплект
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {matSets.map((set) => (
                    <button
                      key={set.type}
                      onClick={() => setSelectedSet(set.type)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedSet === set.type
                          ? "bg-brand-gold/10 border-2 border-brand-gold"
                          : "bg-brand-dark border border-brand-gray/50 hover:border-brand-gold/30"
                      }`}
                    >
                      <div
                        className={`text-sm font-semibold ${
                          selectedSet === set.type
                            ? "text-brand-gold"
                            : "text-brand-text"
                        }`}
                      >
                        {set.label}
                      </div>
                      <div className="text-xs text-brand-text-muted mt-1">
                        {set.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* EVA Color */}
              <div>
                <h3 className="text-sm font-medium text-brand-text-muted mb-3">
                  Цвет коврика
                </h3>
                <div className="flex gap-3">
                  {evaColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor.id === color.id
                          ? "border-brand-gold scale-110 shadow-lg shadow-brand-gold/20"
                          : "border-brand-gray/50 hover:border-brand-gold/30"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                  <span className="flex items-center text-xs text-brand-text-muted ml-2">
                    {selectedColor.name}
                  </span>
                </div>
              </div>

              {/* Edge Color */}
              <div>
                <h3 className="text-sm font-medium text-brand-text-muted mb-3">
                  Цвет окантовки
                </h3>
                <div className="flex gap-3">
                  {edgeColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedEdge(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedEdge.id === color.id
                          ? "border-brand-gold scale-110"
                          : "border-brand-gray/50 hover:border-brand-gold/30"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                  <span className="flex items-center text-xs text-brand-text-muted ml-2">
                    {selectedEdge.name}
                  </span>
                </div>
              </div>

              {/* Badge option */}
              {badge && (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={addBadge}
                      onChange={(e) => setAddBadge(e.target.checked)}
                      className="w-5 h-5 rounded border-brand-gray-light text-brand-gold focus:ring-brand-gold bg-brand-dark"
                    />
                    <div>
                      <span className="text-brand-text text-sm font-medium group-hover:text-brand-gold transition-colors">
                        Добавить шильдик {brand.name}
                      </span>
                      <p className="text-brand-text-muted text-xs">
                        Металлический шильдик с логотипом марки на коврик
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                  added
                    ? "bg-brand-success text-white"
                    : "bg-brand-gold hover:bg-brand-gold-light text-brand-black hover:shadow-lg hover:shadow-brand-gold/20"
                }`}
              >
                {added ? "Добавлено в корзину!" : "В корзину"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
