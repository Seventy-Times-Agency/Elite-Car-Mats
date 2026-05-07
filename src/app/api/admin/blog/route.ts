import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { postCreateSchema } from "@/lib/validations/post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await prisma.post.findMany({
    orderBy: [{ published: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ posts });
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

  const parsed = postCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;

  try {
    const post = await prisma.post.create({
      data: {
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt,
        content: d.content,
        coverImage: d.coverImage ?? null,
        published: d.published ?? false,
        publishedAt: d.published ? new Date() : null,
        locale: d.locale ?? null,
      },
    });
    return NextResponse.json({ post });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    }
    console.error("[admin:blog:create]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
