import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/pricing";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function AdminDashboardPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const now = new Date();
  const today = startOfDay(now);
  const last7 = new Date(today);
  last7.setDate(last7.getDate() - 6);
  const last30 = new Date(today);
  last30.setDate(last30.getDate() - 29);

  const [
    orderCount,
    todayOrders,
    week,
    month,
    pendingReviews,
    newsletterCount,
    activePromos,
    recentOrders,
    aovRow,
    topModelsRaw,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: today } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: last7 } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: last30 } },
      select: { total: true },
    }),
    prisma.review.count({ where: { approved: false } }),
    prisma.newsletterSubscriber.count(),
    prisma.promoCode.count({ where: { active: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    // Average order value over the last 30 days. We compute server-side
    // in SQL rather than dividing two JS numbers from the month list so
    // the figure stays accurate when there are zero orders.
    prisma.$queryRaw<{ aov: number | null; n: bigint }[]>`
      SELECT
        COALESCE(AVG("total"), 0)::float AS aov,
        COUNT(*)::bigint AS n
      FROM "Order"
      WHERE "createdAt" >= ${last30}
    `,
    // Top-5 models by units sold across all time. Group by model
    // (multiple Product rows per model — one per matSet — would
    // otherwise inflate counts).
    prisma.$queryRaw<
      {
        modelId: string;
        modelName: string;
        brandName: string;
        brandSlug: string;
        modelSlug: string;
        units: bigint;
      }[]
    >`
      SELECT
        m."id"   AS "modelId",
        m."name" AS "modelName",
        m."slug" AS "modelSlug",
        b."name" AS "brandName",
        b."slug" AS "brandSlug",
        SUM(oi."quantity")::bigint AS units
      FROM "OrderItem" oi
      JOIN "Product" p ON p."id" = oi."productId"
      JOIN "Model"   m ON m."id" = p."modelId"
      JOIN "Brand"   b ON b."id" = m."brandId"
      GROUP BY m."id", m."name", m."slug", b."name", b."slug"
      ORDER BY units DESC
      LIMIT 5
    `,
  ]);

  const sum = (arr: { total: unknown }[]) =>
    arr.reduce((acc, o) => acc + Number(o.total ?? 0), 0);

  const revenueToday = sum(todayOrders);
  const revenueWeek = sum(week);
  const revenueMonth = sum(month);

  const aov30 = Number(aovRow?.[0]?.aov ?? 0);
  const aov30N = Number(aovRow?.[0]?.n ?? 0);
  const topModels = topModelsRaw.map((r) => ({
    modelId: r.modelId,
    modelName: r.modelName,
    modelSlug: r.modelSlug,
    brandName: r.brandName,
    brandSlug: r.brandSlug,
    units: Number(r.units),
  }));

  const tiles = [
    {
      label: t("admin.dashRevenueToday"),
      value: formatPrice(revenueToday),
      sub: `${todayOrders.length} ${t("admin.dashOrdersWord")}`,
    },
    {
      label: t("admin.dashRevenueWeek"),
      value: formatPrice(revenueWeek),
      sub: `${week.length} ${t("admin.dashOrdersWord")}`,
    },
    {
      label: t("admin.dashRevenueMonth"),
      value: formatPrice(revenueMonth),
      sub: `${month.length} ${t("admin.dashOrdersWord")}`,
    },
    {
      label: t("admin.dashTotalOrders"),
      value: String(orderCount),
      sub: t("admin.dashAllTime"),
    },
    {
      label: t("admin.dashAov"),
      value: formatPrice(aov30),
      sub:
        aov30N > 0
          ? t("admin.dashAovSub", { n: aov30N })
          : t("admin.dashAovEmpty"),
    },
    {
      label: t("admin.dashPendingReviews"),
      value: String(pendingReviews),
      sub: t("admin.dashNeedModeration"),
      href: "/admin/reviews",
    },
    {
      label: t("admin.dashNewsletter"),
      value: String(newsletterCount),
      sub: t("admin.dashSubscribers"),
      href: "/admin/newsletter",
    },
    {
      label: t("admin.dashActivePromos"),
      value: String(activePromos),
      sub: t("admin.dashLivePromos"),
      href: "/admin/promos",
    },
  ];

  return (
    <AdminShell
      title={t("admin.dashTitle")}
      subtitle={t("admin.dashSubtitle")}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => {
          const inner = (
            <>
              <div className="text-[10px] uppercase tracking-[0.2em] text-text-faint">
                {tile.label}
              </div>
              <div className="text-2xl font-bold text-gold mt-2">
                {tile.value}
              </div>
              <div className="text-[11px] text-text-dim mt-1">{tile.sub}</div>
            </>
          );
          return tile.href ? (
            <Link
              key={tile.label}
              href={tile.href}
              className="glass-card rounded-xl p-4 hover:border-gold/40 transition-colors"
            >
              {inner}
            </Link>
          ) : (
            <div key={tile.label} className="glass-card rounded-xl p-4">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-dim">
              {t("admin.dashTopModels")}
            </h2>
            <Link
              href="/admin/pricing"
              className="text-gold text-xs hover:underline"
            >
              {t("admin.dashViewPricing")} →
            </Link>
          </div>
          {topModels.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center text-text-dim text-sm">
              {t("admin.dashTopModelsEmpty")}
            </div>
          ) : (
            <ol className="glass-card rounded-xl divide-y divide-border/30">
              {topModels.map((m, i) => (
                <li key={m.modelId}>
                  <Link
                    href={`/catalog/${m.brandSlug}/${m.modelSlug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/5 transition-colors"
                  >
                    <span className="w-5 text-text-faint font-mono text-xs text-right shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-text font-medium text-sm truncate">
                        {m.brandName} {m.modelName}
                      </div>
                    </div>
                    <span className="text-gold font-semibold text-sm shrink-0">
                      {m.units} {t("admin.dashUnitsWord")}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-dim">
              {t("admin.dashRecentOrders")}
            </h2>
            <Link
              href="/admin/orders"
              className="text-gold text-xs hover:underline"
            >
              {t("admin.dashSeeAll")} →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center text-text-dim text-sm">
              {t("admin.ordersEmpty")}
            </div>
          ) : (
            <div className="glass-card rounded-xl divide-y divide-border/30">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href="/admin/orders"
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gold/5 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-gold font-mono text-sm">
                      {o.orderNumber}
                    </div>
                    <div className="text-text-dim text-xs truncate">
                      {o.customerName} · {o.status}
                    </div>
                  </div>
                  <div className="text-gold font-semibold text-sm shrink-0">
                    {formatPrice(Number(o.total ?? 0))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
