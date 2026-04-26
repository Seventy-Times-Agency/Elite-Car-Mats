import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-setup";
import { requireAdminApi } from "@/lib/auth";
import {
  brands,
  mockModels,
  evaColors,
  edgeColors,
  matSets,
  badges,
} from "@/data/mock";
import { MAT_SET_PRICE } from "@/lib/pricing";
import type { MatSetType } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Hobby tier caps serverless functions at 60s; bulk inserts finish well
// inside that, but the explicit ceiling keeps us safe on a cold cache.
export const maxDuration = 60;

/**
 * Idempotent seed of the catalog into the live database. Required so
 * OrderItem foreign keys (productId, colorId, edgeColorId, badgeId)
 * resolve when checkout runs.
 *
 * Uses createMany({ skipDuplicates: true }) — one INSERT per table,
 * sub-second total. Re-running is safe: existing rows are left as-is.
 *
 * Reviews are intentionally NOT seeded — only real customer feedback
 * lives in that table.
 */

const matSetToEnum: Record<MatSetType, "FRONT" | "FULL" | "CARGO" | "FULL_CARGO"> = {
  front: "FRONT",
  full: "FULL",
  cargo: "CARGO",
  "full-cargo": "FULL_CARGO",
};

interface SeedSummary {
  brands: number;
  models: number;
  modelYears: number;
  products: number;
  evaColors: number;
  edgeColors: number;
  badges: number;
  ms: number;
}

async function seedAll(): Promise<SeedSummary> {
  const t0 = Date.now();
  await ensureSchema();

  // Brands
  const brandRows = brands.map((b) => ({
    id: b.slug,
    name: b.name,
    slug: b.slug,
    logo: b.logo ?? null,
  }));
  await prisma.brand.createMany({ data: brandRows, skipDuplicates: true });

  // Models
  const modelRows = mockModels.map((m) => ({
    id: `${m.brandId}-${m.slug}`,
    name: m.name,
    slug: m.slug,
    bodyType: m.bodyType,
    brandId: m.brandId,
  }));
  await prisma.model.createMany({ data: modelRows, skipDuplicates: true });

  // ModelYears — flat-mapped from mockModels[].years
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

  // Products — one row per (model, mat-set)
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

  // EVA colors
  const evaRows = evaColors.map((c, i) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    sortOrder: i,
  }));
  await prisma.evaColor.createMany({ data: evaRows, skipDuplicates: true });

  // Edge colors
  const edgeRows = edgeColors.map((c, i) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    sortOrder: i,
  }));
  await prisma.edgeColor.createMany({ data: edgeRows, skipDuplicates: true });

  // Badges
  const badgeRows = badges.map((b) => ({
    id: b.id,
    brandName: b.brandName,
  }));
  await prisma.badge.createMany({ data: badgeRows, skipDuplicates: true });

  return {
    brands: brandRows.length,
    models: modelRows.length,
    modelYears: modelYearRows.length,
    products: productRows.length,
    evaColors: evaRows.length,
    edgeColors: edgeRows.length,
    badges: badgeRows.length,
    ms: Date.now() - t0,
  };
}

export async function GET(request: Request) {
  if (!(await requireAdminApi(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const summary = await seedAll();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[seed] fatal:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
