import { brands } from "@/data/mock";
import { CatalogClient } from "./CatalogClient";
import { getDictionary } from "@/i18n/getDictionary";
import type { Dict } from "@/i18n/dictionary";

export default async function CatalogPage() {
  const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name));
  const { dict, fallback } = await getDictionary();
  const s = (k: string): string => (dict[k] ?? fallback[k]) as string;
  const get = (k: string): Dict[string] | undefined => dict[k] ?? fallback[k];
  const totalModels = brands.reduce((acc, b) => acc + b.modelsCount, 0);
  const statsFn = get("catalog.stats") as
    | ((b: number, m: number) => string)
    | undefined;
  const statsStr = statsFn ? statsFn(brands.length, totalModels) : "";
  return (
    <div className="py-14 lg:py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">{s("catalog.label")}</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">
            {s("catalog.heading")}
          </h1>
          <p className="mt-3 text-text-dim text-sm">{statsStr}</p>
        </div>
        <CatalogClient brands={sorted} />
      </div>
    </div>
  );
}
