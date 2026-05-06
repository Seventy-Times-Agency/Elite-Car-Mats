import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { CatalogManager, type BrandRow, type ModelRow } from "./CatalogManager";
import { brands as codeBrands } from "@/data/catalog";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const [brandRows, modelRows] = await Promise.all([
    prisma.customBrand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { models: true } } },
    }),
    prisma.customModel.findMany({
      orderBy: [{ brandId: "asc" }, { name: "asc" }],
      include: { brand: { select: { name: true, slug: true } } },
    }),
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
    brandId: m.brandId,
    brandName: m.brand.name,
    slug: m.slug,
    name: m.name,
    bodyType: m.bodyType,
    category: m.category,
    years: m.years,
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
      />
    </AdminShell>
  );
}
