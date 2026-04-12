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
    description: `EVA коврики для всех моделей ${brand.name}. Индивидуальная подгонка.`,
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand: brandSlug } = await params;
  const brand = brands.find((b) => b.slug === brandSlug);
  if (!brand) notFound();

  const models = mockModels.filter((m) => m.brandId === brand.id);

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center gap-2 text-brand-text-muted">
            <li>
              <Link href="/catalog" className="hover:text-brand-gold transition-colors">
                Каталог
              </Link>
            </li>
            <li>/</li>
            <li className="text-brand-gold">{brand.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-white">
            Коврики для{" "}
            <span className="text-gradient-gold">{brand.name}</span>
          </h1>
          <p className="mt-4 text-brand-text-muted text-lg">
            Выберите модель вашего {brand.name}
          </p>
        </div>

        {/* Models */}
        {models.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Link
                key={model.id}
                href={`/catalog/${brand.slug}/${model.slug}`}
                className="group bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6 hover:border-brand-gold/40 transition-all duration-300"
              >
                {/* Placeholder image */}
                <div className="aspect-video bg-brand-gray/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-gold/5 transition-colors">
                  <svg
                    className="w-16 h-16 text-brand-gray-light group-hover:text-brand-gold/30 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-brand-white group-hover:text-brand-gold transition-colors">
                  {brand.name} {model.name}
                </h3>
                <p className="text-brand-text-muted text-sm mt-1">
                  {model.bodyType} &middot; {model.years[0]}&ndash;
                  {model.years[model.years.length - 1]}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-brand-text-muted text-lg">
              Модели для {brand.name} скоро появятся
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 mt-4 text-brand-gold hover:text-brand-gold-light transition-colors text-sm"
            >
              Свяжитесь с нами для индивидуального заказа
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
