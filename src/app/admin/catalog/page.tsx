import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { CatalogManager, type BrandRow, type ModelRow } from "./CatalogManager";
import type { BrandOption } from "./ModelManager";
import type { CodeModelRow } from "./CodeCatalogManager";
import { brands as codeBrands, mockModels as codeModels } from "@/data/catalog";
import { codeBrandName } from "@/lib/catalog-brand-ref";
import { getHiddenModelIds } from "@/lib/catalog-visibility";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const [brandRows, modelRows, hiddenSet] = await Promise.all([
    prisma.customBrand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { models: true } } },
    }),
    prisma.customModel.findMany({
      orderBy: [{ brandId: "asc" }, { name: "asc" }],
      include: { brand: { select: { name: true, slug: true } } },
    }),
    getHiddenModelIds(),
  ]);

  const brands: BrandRow[] = brandRows.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    logo: b.logo,
    popularity: b.popularity,
    categories: b.categories,
    modelsCount: b._count.models,
  }));
  const models: ModelRow[] = modelRows.map((m) => ({
    id: m.id,
    // The form's brand select value: CustomBrand cuid or `code:<slug>`.
    brandId: m.brandId ?? `code:${m.codeBrandSlug}`,
    brandName: m.brand?.name ?? codeBrandName(m.codeBrandSlug) ?? "?",
    slug: m.slug,
    name: m.name,
    bodyType: m.bodyType,
    category: m.category,
    years: m.years,
  }));

  // The model form can attach to any brand: the ~60 code brands plus
  // admin-created custom ones.
  const brandOptions: BrandOption[] = [
    ...[...codeBrands]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((b) => ({
        id: `code:${b.slug}`,
        name: b.name,
        group: "code" as const,
      })),
    ...brands.map((b) => ({
      id: b.id,
      name: b.name,
      group: "custom" as const,
    })),
  ];

  const codeModelRows: CodeModelRow[] = codeModels.map((m) => ({
    id: `${m.brandId}-${m.slug}`,
    brandName: m.brandName,
    name: m.name,
    bodyType: m.bodyType,
    yearsLabel:
      m.years.length > 1
        ? `${m.years[0]}–${m.years[m.years.length - 1]}`
        : String(m.years[0] ?? ""),
  }));

  // Pre-compile a lite slug-set so the manager can warn on clashes
  // before round-tripping the API.
  const reservedSlugs = codeBrands.map((b) => b.slug);

  return (
    <AdminShell
      title={t("admin.catalogTitle")}
      subtitle={t("admin.catalogSubtitle")}
    >
      <CatalogManager
        initialBrands={brands}
        initialModels={models}
        reservedBrandSlugs={reservedSlugs}
        brandOptions={brandOptions}
        codeModels={codeModelRows}
        hiddenModelIds={Array.from(hiddenSet)}
      />
    </AdminShell>
  );
}
