import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import {
  getHiddenModelIds,
  setModelHidden,
} from "@/lib/catalog-visibility";
import { mockModels as codeModels } from "@/data/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hidden = await getHiddenModelIds();
  return NextResponse.json({ hidden: Array.from(hidden).sort() });
}

const Body = z.object({
  // Canonical `${brandId}-${slug}` code-model id.
  modelId: z.string().min(3).max(160),
  hidden: z.boolean(),
});

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
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { modelId, hidden } = parsed.data;
  // Only real code-catalog models can be hidden — custom rows are simply
  // deleted from /admin/catalog instead.
  const exists = codeModels.some((m) => `${m.brandId}-${m.slug}` === modelId);
  if (!exists) {
    return NextResponse.json({ error: "model_not_found" }, { status: 404 });
  }
  try {
    const set = await setModelHidden(modelId, hidden);
    revalidateTag("catalog", "default");
    return NextResponse.json({ ok: true, hiddenCount: set.size });
  } catch (err) {
    console.error("[admin:catalog:visibility]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
