import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { resolveProblem } from "@/lib/ops/journal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resolveSchema = z.object({ id: z.string().regex(/^[0-9a-f]{8}$/) });

/** Mark a journal problem as fixed (forget it). */
export async function POST(request: Request) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const ok = await resolveProblem(parsed.data.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
