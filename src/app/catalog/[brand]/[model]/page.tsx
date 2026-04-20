"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { brands, mockModels, matSets, evaColors, edgeColors, badges } from "@/data/mock";
import { useCart } from "@/context/CartContext";
import { MatPreview } from "@/components/product/MatPreview";
import { MatSetType } from "@/types";
import { calculateItemUnitPrice, formatPrice, MAT_SET_PRICE } from "@/lib/pricing";

export default function ProductPage() {
  const params = useParams();
  const brand = brands.find((b) => b.slug === params.brand);
  const model = mockModels.find((m) => m.slug === params.model && m.brandId === brand?.id);
  const { addItem } = useCart();
  const [set, setSet] = useState<MatSetType>("full-cargo");
  const [color, setColor] = useState(evaColors[0]);
  const [edge, setEdge] = useState(edgeColors[0]);
  const [year, setYear] = useState(model ? model.years[model.years.length - 1] : 0);
  const [badge, setBadge] = useState(false);
  const [added, setAdded] = useState(false);

  if (!brand || !model) return <div className="py-20 text-center"><h1 className="text-xl font-bold">Не найдено</h1><Link href="/catalog" className="mt-3 inline-block text-gold text-sm">Каталог</Link></div>;

  const bdg = badges.find((b) => b.brandName === brand.name);
  const ms = matSets.find((s) => s.type === set)!;
  const unitPrice = calculateItemUnitPrice({
    matSet: set,
    edgeColor: { id: edge.id },
    badge: badge && bdg ? { id: bdg.id } : null,
  });

  const add = () => {
    addItem({ modelId: model.id, brandName: brand.name, modelName: model.name, year, matSet: set, matSetLabel: ms.label, color, edgeColor: edge, badge: badge && bdg ? bdg : undefined, quantity: 1 });
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-xs text-text-dim">
            <Link href="/catalog" className="hover:text-gold transition-colors">Каталог</Link><span className="mx-2 text-border">/</span>
            <Link href={`/catalog/${brand.slug}`} className="hover:text-gold transition-colors">{brand.name}</Link><span className="mx-2 text-border">/</span>
            <span className="text-text">{model.name}</span>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Dynamic mat preview */}
            <div className="aspect-[4/3] glass-card rounded-xl relative overflow-hidden p-6 lg:p-8">
              <MatPreview color={color} edgeColor={edge} showBadge={badge} />
              <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold">Превью</div>
            </div>

            {/* Color swatches */}
            <div className="flex gap-3">
              <div className="glass-card rounded-lg px-4 py-3 flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-md border border-border shrink-0" style={{ backgroundColor: color.hex }} />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-text-faint">Коврик</div>
                  <div className="text-xs text-text truncate">{color.name}</div>
                </div>
              </div>
              <div className="glass-card rounded-lg px-4 py-3 flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-md border border-border shrink-0" style={{ backgroundColor: edge.hex }} />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-text-faint">Окантовка</div>
                  <div className="text-xs text-text truncate">{edge.name}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">{brand.name} {model.name}</h1>
            <p className="text-text-dim text-sm mt-1">{model.bodyType} · EVA коврики</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-gold text-3xl font-bold">{formatPrice(unitPrice)}</span>
              <span className="text-text-faint text-xs">от {formatPrice(MAT_SET_PRICE.cargo)}</span>
            </div>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="section-label text-[10px] mb-3">1 — Год</h3>
                <div className="flex flex-wrap gap-2">
                  {[...model.years].sort((a,b)=>b-a).map((y) => (
                    <button key={y} onClick={() => setYear(y)} className={`px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${year===y ? "bg-gradient-to-r from-gold to-gold-light text-bg font-medium shadow-[0_2px_12px_rgba(212,165,74,0.3)]" : "glass-card text-text-dim hover:text-gold hover:border-gold/30"}`}>{y}</button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="section-label text-[10px] mb-3">2 — Комплект</h3>
                <div className="grid grid-cols-2 gap-3">
                  {matSets.map((s) => (
                    <button key={s.type} onClick={() => setSet(s.type)} className={`p-4 text-left rounded-xl transition-all duration-200 ${set===s.type ? "border-2 border-gold bg-gold-glow" : "glass-card glow-hover"}`}>
                      <div className={`text-sm font-medium ${set===s.type ? "text-gold" : "text-text"}`}>{s.label}</div>
                      <div className="text-xs text-text-dim mt-1">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="section-label text-[10px] mb-3">3 — Цвет: <span className="normal-case text-text">{color.name}</span></h3>
                <div className="flex gap-3">
                  {evaColors.map((c) => <button key={c.id} onClick={() => setColor(c)} className={`w-11 h-11 rounded-full transition-all duration-200 ${color.id===c.id ? "ring-2 ring-gold ring-offset-2 ring-offset-bg scale-110 shadow-[0_0_12px_rgba(212,165,74,0.2)]" : "ring-1 ring-border hover:ring-gold/40"}`} style={{backgroundColor:c.hex}} />)}
                </div>
              </div>
              <div>
                <h3 className="section-label text-[10px] mb-3">4 — Окантовка: <span className="normal-case text-text">{edge.name}</span></h3>
                <div className="flex gap-3">
                  {edgeColors.map((c) => <button key={c.id} onClick={() => setEdge(c)} className={`w-10 h-10 rounded-full transition-all duration-200 ${edge.id===c.id ? "ring-2 ring-gold ring-offset-2 ring-offset-bg scale-110" : "ring-1 ring-border hover:ring-gold/40"}`} style={{backgroundColor:c.hex}} />)}
                </div>
              </div>
              {bdg && (
                <div>
                  <h3 className="section-label text-[10px] mb-3">5 — Шильдик</h3>
                  <label className="flex items-center gap-4 cursor-pointer glass-card glow-hover rounded-xl p-4">
                    <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} className="w-4 h-4 text-gold focus:ring-gold accent-[#D4A54A] rounded" />
                    <div><span className="text-text text-sm font-medium">Шильдик {brand.name}</span><p className="text-text-dim text-xs mt-0.5">Металлический логотип</p></div>
                  </label>
                </div>
              )}
              <button onClick={add} className={`w-full py-4 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${added ? "bg-success text-bg" : "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.4)]"}`}>
                {added ? "✓ Добавлено!" : `Добавить в корзину — ${formatPrice(unitPrice)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
