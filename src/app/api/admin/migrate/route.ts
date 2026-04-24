import { NextResponse } from "next/server";
import { ensureSchema, resetSchemaCache } from "@/lib/db-setup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint. GET it and see per-statement migration results as
 * JSON, including the full error text for anything that failed. Safe to
 * hit repeatedly — the underlying SQL is idempotent (IF NOT EXISTS).
 *
 * Not guarded behind admin cookie on purpose: we need to be able to call
 * it when the admin panel is broken because of a missing schema. The
 * operations it performs are pure-DDL and idempotent, so there's no
 * exploitable state change.
 */
export async function GET() {
  resetSchemaCache();
  const results = await ensureSchema();
  const ok = results.every((r) => r.ok);
  return NextResponse.json(
    {
      ok,
      count: results.length,
      results,
    },
    { status: ok ? 200 : 500 },
  );
}
