import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { PromosManager } from "./PromosManager";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const promos = await prisma.promoCode.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  const serialized = promos.map((p) => ({
    id: p.id,
    code: p.code,
    discount: p.discount,
    description: p.description,
    maxUses: p.maxUses,
    usedCount: p.usedCount,
    minOrder: p.minOrder ? Number(p.minOrder) : null,
    active: p.active,
    expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <AdminShell
      title={t("admin.promosTitle")}
      subtitle={t("admin.promosSubtitle")}
    >
      <PromosManager initial={serialized} />
    </AdminShell>
  );
}
