import { Metadata } from "next";
import Link from "next/link";
import { brands } from "@/data/mock";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Выберите марку автомобиля для подбора EVA ковриков",
};

export default function CatalogPage() {
  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-white">
            Каталог <span className="text-gradient-gold">автомобилей</span>
          </h1>
          <p className="mt-4 text-brand-text-muted text-lg">
            Выберите марку для подбора ковриков
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalog/${brand.slug}`}
              className="group bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6 text-center hover:border-brand-gold/40 hover:bg-brand-gray/20 transition-all duration-300"
            >
              {/* Placeholder for brand logo */}
              <div className="w-16 h-16 mx-auto bg-brand-gray/30 rounded-full flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors">
                <span className="text-brand-text-muted group-hover:text-brand-gold text-xl font-bold transition-colors">
                  {brand.name.charAt(0)}
                </span>
              </div>
              <h3 className="mt-3 text-brand-text font-medium text-sm group-hover:text-brand-gold transition-colors">
                {brand.name}
              </h3>
              <p className="text-brand-text-muted text-xs mt-1">
                {brand.modelsCount} моделей
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
