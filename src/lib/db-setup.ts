import "server-only";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

/**
 * Idempotent schema bootstrap + migration. Brings a completely empty
 * database — or one at any older revision — up to the current Prisma
 * schema.
 *
 * Opens its own @neondatabase/serverless Pool so we get plain pg-style
 * error messages instead of Prisma's adapter swallowing them.
 *
 * Cached one-shot per process: the first admin login / public DB write
 * triggers the run, everything after awaits the same Promise.
 */

export interface MigrationResult {
  label: string;
  ok: boolean;
  error?: string;
}

function connectionUrl(): string | null {
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

  const ensureEnum = async (
    name: string,
    values: readonly string[],
  ): Promise<void> => {
    try {
      const check = await pool.query<{ ok: number }>(
        `SELECT 1 AS ok FROM pg_type WHERE typname = $1 LIMIT 1`,
        [name],
      );
      if (check.rowCount === 0) {
        const list = values.map((v) => `'${v}'`).join(",");
        await run(`enum ${name}`, `CREATE TYPE "${name}" AS ENUM (${list})`);
      } else {
        results.push({ label: `enum ${name} (exists)`, ok: true });
      }
    } catch (err) {
      results.push({
        label: `enum ${name} check`,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  try {
    // ------------------------------------------------------------------
    // Enum types (must exist before the tables that reference them).
    // ------------------------------------------------------------------
    await ensureEnum("MatSetType", ["FRONT", "FULL", "CARGO", "FULL_CARGO"]);
    await ensureEnum("OrderStatus", [
      "PENDING",
      "CONFIRMED",
      "PRODUCTION",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ]);
    await ensureEnum("CustomOrderStatus", [
      "NEW",
      "CONTACTED",
      "QUOTED",
      "CONVERTED",
      "CLOSED",
    ]);

    // ------------------------------------------------------------------
    // Core catalog tables.
    // ------------------------------------------------------------------
    await run(
      "table Brand",
      `CREATE TABLE IF NOT EXISTS "Brand" (
         "id" TEXT PRIMARY KEY,
         "name" TEXT NOT NULL,
         "slug" TEXT NOT NULL,
         "logo" TEXT,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );
    await run(
      "Brand.slug unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "Brand_slug_key" ON "Brand"("slug")`,
    );

    await run(
      "table Model",
      `CREATE TABLE IF NOT EXISTS "Model" (
         "id" TEXT PRIMARY KEY,
         "name" TEXT NOT NULL,
         "slug" TEXT NOT NULL,
         "bodyType" TEXT,
         "brandId" TEXT NOT NULL,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT "Model_brandId_fkey" FOREIGN KEY ("brandId")
           REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE
       )`,
    );
    await run(
      "Model.(brandId,slug) unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "Model_brandId_slug_key" ON "Model"("brandId","slug")`,
    );

    await run(
      "table ModelYear",
      `CREATE TABLE IF NOT EXISTS "ModelYear" (
         "id" TEXT PRIMARY KEY,
         "year" INTEGER NOT NULL,
         "modelId" TEXT NOT NULL,
         CONSTRAINT "ModelYear_modelId_fkey" FOREIGN KEY ("modelId")
           REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE
       )`,
    );
    await run(
      "ModelYear.(modelId,year) unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "ModelYear_modelId_year_key" ON "ModelYear"("modelId","year")`,
    );

    await run(
      "table Product",
      `CREATE TABLE IF NOT EXISTS "Product" (
         "id" TEXT PRIMARY KEY,
         "modelId" TEXT NOT NULL,
         "matSet" "MatSetType" NOT NULL,
         "price" DECIMAL(10,2),
         "images" TEXT[] NOT NULL DEFAULT '{}',
         "active" BOOLEAN NOT NULL DEFAULT true,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT "Product_modelId_fkey" FOREIGN KEY ("modelId")
           REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE
       )`,
    );
    await run(
      "Product.(modelId,matSet) unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "Product_modelId_matSet_key" ON "Product"("modelId","matSet")`,
    );

    await run(
      "table EvaColor",
      `CREATE TABLE IF NOT EXISTS "EvaColor" (
         "id" TEXT PRIMARY KEY,
         "name" TEXT NOT NULL,
         "hex" TEXT NOT NULL,
         "image" TEXT,
         "sortOrder" INTEGER NOT NULL DEFAULT 0,
         "active" BOOLEAN NOT NULL DEFAULT true
       )`,
    );

    await run(
      "table EdgeColor",
      `CREATE TABLE IF NOT EXISTS "EdgeColor" (
         "id" TEXT PRIMARY KEY,
         "name" TEXT NOT NULL,
         "hex" TEXT NOT NULL,
         "sortOrder" INTEGER NOT NULL DEFAULT 0,
         "active" BOOLEAN NOT NULL DEFAULT true
       )`,
    );

    await run(
      "table Badge",
      `CREATE TABLE IF NOT EXISTS "Badge" (
         "id" TEXT PRIMARY KEY,
         "brandName" TEXT NOT NULL,
         "image" TEXT,
         "price" DECIMAL(10,2),
         "active" BOOLEAN NOT NULL DEFAULT true
       )`,
    );

    // ------------------------------------------------------------------
    // Orders + items.
    // ------------------------------------------------------------------
    await run(
      "table Order",
      `CREATE TABLE IF NOT EXISTS "Order" (
         "id" TEXT PRIMARY KEY,
         "orderNumber" TEXT NOT NULL,
         "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
         "customerName" TEXT NOT NULL,
         "phone" TEXT NOT NULL,
         "email" TEXT NOT NULL,
         "address" TEXT NOT NULL,
         "city" TEXT,
         "state" TEXT,
         "zip" TEXT,
         "comment" TEXT,
         "total" DECIMAL(10,2),
         "trackingNumber" TEXT,
         "stripeSessionId" TEXT,
         "stripePaymentIntentId" TEXT,
         "paidAt" TIMESTAMP(3),
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );
    // Back-compat: existing databases may predate the Stripe columns.
    await run(
      "order.stripeSessionId",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT`,
    );
    await run(
      "order.stripePaymentIntentId",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT`,
    );
    await run(
      "order.paidAt",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3)`,
    );
    await run(
      "Order.orderNumber unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`,
    );
    await run(
      "Order.stripeSessionId unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripeSessionId_key" ON "Order"("stripeSessionId")`,
    );

    await run(
      "table OrderItem",
      `CREATE TABLE IF NOT EXISTS "OrderItem" (
         "id" TEXT PRIMARY KEY,
         "orderId" TEXT NOT NULL,
         "productId" TEXT NOT NULL,
         "colorId" TEXT NOT NULL,
         "edgeColorId" TEXT NOT NULL,
         "badgeId" TEXT,
         "quantity" INTEGER NOT NULL DEFAULT 1,
         "price" DECIMAL(10,2),
         CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId")
           REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
         CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId")
           REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
         CONSTRAINT "OrderItem_colorId_fkey" FOREIGN KEY ("colorId")
           REFERENCES "EvaColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
         CONSTRAINT "OrderItem_edgeColorId_fkey" FOREIGN KEY ("edgeColorId")
           REFERENCES "EdgeColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
         CONSTRAINT "OrderItem_badgeId_fkey" FOREIGN KEY ("badgeId")
           REFERENCES "Badge"("id") ON DELETE SET NULL ON UPDATE CASCADE
       )`,
    );

    // ------------------------------------------------------------------
    // Reviews + promos.
    // ------------------------------------------------------------------
    await run(
      "table Review",
      `CREATE TABLE IF NOT EXISTS "Review" (
         "id" TEXT PRIMARY KEY,
         "customerName" TEXT NOT NULL,
         "carModel" TEXT NOT NULL,
         "text" TEXT NOT NULL,
         "rating" INTEGER NOT NULL DEFAULT 5,
         "photos" TEXT[] NOT NULL DEFAULT '{}',
         "approved" BOOLEAN NOT NULL DEFAULT false,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );

    await run(
      "table PromoCode",
      `CREATE TABLE IF NOT EXISTS "PromoCode" (
         "id" TEXT PRIMARY KEY,
         "code" TEXT NOT NULL,
         "discount" INTEGER NOT NULL,
         "description" TEXT,
         "maxUses" INTEGER,
         "usedCount" INTEGER NOT NULL DEFAULT 0,
         "minOrder" DECIMAL(10,2),
         "active" BOOLEAN NOT NULL DEFAULT true,
         "expiresAt" TIMESTAMP(3),
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );
    // Back-compat: earlier revisions of PromoCode had fewer columns.
    await run(
      "promo.description",
      `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "description" TEXT`,
    );
    await run(
      "promo.maxUses",
      `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER`,
    );
    await run(
      "promo.usedCount",
      `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0`,
    );
    await run(
      "promo.minOrder",
      `ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "minOrder" DECIMAL(10,2)`,
    );
    await run(
      "PromoCode.code unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code")`,
    );

    // ------------------------------------------------------------------
    // Custom orders + newsletter (newest additions).
    // ------------------------------------------------------------------
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
