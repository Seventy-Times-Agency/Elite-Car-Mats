"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { brands, mockModels } from "@/data/mock";

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
    <div className="py-16 lg:py-24 bg-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-10 text-xs text-light-text">
          <Link href="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{brand.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">
            Коврики для <span className="text-gold">{brand.name}</span>
          </h1>
          <p className="mt-3 text-text-secondary">Выберите модель</p>
        </motion.div>

        {models.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href={`/catalog/${brand.slug}/${model.slug}`}
                  className="group block border border-light-border hover:border-gold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(201,168,76,0.08)]"
                >
                  <div className="aspect-video bg-light-soft flex items-center justify-center">
                    <span className="text-3xl font-bold text-light-border group-hover:text-gold/20 transition-colors duration-300">
                      {model.name}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-gold transition-colors duration-300">
                      {brand.name} {model.name}
                    </h3>
                    <p className="text-light-text text-xs mt-1">
                      {model.bodyType} &middot; {model.years[0]}&ndash;{model.years[model.years.length - 1]}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
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
