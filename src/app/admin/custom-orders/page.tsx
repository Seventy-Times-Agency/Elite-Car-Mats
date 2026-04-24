import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { CustomOrdersManager } from "./CustomOrdersManager";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function AdminCustomOrdersPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const requests = await prisma.customOrderRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const serialized = requests.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    make: r.make,
    model: r.model,
    year: r.year,
    bodyType: r.bodyType,
    matSet: r.matSet,
    notes: r.notes,
    locale: r.locale,
    status: r.status,
    adminNotes: r.adminNotes,
    createdAt: r.createdAt.toISOString(),
  }));

  const open = serialized.filter(
    (r) => r.status !== "CLOSED" && r.status !== "CONVERTED",
  ).length;

  return (
    <AdminShell
      title={t("admin.customOrdersTitle")}
      subtitle={`${t("admin.customOrdersOpen")}: ${open} · ${t("admin.customOrdersTotal")}: ${serialized.length}`}
    >
      <CustomOrdersManager initial={serialized} />
    </AdminShell>
  );
}
