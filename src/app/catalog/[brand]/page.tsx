"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { brands, mockModels } from "@/data/mock";
import { CarImage } from "@/components/product/CarImage";

export default function BrandPage() {
  const params = useParams();
  const brand = brands.find((b) => b.slug === params.brand);
  if (!brand) return <div className="py-20 text-center"><h1 className="text-xl font-bold">Не найдено</h1></div>;
  const models = mockModels.filter((m) => m.brandId === brand.id);

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-10 text-xs text-text-dim">
          <Link href="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-text">{brand.name}</span>
        </nav>
        <div className="flex items-center gap-4 mb-12">
          {brand.logo && <div className="w-16 h-12 relative shrink-0"><Image src={brand.logo} alt={brand.name} fill className="object-contain" sizes="64px" /></div>}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">Коврики для <span className="text-gold">{brand.name}</span></h1>
            <p className="mt-1 text-text-dim text-sm">Выберите модель</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map((m) => {
            const y = m.years[m.years.length - 1];
            return (
              <Link key={m.id} href={`/catalog/${brand.slug}/${m.slug}`} className="group glass-card glow-hover rounded-xl overflow-hidden">
                <div className="aspect-[16/10] bg-surface-elevated relative overflow-hidden">
                  <CarImage
                    brandId={brand.id} brandSlug={brand.slug} brandName={brand.name}
                    modelId={m.id} modelSlug={m.slug} modelName={m.name} year={y}
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold group-hover:text-gold transition-colors duration-300">{brand.name} {m.name}</h3>
                  <p className="text-text-dim text-xs mt-1">{m.bodyType} · {m.years[0]}–{y}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
