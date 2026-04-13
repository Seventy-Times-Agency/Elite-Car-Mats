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

  if (!brand || !model) return <div className="py-20 text-center"><h1 className="text-xl font-bold">Не найдено</h1><Link href="/catalog" className="mt-3 inline-block text-gold text-sm">Каталог</Link></div>;

  const badge = badges.find((b) => b.brandName === brand.name);
  const currentMatSet = matSets.find((s) => s.type === selectedSet)!;

  const handleAddToCart = () => {
    addItem({ modelId: model.id, brandName: brand.name, modelName: model.name, year: selectedYear, matSet: selectedSet, matSetLabel: currentMatSet.label, color: selectedColor, edgeColor: selectedEdge, badge: addBadge && badge ? badge : undefined, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <div className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-xs text-text-muted">
            <Link href="/catalog" className="hover:text-gold transition-colors">Каталог</Link><span className="mx-2">/</span>
            <Link href={`/catalog/${brand.slug}`} className="hover:text-gold transition-colors">{brand.name}</Link><span className="mx-2">/</span>
            <span className="text-text-primary">{model.name}</span>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4">
            <div className="aspect-square bg-dark-card border border-dark-border rounded-lg relative overflow-hidden">
              <Image src={carImage(brand.name, model.name, selectedYear)} alt={`${brand.name} ${model.name}`} fill className="object-contain p-8" sizes="(max-width:1024px) 100vw,50vw" priority />
            </div>
            <div className="flex gap-2 h-14">
              <div className="flex-1 border border-dark-border rounded relative" style={{ backgroundColor: selectedColor.hex }}>
                <span className="absolute bottom-2 left-3 text-[10px] text-white/40 tracking-wider uppercase">Коврик</span>
              </div>
              <div className="w-14 border border-dark-border rounded relative" style={{ backgroundColor: selectedEdge.hex }}>
                <span className="absolute bottom-2 left-1.5 text-[9px] text-white/40 tracking-wider uppercase">Кант</span>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">{brand.name} {model.name}</h1>
            <p className="text-text-secondary text-sm mt-1">{model.bodyType} · EVA коврики</p>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="section-label text-gold/40 text-[10px] mb-3">1 — Год</h3>
                <div className="flex flex-wrap gap-2">
                  {[...model.years].sort((a,b) => b-a).map((y) => (
                    <button key={y} onClick={() => setSelectedYear(y)} className={`px-4 py-2.5 text-sm rounded transition-all ${selectedYear === y ? "bg-gold text-dark" : "border border-dark-border text-text-secondary hover:border-gold/40 hover:text-gold"}`}>{y}</button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="section-label text-gold/40 text-[10px] mb-3">2 — Комплект</h3>
                <div className="grid grid-cols-2 gap-3">
                  {matSets.map((s) => (
                    <button key={s.type} onClick={() => setSelectedSet(s.type)} className={`p-4 text-left rounded-lg transition-all ${selectedSet === s.type ? "border-2 border-gold bg-gold/5" : "border border-dark-border hover:border-gold/30"}`}>
                      <div className={`text-sm font-medium ${selectedSet === s.type ? "text-gold" : "text-text-primary"}`}>{s.label}</div>
                      <div className="text-xs text-text-muted mt-1">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="section-label text-gold/40 text-[10px] mb-3">3 — Цвет: <span className="normal-case text-text-primary">{selectedColor.name}</span></h3>
                <div className="flex gap-3">
                  {evaColors.map((c) => <button key={c.id} onClick={() => setSelectedColor(c)} className={`w-10 h-10 rounded-full transition-all ${selectedColor.id === c.id ? "ring-2 ring-gold ring-offset-2 ring-offset-dark scale-110" : "ring-1 ring-dark-border hover:ring-gold/40"}`} style={{ backgroundColor: c.hex }} />)}
                </div>
              </div>
              <div>
                <h3 className="section-label text-gold/40 text-[10px] mb-3">4 — Окантовка: <span className="normal-case text-text-primary">{selectedEdge.name}</span></h3>
                <div className="flex gap-3">
                  {edgeColors.map((c) => <button key={c.id} onClick={() => setSelectedEdge(c)} className={`w-9 h-9 rounded-full transition-all ${selectedEdge.id === c.id ? "ring-2 ring-gold ring-offset-2 ring-offset-dark scale-110" : "ring-1 ring-dark-border hover:ring-gold/40"}`} style={{ backgroundColor: c.hex }} />)}
                </div>
              </div>
              {badge && (
                <div>
                  <h3 className="section-label text-gold/40 text-[10px] mb-3">5 — Шильдик</h3>
                  <label className="flex items-center gap-4 cursor-pointer border border-dark-border rounded-lg p-4 hover:border-gold/30 transition-colors">
                    <input type="checkbox" checked={addBadge} onChange={(e) => setAddBadge(e.target.checked)} className="w-4 h-4 border-dark-border text-gold focus:ring-gold accent-[#C9A84C]" />
                    <div><span className="text-text-primary text-sm font-medium">Шильдик {brand.name}</span><p className="text-text-muted text-xs mt-0.5">Металлический логотип</p></div>
                  </label>
                </div>
              )}
              <button onClick={handleAddToCart} className={`w-full py-4 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-300 ${added ? "bg-success text-white" : "bg-gold hover:bg-gold-light text-dark shadow-[0_4px_20px_rgba(201,168,76,0.2)]"}`}>
                {added ? "Добавлено!" : "Добавить в корзину"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
