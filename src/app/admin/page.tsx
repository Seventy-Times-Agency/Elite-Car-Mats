import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { getStripe } from "@/lib/payments/stripe";
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

type IntgState = "ok" | "warn" | "off";

/**
 * Which integrations the server actually sees, without exposing any
 * secret material — presence + key mode only. Exists so "the payment
 * page didn't open" is diagnosable from the dashboard instead of
 * screenshotting Vercel env settings.
 */
function integrationStatuses(t: (k: string, p?: Record<string, string | number>) => string) {
  const sk = process.env.STRIPE_SECRET_KEY ?? "";
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const whsec = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const resend = Boolean(process.env.RESEND_API_KEY);
  const upstash = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );

  const keyMode = (key: string): { state: IntgState; text: string } => {
    if (!key) return { state: "off", text: t("admin.intgMissing") };
    if (key.startsWith("sk_live") || key.startsWith("pk_live"))
      return { state: "ok", text: t("admin.intgLive") };
    if (key.startsWith("sk_test") || key.startsWith("pk_test"))
      return { state: "warn", text: t("admin.intgTest") };
    return { state: "warn", text: t("admin.intgUnknownKey") };
  };

  return [
    { label: t("admin.intgStripeSecret"), ...keyMode(sk) },
    { label: t("admin.intgStripePub"), ...keyMode(pk) },
    {
      label: t("admin.intgStripeWebhook"),
      state: (whsec ? "ok" : "off") as IntgState,
      text: whsec ? t("admin.intgSet") : t("admin.intgMissing"),
    },
    {
      label: t("admin.intgResend"),
      state: (resend ? "ok" : "off") as IntgState,
      text: resend ? t("admin.intgSet") : t("admin.intgMissing"),
    },
    {
      label: t("admin.intgUpstash"),
      state: (upstash ? "ok" : "warn") as IntgState,
      text: upstash ? t("admin.intgSet") : t("admin.intgMissing"),
    },
    {
      // Review-photo storage. Without it the review form hides the
      // photo field (everything else keeps working).
      label: t("admin.intgBlob"),
      state: (process.env.BLOB_READ_WRITE_TOKEN ? "ok" : "warn") as IntgState,
      text: process.env.BLOB_READ_WRITE_TOKEN
        ? t("admin.intgSet")
        : t("admin.intgMissing"),
    },
    {
      // Without it order links and — critically — the Stripe checkout
      // handshake can't be signed, so payments silently degrade.
      label: t("admin.intgOrderToken"),
      state: (process.env.ORDER_TOKEN_SECRET || process.env.SESSION_SECRET
        ? "ok"
        : "off") as IntgState,
      text:
        process.env.ORDER_TOKEN_SECRET || process.env.SESSION_SECRET
          ? t("admin.intgSet")
          : t("admin.intgMissing"),
    },
  ];
}

const INTG_DOT: Record<IntgState, string> = {
  ok: "bg-green-400",
  warn: "bg-yellow-400",
  off: "bg-red-400",
};

/**
 * Live round-trip to the Stripe API: is this account actually allowed to
 * take payments right now? A key can be present and syntactically live
 * while the account still can't charge (activation incomplete, business
 * profile missing) — Checkout session creation then fails with an error
 * only visible in server logs. This surfaces it on the dashboard.
 */
async function stripeLiveCheck(
  t: (k: string, p?: Record<string, string | number>) => string,
): Promise<{ label: string; state: IntgState; text: string }[]> {
  if (!process.env.STRIPE_SECRET_KEY) return [];
  try {
    const stripe = await getStripe();
    if (!stripe) return [];
    const acct = await stripe.accounts.retrieve();
    return [
      {
        label: t("admin.intgCharges"),
        state: acct.charges_enabled ? "ok" : "off",
        text: acct.charges_enabled
          ? t("admin.intgEnabled")
          : t("admin.intgChargesOff"),
      },
      {
        label: t("admin.intgPayouts"),
        state: acct.payouts_enabled ? "ok" : "warn",
        text: acct.payouts_enabled
          ? t("admin.intgEnabled")
          : t("admin.intgPayoutsOff"),
      },
    ];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return [
      {
        label: t("admin.intgStripeApi"),
        state: "off",
        text: msg.slice(0, 200),
      },
    ];
  }
}

/**
 * Live round-trip to the Resend API: is the sending domain actually
 * verified, and which From address are we using? A present API key with
 * an unverified domain 403s every send — visible only in Resend's logs
 * otherwise.
 */
