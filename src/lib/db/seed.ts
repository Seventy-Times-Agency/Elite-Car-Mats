import "server-only";
import { prisma } from "./prisma";
import {
  brands,
  mockModels,
  evaColors,
  edgeColors,
  matSets,
  badges,
} from "@/data/catalog";
import { getMatSetPrice } from "@/lib/pricing";
import { getVehicleProfile } from "@/lib/vehicle-profile";
import { asCategory, parseYears } from "@/lib/catalog-normalize";
import type { CarModel, MatSetType } from "@/types";

/**
 * Idempotent catalog bootstrap. Populates Brand / Model / ModelYear /
 * Product / EvaColor / EdgeColor / Badge from the code-based catalog and
 * mirrors admin-added CustomBrand / CustomModel rows into the same tables
 * so they can be referenced by an OrderItem.productId FK.
 *
 * Always runs `createMany({ skipDuplicates: true })` for every reference
 * table — never gated behind "is the DB empty?" because that gate left
 * stale databases unable to accept orders for any newly-added colour,
 * model or brand after the initial deploy. Each call is a few sub-second
 * upserts via skipDuplicates, fully idempotent.
 *
 * Cached one-shot per process: first request on a fresh lambda pays for
 * the sync, everything after awaits the same Promise.
 */

const matSetToEnum: Record<MatSetType, "FRONT" | "FULL" | "CARGO" | "FULL_CARGO"> = {
  front: "FRONT",
  full: "FULL",
  cargo: "CARGO",
  "full-cargo": "FULL_CARGO",
};

export interface CatalogSeedSummary {
  ranSeed: boolean;
  brands: number;
  models: number;
  modelYears: number;
  products: number;
  evaColors: number;
  edgeColors: number;
  badges: number;
  customBrands: number;
  customModels: number;
}

/**
 * Pull custom brands/models from the admin DB tables and shape them as
 * CarModel rows so the Product seed below can mirror them into the
 * Brand / Model / Product tables. Returns empty arrays on DB error so
 * a transient blip doesn't block the code-catalog seed.
 */
async function loadCustomCatalog(): Promise<{
  customBrandRows: { id: string; name: string; slug: string; logo: string | null }[];
  customModels: CarModel[];
}> {
  try {
    const [cBrands, cModels] = await Promise.all([
      prisma.customBrand.findMany({
        select: { id: true, slug: true, name: true, logo: true },
      }),
      prisma.customModel.findMany({
        select: {
          id: true,
          brandId: true,
          codeBrandSlug: true,
          slug: true,
          name: true,
          bodyType: true,
          category: true,
          years: true,
        },
      }),
    ]);

    // Code brand slugs win — drop custom rows that clash.
    const codeBrandSlugs = new Set(brands.map((b) => b.slug));
    const codeBrandBySlug = new Map(brands.map((b) => [b.slug, b] as const));
    const brandByDbId = new Map(cBrands.map((b) => [b.id, b] as const));

    const customBrandRows: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
    }[] = [];
    for (const b of cBrands) {
      if (codeBrandSlugs.has(b.slug)) continue;
      customBrandRows.push({
        id: b.slug, // mirror code-catalog convention: id = slug
        name: b.name,
        slug: b.slug,
        logo: b.logo ?? null,
      });
    }
    const allowedBrandSlugs = new Set(customBrandRows.map((b) => b.slug));

    const customModels: CarModel[] = [];
    for (const m of cModels) {
      // Custom model attached to a CODE brand — its Brand row is already
      // seeded from the code catalog, only Model/Product rows are needed.
      if (m.codeBrandSlug) {
        const codeBrand = codeBrandBySlug.get(m.codeBrandSlug);
        if (!codeBrand) continue;
        customModels.push({
          id: `${codeBrand.slug}-${m.slug}`,
          brandId: codeBrand.slug,
          brandName: codeBrand.name,
          name: m.name,
          slug: m.slug,
          years: parseYears(m.years),
          bodyType: m.bodyType,
          category: asCategory(m.category),
        });
        continue;
      }
      if (!m.brandId) continue;
      const parent = brandByDbId.get(m.brandId);
      if (!parent) continue;
      if (!allowedBrandSlugs.has(parent.slug)) continue;
      const bodyType = m.bodyType;
      const category = asCategory(m.category);
      customModels.push({
        id: `${parent.slug}-${m.slug}`,
        brandId: parent.slug,
        brandName: parent.name,
        name: m.name,
        slug: m.slug,
        years: parseYears(m.years),
        bodyType,
        category,
      });
    }

    return { customBrandRows, customModels };
  } catch (err) {
    console.warn("[catalog-seed] custom catalog load failed:", err);
    return { customBrandRows: [], customModels: [] };
  }
}

