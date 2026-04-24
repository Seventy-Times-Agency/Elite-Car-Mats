import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReviewsManager } from "./ReviewsManager";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const reviews = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
  });

  const serialized = reviews.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    carModel: r.carModel,
    text: r.text,
    rating: r.rating,
    photos: r.photos,
    approved: r.approved,
    createdAt: r.createdAt.toISOString(),
  }));

  const pending = serialized.filter((r) => !r.approved).length;
  const approved = serialized.filter((r) => r.approved).length;

  return (
    <AdminShell
      title={t("admin.reviewsTitle")}
      subtitle={`${t("admin.reviewsPending")}: ${pending} · ${t("admin.reviewsApproved")}: ${approved}`}
    >
      <ReviewsManager initial={serialized} />
    </AdminShell>
  );
}
