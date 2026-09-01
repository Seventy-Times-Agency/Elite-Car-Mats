import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/security/auth";
import { formatPrice } from "@/lib/pricing";
import { matSets } from "@/data/catalog/mat-sets";
import { OrderRow, type OrderItemView } from "./OrderRow";
import { AdminShell } from "@/components/admin/AdminShell";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

// DB matSet enum → canonical Russian label (localized client-side via
// localizeMatSet). Generic labels — the profile-specific wording lives
// in the storefront configurator, admin just needs "what to cut".
const MATSET_LABEL: Record<string, string> = Object.fromEntries(
  matSets.map((s) => [s.type.toUpperCase().replace("-", "_"), s.label]),
);

export default async function AdminOrdersPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      items: {
        include: {
          product: { include: { model: { include: { brand: true } } } },
          color: true,
          edgeColor: true,
          badge: true,
        },
      },
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
          {orders.map((o) => {
            const items: OrderItemView[] = o.items.map((i) => ({
              id: i.id,
              brandName: i.product.model.brand.name,
              modelName: i.product.model.name,
              year: i.year,
              matSetLabel: MATSET_LABEL[i.product.matSet] ?? i.product.matSet,
              colorName: i.color.name,
              colorHex: i.color.hex,
              edgeColorName: i.edgeColor.name,
              edgeColorHex: i.edgeColor.hex,
              badgeBrand: i.badge?.brandName ?? null,
              badgeCount: i.badge ? (i.badgeCount ?? 1) : 0,
              heelPad: i.heelPad ?? false,
              thirdRow: i.thirdRow ?? false,
              quantity: i.quantity,
              unitPrice: Number(i.price ?? 0),
            }));
            const subtotal = items.reduce(
              (s, i) => s + i.unitPrice * i.quantity,
              0,
            );
            const total = Number(o.total ?? 0);
            return (
              <OrderRow
                key={o.id}
                order={{
                  id: o.id,
                  orderNumber: o.orderNumber,
                  status: o.status,
                  customerName: o.customerName,
                  email: o.email,
                  phone: o.phone,
                  address: o.address,
                  city: o.city,
                  state: o.state,
                  zip: o.zip,
                  comment: o.comment,
                  promoCode: o.promoCode,
                  subtotal,
                  discount: Math.max(0, subtotal - total),
                  total,
                  trackingNumber: o.trackingNumber,
                  itemsCount: o.items.length,
                  createdAt: o.createdAt.toISOString(),
                }}
                items={items}
                formattedTotal={formatPrice(total)}
              />
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