async function resendLiveCheck(
  t: (k: string, p?: Record<string, string | number>) => string,
): Promise<{ label: string; state: IntgState; text: string }[]> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return [];
  const rows: { label: string; state: IntgState; text: string }[] = [];
  const from = process.env.EMAIL_FROM ?? "";
  rows.push({
    label: t("admin.intgEmailFrom"),
    state: from.includes("resend.dev") || !from ? "warn" : "ok",
    text: from || t("admin.intgMissing"),
  });
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) {
      rows.push({
        label: t("admin.intgResendApi"),
        state: "off",
        text: `HTTP ${res.status}`,
      });
      return rows;
    }
    const data: unknown = await res.json();
    const domains =
      typeof data === "object" && data !== null && Array.isArray((data as { data?: unknown }).data)
        ? ((data as { data: { name?: string; status?: string }[] }).data)
        : [];
    if (domains.length === 0) {
      rows.push({
        label: t("admin.intgResendApi"),
        state: "off",
        text: t("admin.intgResendNoDomains"),
      });
      return rows;
    }
    for (const d of domains) {
      rows.push({
        label: `${t("admin.intgResendDomain")} ${d.name ?? "?"}`,
        state: d.status === "verified" ? "ok" : "off",
        text: d.status ?? "?",
      });
    }
    return rows;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    rows.push({
      label: t("admin.intgResendApi"),
      state: "off",
      text: msg.slice(0, 200),
    });
    return rows;
  }
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

  // Revenue aggregations done in SQL — pulling N rows back to JS and
  // summing in a `reduce` would otherwise stream up to 10k orders per
  // request when revenue grows.
  type RevenueAgg = { sum: number | null; n: bigint };
  const [
    orderCount,
    todayAgg,
    weekAgg,
    monthAgg,
    pendingReviews,
    newsletterCount,
    activePromos,
    recentOrders,
    aovRow,
    topModelsRaw,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.$queryRaw<RevenueAgg[]>`
      SELECT COALESCE(SUM("total"), 0)::float AS sum, COUNT(*)::bigint AS n
      FROM "Order"
      WHERE "createdAt" >= ${today}
    `,
    prisma.$queryRaw<RevenueAgg[]>`
      SELECT COALESCE(SUM("total"), 0)::float AS sum, COUNT(*)::bigint AS n
      FROM "Order"
      WHERE "createdAt" >= ${last7}
    `,
    prisma.$queryRaw<RevenueAgg[]>`
      SELECT COALESCE(SUM("total"), 0)::float AS sum, COUNT(*)::bigint AS n
      FROM "Order"
      WHERE "createdAt" >= ${last30}
    `,
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

  const revenueToday = Number(todayAgg?.[0]?.sum ?? 0);
  const revenueWeek = Number(weekAgg?.[0]?.sum ?? 0);
  const revenueMonth = Number(monthAgg?.[0]?.sum ?? 0);
  const todayCount = Number(todayAgg?.[0]?.n ?? 0);
  const weekCount = Number(weekAgg?.[0]?.n ?? 0);
  const monthCount = Number(monthAgg?.[0]?.n ?? 0);

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
      sub: `${todayCount} ${t("admin.dashOrdersWord")}`,
    },
    {
      label: t("admin.dashRevenueWeek"),
      value: formatPrice(revenueWeek),
      sub: `${weekCount} ${t("admin.dashOrdersWord")}`,
    },
    {
      label: t("admin.dashRevenueMonth"),
      value: formatPrice(revenueMonth),
      sub: `${monthCount} ${t("admin.dashOrdersWord")}`,
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

  const [stripeChecks, resendChecks] = await Promise.all([
    stripeLiveCheck(t),
    resendLiveCheck(t),
  ]);
  const integrations = [
    ...integrationStatuses(t),
    ...stripeChecks,
    ...resendChecks,
  ];
  const stripeOff = !process.env.STRIPE_SECRET_KEY;

  return (
    <AdminShell
      title={t("admin.dashTitle")}
      subtitle={t("admin.dashSubtitle")}
    >
      {/* Integration health — answers "does the server see my keys" at
          a glance, since env typos in Vercel are otherwise invisible. */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-text-faint mb-3">
          {t("admin.intgTitle")}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {integrations.map((i) => (
            <div key={i.label} className="flex items-center gap-2 text-xs">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${INTG_DOT[i.state]}`}
                aria-hidden
              />
              <span className="text-text-dim">{i.label}:</span>
              <span
                className={
                  i.state === "ok"
                    ? "text-green-400"
                    : i.state === "warn"
                      ? "text-yellow-400"
                      : "text-red-400"
                }
              >
                {i.text}
              </span>
            </div>
          ))}
        </div>
        {stripeOff && (
          <p className="mt-3 text-[11px] text-red-400/90 leading-snug">
            {t("admin.intgStripeOffNote")}
          </p>
        )}
      </div>

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
