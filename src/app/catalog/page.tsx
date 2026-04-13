import Link from "next/link";
import Image from "next/image";
import { brands } from "@/data/mock";

export default function CatalogPage() {
  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Каталог</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">Выберите марку</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((b) => (
            <Link key={b.id} href={`/catalog/${b.slug}`} className="group glass-card glow-hover rounded-xl p-5 text-center">
              {b.logo ? (
                <div className="w-16 h-12 mx-auto relative"><Image src={b.logo} alt={b.name} fill className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300" sizes="64px" /></div>
              ) : (
                <div className="w-16 h-12 mx-auto flex items-center justify-center text-text-dim group-hover:text-gold text-xl font-bold transition-colors">{b.name.charAt(0)}</div>
              )}
              <h3 className="mt-3 text-text text-sm font-medium group-hover:text-gold transition-colors duration-300">{b.name}</h3>
              <p className="text-text-faint text-xs mt-1">{b.modelsCount} моделей</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