async function runSeed(): Promise<CatalogSeedSummary> {
  // Pull admin-added custom brands/models alongside the code catalog so a
  // single seed pass mirrors both into the Brand/Model/Product tables.
  // Without this, orders for custom models fail at the OrderItem.productId
  // FK because no Product row exists for them.
  const { customBrandRows, customModels } = await loadCustomCatalog();

  const brandRows = [
    ...brands.map((b) => ({
      id: b.slug,
      name: b.name,
      slug: b.slug,
      logo: b.logo ?? null,
    })),
    ...customBrandRows,
  ];
  await prisma.brand.createMany({ data: brandRows, skipDuplicates: true });

  const allModels: CarModel[] = [...mockModels, ...customModels];
  const modelRows = allModels.map((m) => ({
    id: `${m.brandId}-${m.slug}`,
    name: m.name,
    slug: m.slug,
    bodyType: m.bodyType,
    brandId: m.brandId,
  }));
  await prisma.model.createMany({ data: modelRows, skipDuplicates: true });

  const modelYearRows: { id: string; modelId: string; year: number }[] = [];
  for (const m of allModels) {
    const modelId = `${m.brandId}-${m.slug}`;
    for (const year of m.years) {
      modelYearRows.push({ id: `${modelId}-${year}`, modelId, year });
    }
  }
  await prisma.modelYear.createMany({
    data: modelYearRows,
    skipDuplicates: true,
  });

  const productRows: {
    id: string;
    modelId: string;
    matSet: "FRONT" | "FULL" | "CARGO" | "FULL_CARGO";
    price: number;
    images: string[];
  }[] = [];
  for (const m of allModels) {
    const modelId = `${m.brandId}-${m.slug}`;
    const profile = getVehicleProfile(m);
    for (const set of matSets) {
      productRows.push({
        id: `${modelId}-${set.type}`,
        modelId,
        matSet: matSetToEnum[set.type],
        price: getMatSetPrice(profile, set.type),
        images: [],
      });
    }
  }
  await prisma.product.createMany({
    data: productRows,
    skipDuplicates: true,
  });

  // Colors are upserted (not createMany/skipDuplicates) so a palette
  // change in code — renamed swatch, corrected hex — propagates to the
  // existing DB rows that emails and the admin panel read from. Rows for
  // colors removed from code stay behind as FK targets for old orders.
  const evaRows = evaColors.map((c, i) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    sortOrder: i,
  }));
  await Promise.all(
    evaRows.map((c) =>
      prisma.evaColor.upsert({
        where: { id: c.id },
        create: c,
        update: { name: c.name, hex: c.hex, sortOrder: c.sortOrder },
      }),
    ),
  );

  const edgeRows = edgeColors.map((c, i) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    sortOrder: i,
  }));
  await Promise.all(
    edgeRows.map((c) =>
      prisma.edgeColor.upsert({
        where: { id: c.id },
        create: c,
        update: { name: c.name, hex: c.hex, sortOrder: c.sortOrder },
      }),
    ),
  );

  const badgeRows = badges.map((b) => ({
    id: b.id,
    brandName: b.brandName,
  }));
  await prisma.badge.createMany({ data: badgeRows, skipDuplicates: true });

  return {
    ranSeed: true,
    brands: brandRows.length,
    models: modelRows.length,
    modelYears: modelYearRows.length,
    products: productRows.length,
    evaColors: evaRows.length,
    edgeColors: edgeRows.length,
    badges: badgeRows.length,
    customBrands: customBrandRows.length,
    customModels: customModels.length,
  };
}

