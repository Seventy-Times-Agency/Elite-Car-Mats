import Link from "next/link";
import Image from "next/image";
import { brands } from "@/data/mock";

export default function CatalogPage() {
  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Каталог</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Выберите марку</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/catalog/${brand.slug}`}
              className="group block border border-dark-border rounded-lg p-5 text-center hover:border-gold/40 transition-all duration-300">
              {brand.logo ? (
                <div className="w-16 h-12 mx-auto relative">
                  <Image src={brand.logo} alt={brand.name} fill className="object-contain opacity-40 group-hover:opacity-80 transition-opacity duration-300" sizes="64px" />
                </div>
              ) : (
                <div className="w-16 h-12 mx-auto flex items-center justify-center text-text-muted group-hover:text-gold text-xl font-bold transition-colors">{brand.name.charAt(0)}</div>
              )}
              <h3 className="mt-3 text-text-primary font-medium text-sm group-hover:text-gold transition-colors duration-300">{brand.name}</h3>
              <p className="text-text-muted text-xs mt-1">{brand.modelsCount} моделей</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
