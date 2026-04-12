import { Metadata } from "next";
import Link from "next/link";
import { brands } from "@/data/mock";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Выберите марку автомобиля для подбора EVA ковриков",
};

export default function CatalogPage() {
  return (
    <div className="py-12 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-3">
            Каталог
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-black">
            Выберите марку автомобиля
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalog/${brand.slug}`}
              className="group border border-brand-gray-200 hover:border-brand-gold p-6 text-center transition-all"
            >
              <div className="w-14 h-14 mx-auto bg-brand-offwhite rounded-full flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors">
                <span className="text-brand-gray-400 group-hover:text-brand-gold text-lg font-bold transition-colors">
                  {brand.name.charAt(0)}
                </span>
              </div>
              <h3 className="mt-3 text-brand-black font-medium text-sm group-hover:text-brand-gold transition-colors">
                {brand.name}
              </h3>
              <p className="text-brand-gray-400 text-xs mt-1">
                {brand.modelsCount} моделей
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
