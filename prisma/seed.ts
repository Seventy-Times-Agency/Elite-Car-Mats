import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";
import {
  brands,
  mockModels,
  evaColors,
  edgeColors,
  matSets,
  mockReviews,
} from "../src/data/mock";
import { MAT_SET_PRICE } from "../src/lib/pricing";
import { MatSetType } from "../src/types";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const matSetToEnum: Record<MatSetType, "FRONT" | "FULL" | "CARGO" | "FULL_CARGO"> = {
  front: "FRONT",
  full: "FULL",
  cargo: "CARGO",
  "full-cargo": "FULL_CARGO",
};

async function main() {
  console.log("Seeding brands...");
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, logo: b.logo },
      create: { id: b.slug, name: b.name, slug: b.slug, logo: b.logo },
    });
  }

  console.log("Seeding models and years...");
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
    for (const year of m.years) {
      await prisma.modelYear.upsert({
        where: { modelId_year: { modelId, year } },
        update: {},
        create: { id: `${modelId}-${year}`, modelId, year },
      });
    }
  }

  console.log("Seeding products...");
  for (const m of mockModels) {
    const modelId = `${m.brandId}-${m.slug}`;
    for (const set of matSets) {
      await prisma.product.upsert({
        where: {
          modelId_matSet: { modelId, matSet: matSetToEnum[set.type] },
        },
        update: { price: MAT_SET_PRICE[set.type] },
        create: {
          id: `${modelId}-${set.type}`,
          modelId,
          matSet: matSetToEnum[set.type],
          price: MAT_SET_PRICE[set.type],
          images: [],
        },
      });
    }
  }

  console.log("Seeding EVA colors...");
  for (let i = 0; i < evaColors.length; i++) {
    const c = evaColors[i];
    await prisma.evaColor.upsert({
      where: { id: c.id },
      update: { name: c.name, hex: c.hex, sortOrder: i },
      create: { id: c.id, name: c.name, hex: c.hex, sortOrder: i },
    });
  }

  console.log("Seeding edge colors...");
  for (let i = 0; i < edgeColors.length; i++) {
    const c = edgeColors[i];
    await prisma.edgeColor.upsert({
      where: { id: c.id },
      update: { name: c.name, hex: c.hex, sortOrder: i },
      create: { id: c.id, name: c.name, hex: c.hex, sortOrder: i },
    });
  }

  console.log("Seeding badges...");
  for (const b of brands) {
    const id = `badge-${b.slug}`;
    await prisma.badge.upsert({
      where: { id },
      update: { brandName: b.name },
      create: { id, brandName: b.name },
    });
  }

  console.log("Seeding reviews...");
  for (const r of mockReviews) {
    await prisma.review.upsert({
      where: { id: r.id },
      update: {
        customerName: r.customerName,
        carModel: r.carModel,
        text: r.text,
        rating: r.rating,
        approved: true,
      },
      create: {
        id: r.id,
        customerName: r.customerName,
        carModel: r.carModel,
        text: r.text,
        rating: r.rating,
        approved: true,
        createdAt: new Date(r.createdAt),
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
