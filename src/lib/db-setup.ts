import "server-only";
import { prisma } from "./prisma";

/**
 * Idempotent schema migrations that bring an older database up to the
 * current Prisma schema. Uses prisma.$executeRawUnsafe which talks
 * to Neon through the WebSocket adapter — the same transport the rest
 * of the app uses for writes, so if writes work, DDL works too.
 *
 * Cached one-shot: the first admin login or public DB write per cold
 * start triggers the run; every subsequent caller awaits the same
 * Promise and the actual SQL only executes once.
 */

let done: Promise<void> | null = null;

async function exec(label: string, stmt: string) {
  try {
    await prisma.$executeRawUnsafe(stmt);
    console.log(`[db-setup] ✓ ${label}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[db-setup] ✗ ${label} :: ${msg}`);
  }
}

async function typeExists(name: string): Promise<boolean> {
  try {
    const rows = await prisma.$queryRawUnsafe<{ ok: number }[]>(
      `SELECT 1 AS ok FROM pg_type WHERE typname = '${name}' LIMIT 1`,
    );
    return Array.isArray(rows) && rows.length > 0;
  } catch (err) {
    console.warn(
      `[db-setup] type-exists check failed for ${name}:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

async function run(): Promise<void> {
  // Order — Stripe integration columns
  await exec("order.stripeSessionId", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT`);
  await exec("order.stripeSessionId unique", `CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripeSessionId_key" ON "Order"("stripeSessionId")`);
  await exec("order.stripePaymentIntentId", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT`);
  await exec("order.paidAt", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3)`);

  // PromoCode — new fields
  await exec("promo.description", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "description" TEXT`);
  await exec("promo.maxUses", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER`);
  await exec("promo.usedCount", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0`);
  await exec("promo.minOrder", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "minOrder" DECIMAL(10,2)`);

  // CustomOrderStatus enum
  if (!(await typeExists("CustomOrderStatus"))) {
    await exec(
      "enum CustomOrderStatus",
      `CREATE TYPE "CustomOrderStatus" AS ENUM ('NEW','CONTACTED','QUOTED','CONVERTED','CLOSED')`,
    );
  } else {
    console.log("[db-setup] ✓ enum CustomOrderStatus (exists)");
  }

  // CustomOrderRequest table
  await exec(
    "table CustomOrderRequest",
    `CREATE TABLE IF NOT EXISTS "CustomOrderRequest" (
       "id" TEXT PRIMARY KEY,
       "name" TEXT NOT NULL,
       "email" TEXT NOT NULL,
       "phone" TEXT NOT NULL,
       "make" TEXT NOT NULL,
       "model" TEXT NOT NULL,
       "year" TEXT NOT NULL,
       "bodyType" TEXT,
       "matSet" TEXT,
       "notes" TEXT,
       "locale" TEXT,
       "status" "CustomOrderStatus" NOT NULL DEFAULT 'NEW',
       "adminNotes" TEXT,
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
     )`,
  );

  console.log("[db-setup] schema sync complete");
}

export function ensureSchema(): Promise<void> {
  if (!done) {
    done = run().catch((err) => {
      console.error("[db-setup] fatal:", err);
      done = null;
    });
  }
  return done;
}
