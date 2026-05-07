import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { brandUpdateSchema } from "@/lib/validations/catalog";
import { brands as codeBrands } from "@/data/catalog";

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
  const parsed = brandUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;
  if (d.slug && codeBrands.some((b) => b.slug === d.slug)) {
    return NextResponse.json(
      { error: "slug_reserved_by_code" },
      { status: 409 },
    );
  }
  const data: Record<string, unknown> = {};
  if (d.slug !== undefined) data.slug = d.slug;
  if (d.name !== undefined) data.name = d.name;
  if (d.logo !== undefined) data.logo = d.logo ?? null;
  if (d.popularity !== undefined) data.popularity = d.popularity ?? null;
  if (d.categories !== undefined) data.categories = d.categories;

  try {
    const row = await prisma.customBrand.update({ where: { id }, data });
    return NextResponse.json({ brand: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Record to update not found")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    }
    console.error("[admin:catalog:brand:update]", err);
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
    await prisma.customBrand.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    console.error("[admin:catalog:brand:delete]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
