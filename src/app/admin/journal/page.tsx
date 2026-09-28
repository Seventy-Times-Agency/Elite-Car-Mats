import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listProblems } from "@/lib/ops/journal";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { JournalList } from "./JournalList";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const problems = await listProblems();
  return (
    <AdminShell title={t("journal.title")} subtitle={t("journal.subtitle")}>
      <JournalList problems={problems} />
    </AdminShell>
  );
}
