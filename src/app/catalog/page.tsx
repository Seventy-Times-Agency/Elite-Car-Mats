"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { brands } from "@/data/mock";

export default function CatalogPage() {
  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="section-label">Каталог</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">
            Выберите марку
          </h1>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.025 }}
            >
              <Link
                href={`/catalog/${brand.slug}`}
                className="group block bg-light border border-light-border hover:border-gold p-5 text-center transition-all duration-300 hover:shadow-[0_4px_20px_rgba(201,168,76,0.08)]"
              >
                {brand.logo ? (
                  <div className="w-16 h-12 mx-auto relative">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-12 mx-auto flex items-center justify-center text-light-text group-hover:text-gold text-xl font-bold transition-colors">
                    {brand.name.charAt(0)}
                  </div>
                )}
                <h3 className="mt-3 text-text-primary font-medium text-sm group-hover:text-gold transition-colors duration-300">
                  {brand.name}
                </h3>
                <p className="text-light-text text-xs mt-1">{brand.modelsCount} моделей</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
