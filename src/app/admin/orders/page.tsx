import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/pricing";
import { OrderRow } from "./OrderRow";
import { AdminShell } from "@/components/admin/AdminShell";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      items: { select: { id: true } },
    },
  });

  const totalsByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const subtitle =
    `${t("admin.ordersTotalLabel")}: ${orders.length}` +
    Object.entries(totalsByStatus)
      .map(([s, n]) => ` · ${s}: ${n}`)
      .join("");

  return (
    <AdminShell title={t("admin.ordersTitle")} subtitle={subtitle}>
      {orders.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-text-dim">
          {t("admin.ordersEmpty")}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow
              key={o.id}
              order={{
                id: o.id,
                orderNumber: o.orderNumber,
                status: o.status,
                customerName: o.customerName,
                email: o.email,
                phone: o.phone,
                total: Number(o.total ?? 0),
                trackingNumber: o.trackingNumber,
                itemsCount: o.items.length,
                createdAt: o.createdAt.toISOString(),
              }}
              formattedTotal={formatPrice(Number(o.total ?? 0))}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
