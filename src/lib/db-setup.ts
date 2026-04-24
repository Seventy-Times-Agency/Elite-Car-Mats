import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * Idempotent schema migrations that bring an older database up to the
 * current Prisma schema. Talks to Neon over its HTTP SQL endpoint
 * directly (not through Prisma) so we don't depend on the adapter's
 * handling of DDL, dollar-quoted blocks, etc.
 *
 * Cached one-shot: the first admin login or public DB write per cold
 * start triggers the run; every subsequent caller awaits the same
 * Promise and the actual SQL only executes once.
 */

let done: Promise<void> | null = null;

type NeonSql = ReturnType<typeof neon<false, false>>;

async function exec(sql: NeonSql, label: string, stmt: string) {
  try {
    await sql.query(stmt);
    console.log(`[db-setup] ✓ ${label}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[db-setup] ✗ ${label}: ${msg}`);
  }
}

async function run(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[db-setup] DATABASE_URL missing, skipping");
    return;
  }
  const sql = neon(url) as NeonSql;

  // Order — Stripe integration columns
  await exec(sql, "order.stripeSessionId", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT`);
  await exec(sql, "order.stripeSessionId unique", `CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripeSessionId_key" ON "Order"("stripeSessionId")`);
  await exec(sql, "order.stripePaymentIntentId", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT`);
  await exec(sql, "order.paidAt", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3)`);

  // PromoCode — new fields
  await exec(sql, "promo.description", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "description" TEXT`);
  await exec(sql, "promo.maxUses", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER`);
  await exec(sql, "promo.usedCount", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0`);
  await exec(sql, "promo.minOrder", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "minOrder" DECIMAL(10,2)`);

  // CustomOrderStatus enum — check existence first to avoid duplicate-object errors
  try {
    const rows = (await sql.query(
      `SELECT 1 AS "e" FROM pg_type WHERE typname = 'CustomOrderStatus' LIMIT 1`,
    )) as Array<{ e: number }>;
    if (rows.length === 0) {
      await exec(
        sql,
        "enum CustomOrderStatus",
        `CREATE TYPE "CustomOrderStatus" AS ENUM ('NEW','CONTACTED','QUOTED','CONVERTED','CLOSED')`,
      );
    } else {
      console.log("[db-setup] ✓ enum CustomOrderStatus (exists)");
    }
  } catch (err) {
    console.warn(
      "[db-setup] ✗ enum CustomOrderStatus check:",
      err instanceof Error ? err.message : err,
    );
  }

  // CustomOrderRequest table
  await exec(
    sql,
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
      done = null; // allow next caller to retry
    });
  }
  return done;
}
