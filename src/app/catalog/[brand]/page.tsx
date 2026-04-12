import { Metadata } from "next";
import Link from "next/link";
import { brands, mockModels } from "@/data/mock";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = brands.find((b) => b.slug === brandSlug);
  if (!brand) return { title: "Не найдено" };
  return {
    title: `Коврики для ${brand.name}`,
    description: `EVA коврики для всех моделей ${brand.name}`,
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand: brandSlug } = await params;
  const brand = brands.find((b) => b.slug === brandSlug);
  if (!brand) notFound();

  const models = mockModels.filter((m) => m.brandId === brand.id);

  return (
    <div className="py-12 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-10 text-xs text-brand-gray-400">
          <Link href="/catalog" className="hover:text-brand-gold transition-colors">Каталог</Link>
          <span className="mx-2">/</span>
          <span className="text-brand-black">{brand.name}</span>
        </nav>

        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-black">
            Коврики для {brand.name}
          </h1>
          <p className="mt-3 text-brand-text-secondary">
            Выберите модель
          </p>
        </div>

        {models.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Link
                key={model.id}
                href={`/catalog/${brand.slug}/${model.slug}`}
                className="group border border-brand-gray-200 hover:border-brand-gold transition-all"
              >
                <div className="aspect-video bg-brand-offwhite flex items-center justify-center">
                  <span className="text-4xl font-bold text-brand-gray-200 group-hover:text-brand-gold/30 transition-colors">
                    {model.name.charAt(0)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-brand-black group-hover:text-brand-gold transition-colors">
                    {brand.name} {model.name}
                  </h3>
                  <p className="text-brand-gray-400 text-xs mt-1">
                    {model.bodyType} &middot; {model.years[0]}&ndash;{model.years[model.years.length - 1]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-brand-text-secondary">Модели для {brand.name} скоро появятся</p>
            <Link href="/contacts" className="inline-block mt-4 text-brand-gold hover:text-brand-gold-dark transition-colors text-sm">
              Свяжитесь с нами для индивидуального заказа
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
