import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/pricing";
import { OrderRow } from "./OrderRow";
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

  return (
    <div className="min-h-screen py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.ordersTitle")}</h1>
            <p className="text-text-dim text-xs mt-1">
              {t("admin.ordersTotalLabel")}: {orders.length}
              {Object.entries(totalsByStatus).map(([s, n]) => ` · ${s}: ${n}`)}
            </p>
          </div>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="text-text-dim hover:text-error text-xs uppercase tracking-wider"
            >
              {t("admin.signOut")}
            </button>
          </form>
        </div>

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

        <div className="mt-8 text-center">
          <Link href="/" className="text-text-dim text-xs hover:text-gold">
            {t("admin.backToSite")}
          </Link>
        </div>
      </div>
    </div>
  );
}
