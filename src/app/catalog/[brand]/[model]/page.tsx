"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { brands, mockModels, matSets, evaColors, edgeColors, badges, carImage } from "@/data/mock";
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
    <div>
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
          {/* Left — car image + color preview */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-b from-light-soft to-light-card border border-light-border relative overflow-hidden">
              <Image
                src={carImage(brand.name, model.name, selectedYear)}
                alt={`${brand.name} ${model.name}`}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="flex gap-2 h-14">
              <div className="flex-1 border border-light-border relative" style={{ backgroundColor: selectedColor.hex }}>
                <span className="absolute bottom-2 left-3 text-[10px] text-white/60 tracking-wider uppercase">Коврик</span>
              </div>
              <div className="w-14 border border-light-border relative" style={{ backgroundColor: selectedEdge.hex }}>
                <span className="absolute bottom-2 left-1.5 text-[9px] text-white/60 tracking-wider uppercase">Кант</span>
              </div>
            </div>
          </div>

          {/* Right — configurator */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">{brand.name} {model.name}</h1>
            <p className="text-text-secondary text-sm mt-1">{model.bodyType} &middot; EVA коврики</p>

            <div className="mt-10 space-y-8">
              {/* Year */}
              <div>
                <h3 className="section-label text-light-text text-[10px] mb-3">1 &mdash; Год выпуска</h3>
                <div className="flex flex-wrap gap-2">
                  {[...model.years].sort((a, b) => b - a).map((year) => (
                    <button key={year} onClick={() => setSelectedYear(year)}
                      className={`px-4 py-2.5 text-sm transition-all duration-200 ${
                        selectedYear === year ? "bg-dark text-light" : "border border-light-border text-text-secondary hover:border-gold hover:text-gold"
                      }`}>{year}</button>
                  ))}
                </div>
              </div>

              {/* Set */}
              <div>
                <h3 className="section-label text-light-text text-[10px] mb-3">2 &mdash; Комплект</h3>
                <div className="grid grid-cols-2 gap-3">
                  {matSets.map((set) => (
                    <button key={set.type} onClick={() => setSelectedSet(set.type)}
                      className={`p-4 text-left transition-all duration-200 ${
                        selectedSet === set.type ? "border-2 border-gold bg-gold-muted" : "border border-light-border hover:border-gold/40"
                      }`}>
                      <div className={`text-sm font-medium ${selectedSet === set.type ? "text-gold-dark" : "text-text-primary"}`}>{set.label}</div>
                      <div className="text-xs text-light-text mt-1">{set.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <h3 className="section-label text-light-text text-[10px] mb-3">3 &mdash; Цвет коврика: <span className="normal-case text-text-primary">{selectedColor.name}</span></h3>
                <div className="flex gap-3">
                  {evaColors.map((c) => (
                    <button key={c.id} onClick={() => setSelectedColor(c)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${selectedColor.id === c.id ? "ring-2 ring-gold ring-offset-2 scale-110" : "ring-1 ring-light-border hover:ring-gold/50"}`}
                      style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>

              {/* Edge */}
              <div>
                <h3 className="section-label text-light-text text-[10px] mb-3">4 &mdash; Окантовка: <span className="normal-case text-text-primary">{selectedEdge.name}</span></h3>
                <div className="flex gap-3">
                  {edgeColors.map((c) => (
                    <button key={c.id} onClick={() => setSelectedEdge(c)}
                      className={`w-9 h-9 rounded-full transition-all duration-200 ${selectedEdge.id === c.id ? "ring-2 ring-gold ring-offset-2 scale-110" : "ring-1 ring-light-border hover:ring-gold/50"}`}
                      style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>

              {/* Badge */}
              {badge && (
                <div>
                  <h3 className="section-label text-light-text text-[10px] mb-3">5 &mdash; Шильдик</h3>
                  <label className="flex items-center gap-4 cursor-pointer border border-light-border p-4 hover:border-gold/40 transition-colors duration-200">
                    <input type="checkbox" checked={addBadge} onChange={(e) => setAddBadge(e.target.checked)}
                      className="w-4 h-4 border-light-border text-gold focus:ring-gold accent-[#C9A84C]" />
                    <div>
                      <span className="text-text-primary text-sm font-medium">Металлический шильдик {brand.name}</span>
                      <p className="text-light-text text-xs mt-0.5">Логотип марки на коврик</p>
                    </div>
                  </label>
                </div>
              )}

              {/* CTA */}
              <button onClick={handleAddToCart}
                className={`w-full py-4 text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
                  added ? "bg-success text-light" : "bg-dark hover:bg-gold text-light"
                }`}>
                {added ? "Добавлено в корзину!" : "Добавить в корзину"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
