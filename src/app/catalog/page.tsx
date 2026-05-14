import { CatalogClient } from "./CatalogClient";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { getMergedCatalogCached } from "@/lib/catalog-merge";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const { brands } = await getMergedCatalogCached();
  // Server-side default order is popularity (lower rank = more popular).
  // The client component lets the user flip to alphabetical.
  const ranked = [...brands].sort((a, b) => {
    const pa = a.popularity ?? 999;
    const pb = b.popularity ?? 999;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const totalModels = brands.reduce((acc, b) => acc + b.modelsCount, 0);
  const statsStr = t("catalog.stats", {
    brands: brands.length,
    models: totalModels,
  });
  return (
    <div className="py-14 lg:py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">{t("catalog.label")}</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">
            {t("catalog.heading")}
          </h1>
          <p className="mt-3 text-text-dim text-sm">{statsStr}</p>
        </div>
        <CatalogClient brands={ranked} />
      </div>
    </div>
  );
}
