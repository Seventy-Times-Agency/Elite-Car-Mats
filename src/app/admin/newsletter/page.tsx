import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { NewsletterManager } from "./NewsletterManager";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const subs = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const serialized = subs.map((s) => ({
    id: s.id,
    email: s.email,
    source: s.source,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <AdminShell
      title={t("admin.newsletterTitle")}
      subtitle={`${t("admin.newsletterCount")}: ${serialized.length}`}
      actions={
        serialized.length > 0 ? (
          <a
            href="/api/admin/newsletter/export"
            className="glass-card text-gold hover:bg-gold/5 text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg transition-colors"
          >
            {t("admin.newsletterExportCsv")}
          </a>
        ) : null
      }
    >
      <NewsletterManager initial={serialized} />
    </AdminShell>
  );
}
