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

  // Advisory lock so concurrent serverless invocations during a cold start
  // can't race CREATE TABLE/TYPE statements. Postgres' CREATE TYPE is not
  // race-safe even with IF NOT EXISTS — two parallel invocations can both
  // see the type missing and both try to insert into pg_type. The lock is
  // held for the lifetime of the session and released on pool.end().
  // Postgres' advisory lock takes a bigint; we use a string literal that
  // pg parses back to int8, sidestepping the JS BigInt-literal target
  // restriction. The exact key is arbitrary as long as it's stable.
  const ADVISORY_KEY = "5004603024879845377";
  const lockClient = await pool.connect();
  try {
    await lockClient.query("SELECT pg_advisory_lock($1)", [ADVISORY_KEY]);
  } catch (err) {
    lockClient.release();
    await pool.end().catch(() => {});
    const msg = err instanceof Error ? err.message : String(err);
    return [{ label: "advisory-lock", ok: false, error: msg }];
  }

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
      "order.carrier",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "carrier" TEXT`,
    );
    await run(
      "order.shippedAt",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMP(3)`,
    );
    await run(
      "order.deliveredAt",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3)`,
    );
    await run(
      "order.shipstationOrderId",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shipstationOrderId" TEXT`,
    );
    await run(
      "order.receiptUrl",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT`,
    );
    await run(
      "order.reviewInviteSentAt",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "reviewInviteSentAt" TIMESTAMP(3)`,
    );
    await run(
      "order.promoCode",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "promoCode" TEXT`,
    );
    await run(
      "order.locale",
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "locale" TEXT`,
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
         "badgeCount" INTEGER NOT NULL DEFAULT 1,
         "heelPad" BOOLEAN NOT NULL DEFAULT FALSE,
         "year" INTEGER,
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
    // Back-compat for databases that predate optional columns.
    await run(
      "orderItem.year",
      `ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "year" INTEGER`,
    );
    await run(
      "orderItem.heelPad",
      `ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "heelPad" BOOLEAN NOT NULL DEFAULT FALSE`,
    );
    await run(
      "orderItem.thirdRow",
      `ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "thirdRow" BOOLEAN NOT NULL DEFAULT FALSE`,
    );
    await run(
      "orderItem.badgeCount",
      `ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "badgeCount" INTEGER NOT NULL DEFAULT 1`,
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

    // Back-compat for databases that predate the review-system columns.
    await run(
      "review.verified",
      `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT FALSE`,
    );
    await run(
      "review.email",
      `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "email" TEXT`,
    );
    await run(
      "review.orderId",
      `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "orderId" TEXT`,
    );
    await run(
      "review.promoCode",
      `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "promoCode" TEXT`,
    );
    await run(
      "Review.orderId index",
      `CREATE INDEX IF NOT EXISTS "Review_orderId_idx" ON "Review"("orderId")`,
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

    // Stripe invoice flow for custom orders (phone agreement → invoice).
    await run(
      "customOrder.invoiceAmount",
      `ALTER TABLE "CustomOrderRequest" ADD COLUMN IF NOT EXISTS "invoiceAmount" DECIMAL(10,2)`,
    );
    await run(
      "customOrder.stripeInvoiceId",
      `ALTER TABLE "CustomOrderRequest" ADD COLUMN IF NOT EXISTS "stripeInvoiceId" TEXT`,
    );
    await run(
      "customOrder.invoiceUrl",
      `ALTER TABLE "CustomOrderRequest" ADD COLUMN IF NOT EXISTS "invoiceUrl" TEXT`,
    );
    await run(
      "customOrder.invoiceSentAt",
      `ALTER TABLE "CustomOrderRequest" ADD COLUMN IF NOT EXISTS "invoiceSentAt" TIMESTAMP(3)`,
    );
    await run(
      "customOrder.invoicePaidAt",
      `ALTER TABLE "CustomOrderRequest" ADD COLUMN IF NOT EXISTS "invoicePaidAt" TIMESTAMP(3)`,
    );
    await run(
      "CustomOrderRequest.stripeInvoiceId unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "CustomOrderRequest_stripeInvoiceId_key" ON "CustomOrderRequest"("stripeInvoiceId")`,
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

    // ------------------------------------------------------------------
    // Webhook idempotency ledger. One row per processed Stripe event id.
    // ------------------------------------------------------------------
    await run(
      "table WebhookEvent",
      `CREATE TABLE IF NOT EXISTS "WebhookEvent" (
         "id" TEXT PRIMARY KEY,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );

    // ------------------------------------------------------------------
    // Blog. Single-table CMS — markdown body, optional cover image,
    // optional locale (null = visible in every locale).
    // ------------------------------------------------------------------
    await run(
      "table Post",
      `CREATE TABLE IF NOT EXISTS "Post" (
         "id" TEXT PRIMARY KEY,
         "slug" TEXT NOT NULL,
         "title" TEXT NOT NULL,
         "excerpt" TEXT NOT NULL,
         "content" TEXT NOT NULL,
         "coverImage" TEXT,
         "published" BOOLEAN NOT NULL DEFAULT FALSE,
         "publishedAt" TIMESTAMP(3),
         "locale" TEXT,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );
    await run(
      "Post.slug unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug")`,
    );
    await run(
      "Post.published index",
      `CREATE INDEX IF NOT EXISTS "Post_published_publishedAt_idx" ON "Post"("published","publishedAt")`,
    );
    await run(
      "Post.locale index",
      `CREATE INDEX IF NOT EXISTS "Post_locale_idx" ON "Post"("locale")`,
    );

    // ------------------------------------------------------------------
    // Per-(profile, matSet) price overrides. Server billing paths
    // pass these to lib/pricing.ts so customers are billed at the
    // most recent admin-set price even before the code defaults are
    // updated by a redeploy.
    // ------------------------------------------------------------------
    await run(
      "table MatSetPriceOverride",
      `CREATE TABLE IF NOT EXISTS "MatSetPriceOverride" (
         "id" TEXT PRIMARY KEY,
         "profile" TEXT NOT NULL,
         "matSet" TEXT NOT NULL,
         "price" DECIMAL(10,2) NOT NULL,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );
    await run(
      "MatSetPriceOverride.profile_matSet unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "MatSetPriceOverride_profile_matSet_key" ON "MatSetPriceOverride"("profile","matSet")`,
    );

    // ------------------------------------------------------------------
    // StoreSetting — small key/value store for operator switches that
    // must apply without a redeploy (add-on stock availability etc.).
    // ------------------------------------------------------------------
    await run(
      "table StoreSetting",
      `CREATE TABLE IF NOT EXISTS "StoreSetting" (
         "key" TEXT PRIMARY KEY,
         "value" TEXT NOT NULL
       )`,
    );

    // ------------------------------------------------------------------
    // Custom catalog — admin-added brands and models that aren't in
    // src/data/catalog/. Public catalog read paths merge these on top
    // of the code lists. Slug clashes with code-based rows are filtered
    // out at merge time.
    // ------------------------------------------------------------------
    await run(
      "table CustomBrand",
      `CREATE TABLE IF NOT EXISTS "CustomBrand" (
         "id" TEXT PRIMARY KEY,
         "slug" TEXT NOT NULL,
         "name" TEXT NOT NULL,
         "logo" TEXT,
         "popularity" INTEGER,
         "categories" TEXT[] NOT NULL DEFAULT '{}',
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );
    await run(
      "CustomBrand.slug unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "CustomBrand_slug_key" ON "CustomBrand"("slug")`,
    );

    await run(
      "table CustomModel",
      `CREATE TABLE IF NOT EXISTS "CustomModel" (
         "id" TEXT PRIMARY KEY,
         "brandId" TEXT,
         "codeBrandSlug" TEXT,
         "slug" TEXT NOT NULL,
         "name" TEXT NOT NULL,
         "bodyType" TEXT NOT NULL,
         "category" TEXT NOT NULL,
         "years" TEXT NOT NULL,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT "CustomModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "CustomBrand"("id") ON DELETE CASCADE
       )`,
    );
    // Back-compat: models can now attach to a code-catalog brand via
    // codeBrandSlug — the CustomBrand FK becomes optional.
    await run(
      "customModel.codeBrandSlug",
      `ALTER TABLE "CustomModel" ADD COLUMN IF NOT EXISTS "codeBrandSlug" TEXT`,
    );
    await run(
      "customModel.brandId nullable",
      `ALTER TABLE "CustomModel" ALTER COLUMN "brandId" DROP NOT NULL`,
    );
    await run(
      "CustomModel.brandId_slug unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "CustomModel_brandId_slug_key" ON "CustomModel"("brandId","slug")`,
    );
    await run(
      "CustomModel.codeBrandSlug_slug unique",
      `CREATE UNIQUE INDEX IF NOT EXISTS "CustomModel_codeBrandSlug_slug_key" ON "CustomModel"("codeBrandSlug","slug")`,
    );
    await run(
      "CustomModel.brandId index",
      `CREATE INDEX IF NOT EXISTS "CustomModel_brandId_idx" ON "CustomModel"("brandId")`,
    );

    // ------------------------------------------------------------------
    // FK + hot-column indexes. Postgres does NOT auto-index foreign keys,
    // so admin dashboard queries (orderBy createdAt, where status,
    // include items) all do full scans without these.
    // ------------------------------------------------------------------
    await run(
      "Model.brandId index",
      `CREATE INDEX IF NOT EXISTS "Model_brandId_idx" ON "Model"("brandId")`,
    );
    await run(
      "Order.status index",
      `CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status")`,
    );
    await run(
      "Order.createdAt index",
      `CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt")`,
    );
    await run(
      "Order.email index",
      `CREATE INDEX IF NOT EXISTS "Order_email_idx" ON "Order"("email")`,
    );
    await run(
      "OrderItem.orderId index",
      `CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId")`,
    );
    await run(
      "OrderItem.productId index",
      `CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId")`,
    );
    await run(
      "OrderItem.colorId index",
      `CREATE INDEX IF NOT EXISTS "OrderItem_colorId_idx" ON "OrderItem"("colorId")`,
    );
    await run(
      "OrderItem.edgeColorId index",
      `CREATE INDEX IF NOT EXISTS "OrderItem_edgeColorId_idx" ON "OrderItem"("edgeColorId")`,
    );
    await run(
      "OrderItem.badgeId index",
      `CREATE INDEX IF NOT EXISTS "OrderItem_badgeId_idx" ON "OrderItem"("badgeId")`,
    );
    await run(
      "Review.approved+createdAt index",
      `CREATE INDEX IF NOT EXISTS "Review_approved_createdAt_idx" ON "Review"("approved","createdAt")`,
    );
    await run(
      "PromoCode.active index",
      `CREATE INDEX IF NOT EXISTS "PromoCode_active_idx" ON "PromoCode"("active")`,
    );
    await run(
      "CustomOrderRequest.status+createdAt index",
      `CREATE INDEX IF NOT EXISTS "CustomOrderRequest_status_createdAt_idx" ON "CustomOrderRequest"("status","createdAt")`,
    );

    // ------------------------------------------------------------------
    // updatedAt triggers. Prisma's @updatedAt is implemented client-side
    // — raw SQL inserts/updates won't bump the column. Define a single
    // shared trigger function and attach it to every table that has
    // updatedAt.
    // ------------------------------------------------------------------
    await run(
      "function bump_updated_at",
      `CREATE OR REPLACE FUNCTION bump_updated_at() RETURNS trigger AS $$
       BEGIN
         NEW."updatedAt" = CURRENT_TIMESTAMP;
         RETURN NEW;
       END;
       $$ LANGUAGE plpgsql`,
    );
    const updatedAtTables = [
      "Brand",
      "Model",
      "Product",
      "Order",
      "CustomOrderRequest",
      "Post",
      "MatSetPriceOverride",
      "CustomBrand",
      "CustomModel",
    ];
    for (const tbl of updatedAtTables) {
      await run(
        `trigger ${tbl}.updatedAt`,
        `DO $$
         BEGIN
           IF NOT EXISTS (
             SELECT 1 FROM pg_trigger
             WHERE tgname = '${tbl}_updatedAt_bump'
           ) THEN
             CREATE TRIGGER "${tbl}_updatedAt_bump"
               BEFORE UPDATE ON "${tbl}"
               FOR EACH ROW EXECUTE FUNCTION bump_updated_at();
           END IF;
         END
         $$`,
      );
    }
  } finally {
    try {
      // Release the advisory lock and return the session to the pool
      // before we close the pool itself.
      await lockClient
        .query("SELECT pg_advisory_unlock($1)", [ADVISORY_KEY])
        .catch(() => {});
      lockClient.release();
    } catch {
      // ignore
    }
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
