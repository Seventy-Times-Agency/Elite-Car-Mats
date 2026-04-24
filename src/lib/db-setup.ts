import "server-only";
import { prisma } from "./prisma";

/**
 * Idempotent schema migrations that bring an older database up to the
 * current Prisma schema. Each statement uses IF NOT EXISTS / DO $$ blocks
 * so re-running them is safe.
 *
 * Runs once per cold start. Called from `requireAdmin()` so the first
 * person who logs into the admin panel triggers it transparently — no
 * terminal work required.
 */

const STATEMENTS: string[] = [
  // Order — Stripe integration columns
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripeSessionId_key" ON "Order"("stripeSessionId")`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3)`,

  // PromoCode — new fields
  `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "description" TEXT`,
  `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER`,
  `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "minOrder" DECIMAL(10,2)`,

  // CustomOrderRequest — new enum + table
  `DO $$ BEGIN
     CREATE TYPE "CustomOrderStatus" AS ENUM ('NEW','CONTACTED','QUOTED','CONVERTED','CLOSED');
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
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
];

let done: Promise<void> | null = null;

async function run(): Promise<void> {
  for (const stmt of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      console.warn("[db-setup] statement failed:", err);
    }
  }
  console.log("[db-setup] schema sync complete");
}

/**
 * Cached one-shot. Subsequent calls return the same Promise and no-op.
 * Safe to call from multiple routes — only executes once per process.
 */
export function ensureSchema(): Promise<void> {
  if (!done) {
    done = run().catch((err) => {
      console.error("[db-setup] fatal:", err);
      // Reset so the next call can retry if this one crashed outright.
      done = null;
    });
  }
  return done;
}
