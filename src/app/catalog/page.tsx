import { brands } from "@/data/mock";
import { CatalogClient } from "./CatalogClient";

export default function CatalogPage() {
  const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="py-14 lg:py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">Каталог</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">Выберите марку</h1>
          <p className="mt-3 text-text-dim text-sm">
            {brands.length} брендов · {brands.reduce((s, b) => s + b.modelsCount, 0)} моделей
          </p>
        </div>
        <CatalogClient brands={sorted} />
      </div>
    </div>
  );
}