/**
 * Mirror ONE admin-created custom brand into the Brand table immediately.
 * Called synchronously from the admin create route — the process-level
 * seed cache (`resetCatalogSeedCache`) only resets in the lambda that
 * served the admin request, so warm instances of /api/orders would
 * otherwise miss the new FK target until they recycle.
 */
export async function mirrorCustomBrandRow(b: {
  slug: string;
  name: string;
  logo?: string | null;
}): Promise<void> {
  // Upsert, not createMany+skipDuplicates: a rename (same slug, new name)
  // must reach the billing mirror too — skipDuplicates is a no-op for an
  // existing id, so the old name would live forever in admin order rows,
  // order pages and emails.
  await prisma.brand.upsert({
    where: { id: b.slug },
    create: { id: b.slug, name: b.name, slug: b.slug, logo: b.logo ?? null },
    update: { name: b.name, logo: b.logo ?? null },
  });
}

/**
 * Mirror ONE admin-created/updated custom model into Brand / Model /
 * ModelYear / Product immediately (same id convention as runSeed), so an
 * order for it can resolve its OrderItem.productId FK on any instance
 * without waiting for a cold-start re-seed.
 */
export async function mirrorCustomModelRow(m: CarModel): Promise<void> {
  const modelId = `${m.brandId}-${m.slug}`;
  // Brand row: create-if-missing only — don't overwrite a code brand's
  // name with the model's denormalized brandName copy.
  await prisma.brand.createMany({
    data: [{ id: m.brandId, name: m.brandName, slug: m.brandId, logo: null }],
    skipDuplicates: true,
  });
  // Model row: upsert so renames/body-type edits (same slug) propagate
  // to the billing mirror — skipDuplicates would keep the stale name in
  // admin order rows and transactional emails forever.
  await prisma.model.upsert({
    where: { id: modelId },
    create: {
      id: modelId,
      name: m.name,
      slug: m.slug,
      bodyType: m.bodyType,
      brandId: m.brandId,
    },
    update: { name: m.name, bodyType: m.bodyType },
  });
  if (m.years.length > 0) {
    await prisma.modelYear.createMany({
      data: m.years.map((year) => ({
        id: `${modelId}-${year}`,
        modelId,
        year,
      })),
      skipDuplicates: true,
    });
  }
  const profile = getVehicleProfile(m);
  await prisma.product.createMany({
    data: matSets.map((set) => ({
      id: `${modelId}-${set.type}`,
      modelId,
      matSet: matSetToEnum[set.type],
      price: getMatSetPrice(profile, set.type),
      images: [] as string[],
    })),
    skipDuplicates: true,
  });
}

let cached: Promise<CatalogSeedSummary> | null = null;

export function ensureCatalogSeed(): Promise<CatalogSeedSummary> {
  if (!cached) {
    cached = (async (): Promise<CatalogSeedSummary> => {
      try {
        // Always run — createMany({skipDuplicates:true}) makes it a no-op
        // for existing rows, and lets newly-added colours/brands/models
        // from a redeploy reach the DB without a manual admin step.
        const summary = await runSeed();
        console.log(
          `[catalog-seed] sync ok: brands=${summary.brands} models=${summary.models} ` +
            `products=${summary.products} eva=${summary.evaColors} edge=${summary.edgeColors} ` +
            `badges=${summary.badges} customBrands=${summary.customBrands} ` +
            `customModels=${summary.customModels}`,
        );
        return summary;
      } catch (err) {
        cached = null;
        throw err;
      }
    })();
  }
  return cached;
}

/**
 * Reset the one-shot cache. Called after admin mutations on custom
 * brand/model rows so the next /api/orders cold-start re-mirrors them
 * into Brand/Model/Product. Cheap — next call is one createMany burst.
 */
export function resetCatalogSeedCache(): void {
  cached = null;
}
