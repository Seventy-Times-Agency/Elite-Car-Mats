import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { modelUpdateSchema } from "@/lib/validations/catalog";
import { resetCatalogSeedCache } from "@/lib/db/seed";
import { resolveBrandRef } from "@/lib/catalog-brand-ref";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = modelUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.brandId !== undefined) {
    // Brand ref needs the effective slug for the code-model clash check.
    let slugForCheck = d.slug;
    if (!slugForCheck) {
      const existing = await prisma.customModel.findUnique({
        where: { id },
        select: { slug: true },
      });
      slugForCheck = existing?.slug ?? "";
    }
    const ref = resolveBrandRef(d.brandId, slugForCheck);
    if ("error" in ref) {
      return NextResponse.json({ error: ref.error }, { status: ref.status });
    }
    data.brandId = ref.brandId;
    data.codeBrandSlug = ref.codeBrandSlug;
  }
  if (d.slug !== undefined) data.slug = d.slug;
  if (d.name !== undefined) data.name = d.name;
  if (d.bodyType !== undefined) data.bodyType = d.bodyType;
  if (d.category !== undefined) data.category = d.category;
  if (d.years !== undefined) data.years = d.years;

  try {
    const row = await prisma.customModel.update({ where: { id }, data });
    revalidateTag("catalog", "default");
    resetCatalogSeedCache();
    return NextResponse.json({ model: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Record to update not found")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    }
    console.error("[admin:catalog:model:update]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.customModel.delete({ where: { id } });
    revalidateTag("catalog", "default");
    resetCatalogSeedCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    console.error("[admin:catalog:model:delete]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
