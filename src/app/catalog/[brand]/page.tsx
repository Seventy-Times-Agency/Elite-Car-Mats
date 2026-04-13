"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { brands, mockModels, carImage } from "@/data/mock";

export default function BrandPage() {
  const params = useParams();
  const brandSlug = params.brand as string;
  const brand = brands.find((b) => b.slug === brandSlug);

  if (!brand) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Марка не найдена</h1>
        <Link href="/catalog" className="mt-3 inline-block text-gold text-sm">Каталог</Link>
      </div>
    );
  }

  const models = mockModels.filter((m) => m.brandId === brand.id);

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-10 text-xs text-light-text">
          <Link href="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{brand.name}</span>
        </nav>

        <div className="flex items-center gap-4 mb-12">
          {brand.logo && (
            <div className="w-16 h-12 relative shrink-0">
              <Image src={brand.logo} alt={brand.name} fill className="object-contain" sizes="64px" />
            </div>
          )}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Коврики для {brand.name}</h1>
            <p className="mt-1 text-text-secondary text-sm">Выберите модель</p>
          </div>
        </div>

        {models.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => {
              const latestYear = model.years[model.years.length - 1];
              return (
                <Link
                  key={model.id}
                  href={`/catalog/${brand.slug}/${model.slug}`}
                  className="group block bg-light border border-light-border hover:border-gold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(201,168,76,0.08)] overflow-hidden"
                >
                  {/* Car image */}
                  <div className="aspect-[16/10] bg-gradient-to-b from-light-soft to-light-card relative overflow-hidden">
                    <Image
                      src={carImage(brand.name, model.name, latestYear)}
                      alt={`${brand.name} ${model.name}`}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-gold transition-colors duration-300">
                      {brand.name} {model.name}
                    </h3>
                    <p className="text-light-text text-xs mt-1">
                      {model.bodyType} &middot; {model.years[0]}&ndash;{latestYear}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-text-secondary">Модели для {brand.name} скоро появятся</p>
            <Link href="/contacts" className="mt-3 inline-block text-gold text-sm">Индивидуальный заказ &rarr;</Link>
          </div>
        )}
      </div>
    </div>
  );
}
