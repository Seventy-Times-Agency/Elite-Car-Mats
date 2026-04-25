import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-setup";
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

/**
 * Idempotent seed of the catalog (brands, models, products, colors, badges)
 * from src/data/mock.ts into the live database.
 *
 * Required so OrderItem foreign keys (productId, colorId, edgeColorId,
 * badgeId) resolve when checkout runs. Upsert-only — repeat hits update
 * existing rows in place rather than duplicating.
 *
 * Reviews are intentionally NOT seeded — by product decision, only real
 * customer feedback lives in that table.
 *
 * Not guarded by the admin cookie on purpose: if the admin panel is broken
 * because of a missing seed we still need to be able to fix it. The
 * operations are pure upserts of already-public catalog data.
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
}

async function seedAll(): Promise<SeedSummary> {
  // Make sure schema is in place first.
  await ensureSchema();

  const summary: SeedSummary = {
    brands: 0,
    models: 0,
    modelYears: 0,
    products: 0,
    evaColors: 0,
    edgeColors: 0,
    badges: 0,
  };

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, logo: b.logo ?? null },
      create: { id: b.slug, name: b.name, slug: b.slug, logo: b.logo ?? null },
    });
    summary.brands++;
  }

  for (const m of mockModels) {
    const modelId = `${m.brandId}-${m.slug}`;
    await prisma.model.upsert({
      where: { brandId_slug: { brandId: m.brandId, slug: m.slug } },
      update: { name: m.name, bodyType: m.bodyType },
      create: {
        id: modelId,
        name: m.name,
        slug: m.slug,
        bodyType: m.bodyType,
        brandId: m.brandId,
      },
    });
    summary.models++;

    for (const year of m.years) {
      await prisma.modelYear.upsert({
        where: { modelId_year: { modelId, year } },
        update: {},
        create: { id: `${modelId}-${year}`, modelId, year },
      });
      summary.modelYears++;
    }

    for (const set of matSets) {
      const enumVal = matSetToEnum[set.type];
      await prisma.product.upsert({
        where: { modelId_matSet: { modelId, matSet: enumVal } },
        update: { price: MAT_SET_PRICE[set.type] },
        create: {
          id: `${modelId}-${set.type}`,
          modelId,
          matSet: enumVal,
          price: MAT_SET_PRICE[set.type],
          images: [],
        },
      });
      summary.products++;
    }
  }

  for (let i = 0; i < evaColors.length; i++) {
    const c = evaColors[i];
    await prisma.evaColor.upsert({
      where: { id: c.id },
      update: { name: c.name, hex: c.hex, sortOrder: i },
      create: { id: c.id, name: c.name, hex: c.hex, sortOrder: i },
    });
    summary.evaColors++;
  }

  for (let i = 0; i < edgeColors.length; i++) {
    const c = edgeColors[i];
    await prisma.edgeColor.upsert({
      where: { id: c.id },
      update: { name: c.name, hex: c.hex, sortOrder: i },
      create: { id: c.id, name: c.name, hex: c.hex, sortOrder: i },
    });
    summary.edgeColors++;
  }

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { id: b.id },
      update: { brandName: b.brandName },
      create: { id: b.id, brandName: b.brandName },
    });
    summary.badges++;
  }

  return summary;
}

export async function GET() {
  try {
    const summary = await seedAll();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[seed] fatal:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
