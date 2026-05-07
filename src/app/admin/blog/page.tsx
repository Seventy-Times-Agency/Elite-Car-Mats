import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogManager } from "./BlogManager";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const posts = await prisma.post.findMany({
    orderBy: [
      { published: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  const serialized = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    published: p.published,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    locale: p.locale,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <AdminShell title={t("admin.blogTitle")} subtitle={t("admin.blogSubtitle")}>
      <BlogManager initial={serialized} />
    </AdminShell>
  );
}
