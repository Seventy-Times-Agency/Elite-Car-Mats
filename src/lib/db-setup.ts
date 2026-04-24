import "server-only";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

/**
 * Idempotent schema migrations that bring an older database up to the
 * current Prisma schema.
 *
 * Opens its own @neondatabase/serverless Pool against the DIRECT
 * (non-pooler) Neon endpoint — PgBouncer (pooler) rejects some DDL,
 * and Prisma's adapter was swallowing the real error text. A direct
 * Pool gives us plain pg-style query semantics plus readable errors.
 *
 * Cached one-shot: the first admin login or public DB write per cold
 * start triggers the run; every subsequent caller awaits the same
 * Promise and the actual SQL only executes once.
 */

export interface MigrationResult {
  label: string;
  ok: boolean;
  error?: string;
}

function connectionUrl(): string | null {
  // Use the URL exactly as configured — Neon's IP allowlist typically only
  // permits the pooler endpoint from Vercel, so rewriting to -pooler-less
  // gets us blocked with 403. The pooler does support DDL.
  return process.env.DATABASE_URL ?? null;
}

async function execAll(): Promise<MigrationResult[]> {
  const url = connectionUrl();
  if (!url) {
    return [{ label: "setup", ok: false, error: "DATABASE_URL not set" }];
  }
  const pool = new Pool({ connectionString: url });
  const results: MigrationResult[] = [];

  const run = async (label: string, stmt: string) => {
    try {
      await pool.query(stmt);
      results.push({ label, ok: true });
      console.log(`[db-setup] ✓ ${label}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ label, ok: false, error: msg });
      console.warn(`[db-setup] ✗ ${label} :: ${msg}`);
    }
  };

  try {
    await run("order.stripeSessionId", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT`);
    await run("order.stripeSessionId unique", `CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripeSessionId_key" ON "Order"("stripeSessionId")`);
    await run("order.stripePaymentIntentId", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT`);
    await run("order.paidAt", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3)`);
    await run("promo.description", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "description" TEXT`);
    await run("promo.maxUses", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER`);
    await run("promo.usedCount", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0`);
    await run("promo.minOrder", `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "minOrder" DECIMAL(10,2)`);

    // Enum — check existence first
    try {
      const check = await pool.query<{ ok: number }>(
        `SELECT 1 AS ok FROM pg_type WHERE typname = 'CustomOrderStatus' LIMIT 1`,
      );
      if (check.rowCount === 0) {
        await run(
          "enum CustomOrderStatus",
          `CREATE TYPE "CustomOrderStatus" AS ENUM ('NEW','CONTACTED','QUOTED','CONVERTED','CLOSED')`,
        );
      } else {
        results.push({ label: "enum CustomOrderStatus (exists)", ok: true });
      }
    } catch (err) {
      results.push({
        label: "enum CustomOrderStatus check",
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    await run(
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

    await run(
      "table NewsletterSubscriber",
      `CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
         "id" TEXT PRIMARY KEY,
         "email" TEXT NOT NULL,
         "source" TEXT,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );
    await run(
      "NewsletterSubscriber.email unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email")`,
    );
  } finally {
    try {
      await pool.end();
    } catch {
      // ignore
    }
  }

  console.log("[db-setup] schema sync complete");
  return results;
}

let done: Promise<MigrationResult[]> | null = null;

export function ensureSchema(): Promise<MigrationResult[]> {
  if (!done) {
    done = execAll().catch((err): MigrationResult[] => {
      console.error("[db-setup] fatal:", err);
      done = null;
      return [
        {
          label: "fatal",
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        },
      ];
    });
  }
  return done;
}

/**
 * Force a fresh run (invalidates the cache). For diagnostic endpoint use.
 */
export function resetSchemaCache(): void {
  done = null;
}
