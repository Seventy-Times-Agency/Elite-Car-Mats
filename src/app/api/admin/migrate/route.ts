import { NextResponse } from "next/server";
import { ensureSchema, resetSchemaCache } from "@/lib/db-setup";
import { requireAdminApi } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint. GET it and see per-statement migration results as
 * JSON, including the full error text for anything that failed. Safe to
 * hit repeatedly — the underlying SQL is idempotent (IF NOT EXISTS).
 *
 * Auth: admin cookie OR x-admin-token header OR ?token=ADMIN_PASSWORD
 * query string. Same secret as the admin login — one less thing to manage.
 */
export async function GET(request: Request) {
  if (!(await requireAdminApi(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
