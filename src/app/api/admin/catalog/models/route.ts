import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { modelCreateSchema } from "@/lib/validations/catalog";
import { resetCatalogSeedCache, mirrorCustomModelRow } from "@/lib/db/seed";
import { resolveBrandRef, codeBrandName } from "@/lib/catalog-brand-ref";
import { asCategory, parseYears } from "@/lib/catalog-normalize";

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
      brandId: r.brandId ?? `code:${r.codeBrandSlug}`,
      brandName: r.brand?.name ?? codeBrandName(r.codeBrandSlug) ?? "?",
      brandSlug: r.brand?.slug ?? r.codeBrandSlug ?? "?",
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
  const ref = resolveBrandRef(d.brandId, d.slug);
  if ("error" in ref) {
    return NextResponse.json({ error: ref.error }, { status: ref.status });
  }
  let parentBrand: { slug: string; name: string } | null = null;
  if (ref.brandId) {
    const parent = await prisma.customBrand.findUnique({
      where: { id: ref.brandId },
    });
    if (!parent) {
      return NextResponse.json({ error: "brand_not_found" }, { status: 404 });
    }
    parentBrand = { slug: parent.slug, name: parent.name };
  } else if (ref.codeBrandSlug) {
    const name = codeBrandName(ref.codeBrandSlug);
    if (name) parentBrand = { slug: ref.codeBrandSlug, name };
  }
  try {
    const row = await prisma.customModel.create({
      data: {
        brandId: ref.brandId,
        codeBrandSlug: ref.codeBrandSlug,
        slug: d.slug,
        name: d.name,
        bodyType: d.bodyType,
        category: d.category,
        years: d.years,
      },
    });
    revalidateTag("catalog", "default");
    // Force the next /api/orders cold-start to mirror this custom model
    // into Brand/Model/Product so the FK on OrderItem.productId resolves.
    resetCatalogSeedCache();
    // Mirror right now too — warm /api/orders instances keep their seed
    // cache, so without this an order for the new model 500s at the FK
    // until every lambda recycles.
    if (parentBrand) {
      try {
        await mirrorCustomModelRow({
          id: `${parentBrand.slug}-${row.slug}`,
          brandId: parentBrand.slug,
          brandName: parentBrand.name,
          name: row.name,
          slug: row.slug,
          years: parseYears(row.years),
          bodyType: row.bodyType,
          category: asCategory(row.category),
        });
      } catch (err) {
        console.error("[admin:catalog:model:create] mirror failed:", err);
      }
    }
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
