import { NextResponse } from "next/server";
import { ensureSchema, resetSchemaCache } from "@/lib/db/setup";
import { requireAdminApi, checkAdminCsrf } from "@/lib/security/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint. Triggers a fresh idempotent schema sync and returns
 * per-statement results as JSON.
 *
 * Auth: admin cookie OR `x-admin-token` header (matches ADMIN_API_TOKEN
 *       env var). The previous `?token=` query-string path was removed —
 *       query strings leak into access logs and Referer headers.
 *
 * Method: POST only — GET-with-side-effects opens up CSRF surface (a
 *         logged-in admin clicking a malicious link would silently hit it).
 */
export async function POST(request: Request) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdminApi())) {
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
