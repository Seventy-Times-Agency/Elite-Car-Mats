import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { modelCreateSchema } from "@/lib/validations/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.customModel.findMany({
    orderBy: [{ brandId: "asc" }, { name: "asc" }],
    include: { brand: { select: { name: true, slug: true } } },
  });
  return NextResponse.json({
    models: rows.map((r) => ({
      id: r.id,
      brandId: r.brandId,
      brandName: r.brand.name,
      brandSlug: r.brand.slug,
      slug: r.slug,
      name: r.name,
      bodyType: r.bodyType,
      category: r.category,
      years: r.years,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  });
}

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
  const parsed = modelCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const parent = await prisma.customBrand.findUnique({
    where: { id: d.brandId },
  });
  if (!parent) {
    return NextResponse.json({ error: "brand_not_found" }, { status: 404 });
  }
  try {
    const row = await prisma.customModel.create({
      data: {
        brandId: d.brandId,
        slug: d.slug,
        name: d.name,
        bodyType: d.bodyType,
        category: d.category,
        years: d.years,
      },
    });
    revalidateTag("catalog", "default");
    return NextResponse.json({ model: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    }
    console.error("[admin:catalog:model:create]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
