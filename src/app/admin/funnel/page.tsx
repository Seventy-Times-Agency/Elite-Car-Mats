import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { FunnelPanel } from "@/components/admin/FunnelPanel";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

// Own section rather than the top of the dashboard: the funnel is a
// periodic check, the dashboard is the daily glance at orders/revenue.
export default async function AdminFunnelPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return (
    <AdminShell title={t("admin.funnelTitle")} subtitle={t("admin.funnelSubtitle")}>
      <FunnelPanel t={t} />
    </AdminShell>
  );
}
