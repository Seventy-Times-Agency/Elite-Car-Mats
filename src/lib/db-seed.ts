import "server-only";
import { prisma } from "./prisma";
import {
  brands,
  mockModels,
  evaColors,
  edgeColors,
  matSets,
  badges,
} from "@/data/mock";
import { MAT_SET_PRICE } from "./pricing";
import type { MatSetType } from "@/types";

/**
 * Idempotent catalog bootstrap that populates Brand / Model / ModelYear /
 * Product / EvaColor / EdgeColor / Badge from mock.ts when (and only when)
 * any of those tables is empty.
 *
 * Called from /api/orders, /api/admin/seed and any other path that assumes
 * the catalog is in place — so even if the operator forgot to run the seed
 * endpoint manually, the first incoming order self-heals the DB.
 *
 * Cached one-shot per process, like ensureSchema. Use forceCatalogSeed()
 * if you need to re-run.
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
}

async function isCatalogEmpty(): Promise<boolean> {
  const [brandCount, edgeCount, evaCount] = await Promise.all([
    prisma.brand.count(),
    prisma.edgeColor.count(),
    prisma.evaColor.count(),
  ]);
  return brandCount === 0 || edgeCount === 0 || evaCount === 0;
}

async function runSeed(): Promise<CatalogSeedSummary> {
  const brandRows = brands.map((b) => ({
    id: b.slug,
    name: b.name,
    slug: b.slug,
    logo: b.logo ?? null,
  }));
  await prisma.brand.createMany({ data: brandRows, skipDuplicates: true });

  const modelRows = mockModels.map((m) => ({
    id: `${m.brandId}-${m.slug}`,
    name: m.name,
    slug: m.slug,
    bodyType: m.bodyType,
    brandId: m.brandId,
  }));
  await prisma.model.createMany({ data: modelRows, skipDuplicates: true });

  const modelYearRows: { id: string; modelId: string; year: number }[] = [];
  for (const m of mockModels) {
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
  for (const m of mockModels) {
    const modelId = `${m.brandId}-${m.slug}`;
    for (const set of matSets) {
      productRows.push({
        id: `${modelId}-${set.type}`,
        modelId,
        matSet: matSetToEnum[set.type],
        price: MAT_SET_PRICE[set.type],
        images: [],
      });
    }
  }
  await prisma.product.createMany({
    data: productRows,
    skipDuplicates: true,
  });

  const evaRows = evaColors.map((c, i) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    sortOrder: i,
  }));
  await prisma.evaColor.createMany({ data: evaRows, skipDuplicates: true });

  const edgeRows = edgeColors.map((c, i) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    sortOrder: i,
  }));
  await prisma.edgeColor.createMany({ data: edgeRows, skipDuplicates: true });

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
  };
}

let cached: Promise<CatalogSeedSummary> | null = null;

export function ensureCatalogSeed(): Promise<CatalogSeedSummary> {
  if (!cached) {
    cached = (async (): Promise<CatalogSeedSummary> => {
      try {
        if (await isCatalogEmpty()) {
          console.log("[catalog-seed] catalog empty, seeding...");
          return await runSeed();
        }
        return {
          ranSeed: false,
          brands: 0,
          models: 0,
          modelYears: 0,
          products: 0,
          evaColors: 0,
          edgeColors: 0,
          badges: 0,
        };
      } catch (err) {
        cached = null;
        throw err;
      }
    })();
  }
  return cached;
}

export function forceCatalogSeed(): Promise<CatalogSeedSummary> {
  cached = null;
  return runSeed().then((s) => ({ ...s, ranSeed: true }));
}

export function resetCatalogSeedCache(): void {
  cached = null;
}
