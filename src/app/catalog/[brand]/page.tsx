"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { brands, mockModels, categoryLabels } from "@/data/mock";
import { VehicleCategory } from "@/types";

const CATEGORY_ORDER: VehicleCategory[] = ["car", "suv", "truck"];

export default function BrandPage() {
  const params = useParams();
  const brand = brands.find((b) => b.slug === params.brand);
  const [filter, setFilter] = useState<VehicleCategory | "all">("all");

  const models = useMemo(
    () => (brand ? mockModels.filter((m) => m.brandId === brand.id) : []),
    [brand]
  );

  const availableCategories = useMemo(() => {
    const set = new Set(models.map((m) => m.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [models]);

  if (!brand) return <div className="py-20 text-center"><h1 className="text-xl font-bold">Не найдено</h1></div>;

  const visibleModels = filter === "all" ? models : models.filter((m) => m.category === filter);
  const showFilter = availableCategories.length > 1;

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-10 text-xs text-text-dim">
          <Link href="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-text">{brand.name}</span>
        </nav>
        <div className="flex items-center gap-4 mb-10">
          {brand.logo && <div className="w-16 h-12 relative shrink-0"><Image src={brand.logo} alt={brand.name} fill className="object-contain" sizes="64px" /></div>}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">Коврики для <span className="text-gold">{brand.name}</span></h1>
            <p className="mt-1 text-text-dim text-sm">Выберите модель</p>
          </div>
        </div>

        {showFilter && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${filter === "all" ? "bg-gradient-to-r from-gold to-gold-light text-bg font-medium shadow-[0_2px_12px_rgba(212,165,74,0.3)]" : "glass-card text-text-dim hover:text-gold hover:border-gold/30"}`}
            >
              Все ({models.length})
            </button>
            {availableCategories.map((c) => {
              const count = models.filter((m) => m.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${filter === c ? "bg-gradient-to-r from-gold to-gold-light text-bg font-medium shadow-[0_2px_12px_rgba(212,165,74,0.3)]" : "glass-card text-text-dim hover:text-gold hover:border-gold/30"}`}
                >
                  {categoryLabels[c]} ({count})
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleModels.map((m) => {
            const y = m.years[m.years.length - 1];
            return (
              <Link key={m.id} href={`/catalog/${brand.slug}/${m.slug}`} className="group glass-card glow-hover rounded-xl p-6 flex flex-col justify-between min-h-[140px]">
                <div>
                  <h3 className="text-base font-semibold group-hover:text-gold transition-colors duration-300">{m.name}</h3>
                  <p className="text-text-dim text-xs mt-1.5">{m.bodyType}</p>
                </div>
                <p className="text-text-faint text-[11px] tracking-wider mt-4">{m.years[0]}–{y}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
