import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  brands as codeBrands,
  mockModels as codeModels,
} from "@/data/catalog";
import type { Brand, CarModel, VehicleCategory } from "@/types";

const VALID_CATEGORIES: ReadonlySet<VehicleCategory> = new Set([
  "car",
  "suv",
  "truck",
  "commercial",
]);

function asCategory(s: string): VehicleCategory {
  return VALID_CATEGORIES.has(s as VehicleCategory)
    ? (s as VehicleCategory)
    : "car";
}

function parseYears(s: string): number[] {
  return s
    .split(",")
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n >= 1900 && n <= 2100)
    .sort((a, b) => a - b);
}

export interface MergedCatalog {
  brands: Brand[];
  models: CarModel[];
  /** Set of brand ids whose row came from the DB (vs code). */
  customBrandIds: Set<string>;
  /** Set of model ids whose row came from the DB (vs code). */
  customModelIds: Set<string>;
}

/**
 * Merge the code-based catalog (~60 brands, ~700 models in
 * src/data/catalog/) with admin-added rows from CustomBrand /
 * CustomModel. Code is the source of truth — any custom row whose
 * slug clashes with a code row is dropped from the merge so the
 * existing /catalog/<brand> URL keeps resolving to the code row.
 *
 * Database failures fall through to code-only — public catalog never
 * blocks on Neon being slow.
 */
export async function getMergedCatalog(): Promise<MergedCatalog> {
  const customBrandIds = new Set<string>();
  const customModelIds = new Set<string>();

  let dbBrands: Brand[] = [];
  let dbModels: CarModel[] = [];

  try {
    const [cBrands, cModels] = await Promise.all([
      prisma.customBrand.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          logo: true,
          popularity: true,
          categories: true,
        },
      }),
      prisma.customModel.findMany({
        select: {
          id: true,
          brandId: true,
          slug: true,
          name: true,
          bodyType: true,
          category: true,
          years: true,
        },
      }),
    ]);

    const codeBrandSlugs = new Set(codeBrands.map((b) => b.slug));

    for (const b of cBrands) {
      // Skip slug clashes with code — code wins.
      if (codeBrandSlugs.has(b.slug)) continue;
      const id = `custom:${b.slug}`;
      customBrandIds.add(id);
      dbBrands.push({
        id,
        slug: b.slug,
        name: b.name,
        logo: b.logo ?? undefined,
        modelsCount: 0,
        popularity: b.popularity ?? 999,
        categories: (b.categories ?? []).map(asCategory),
      });
    }

    // Build a quick lookup so models can resolve their parent brand id.
    const customBrandBySlug = new Map(
      dbBrands.map((b) => [b.slug, b] as const),
    );
    const customBrandByDbId = new Map(cBrands.map((b) => [b.id, b] as const));

    for (const m of cModels) {
      const parent = customBrandByDbId.get(m.brandId);
      if (!parent) continue;
      // If the parent was filtered out for slug clash, drop the model too.
      const stillIncluded = customBrandBySlug.get(parent.slug);
      if (!stillIncluded) continue;

      const id = `custom:${parent.slug}-${m.slug}`;
      customModelIds.add(id);
      const cat = asCategory(m.category);
      dbModels.push({
        id,
        brandId: stillIncluded.id,
        brandName: parent.name,
        name: m.name,
        slug: m.slug,
        years: parseYears(m.years),
        bodyType: m.bodyType,
        category: cat,
      });
    }
  } catch (err) {
    console.warn(
      "[catalog-merge] custom rows failed to load, code-only catalog returned:",
      err,
    );
    dbBrands = [];
    dbModels = [];
  }

  // Hydrate modelsCount + (re)compute categories for custom brands so
  // the catalog grid filter behaves identically for code and custom rows.
  for (const b of dbBrands) {
    const myModels = dbModels.filter((m) => m.brandId === b.id);
    b.modelsCount = myModels.length;
    if (!b.categories || b.categories.length === 0) {
      const cats = new Set<VehicleCategory>();
      for (const m of myModels) cats.add(m.category);
      b.categories = Array.from(cats);
    }
  }

  return {
    brands: [...codeBrands, ...dbBrands],
    models: [...codeModels, ...dbModels],
    customBrandIds,
    customModelIds,
  };
}
