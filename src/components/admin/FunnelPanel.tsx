import { prisma } from "@/lib/db/prisma";
import {
  readFunnel,
  recentDayKeys,
  shopDayStart,
  funnelEnabled,
  FUNNEL_STEPS,
  type FunnelStep,
} from "@/lib/analytics/funnel";
import type { TFn } from "@/i18n/dictionary";

/**
 * Conversion funnel for the operator: how many people reach each step
 * between landing on the site and paying.
 *
 * The upper steps come from Redis counters (see lib/analytics/funnel.ts —
 * deliberately not Postgres). The bottom two come from the Order table,
 * which already holds them, so they cost one extra query rather than a
 * whole tracking pipeline.
 *
 * Two percentages per row, because they answer different questions:
 * share of all visitors tells you the size of the opportunity, share of
 * the previous step tells you where people are actually dropping out.
 */

const DAYS = 7;

const STEP_LABEL: Record<FunnelStep, string> = {
  visit: "admin.funnelVisit",
  catalog: "admin.funnelCatalog",
  product: "admin.funnelProduct",
  configured: "admin.funnelConfigured",
  add_to_cart: "admin.funnelAddToCart",
  checkout: "admin.funnelCheckout",
  pay_click: "admin.funnelPayClick",
};

interface Row {
  label: string;
  count: number;
}

function pct(n: number, of: number): string {
  if (of <= 0) return "—";
  return `${((n / of) * 100).toFixed(n / of >= 0.1 ? 0 : 1)}%`;
}

export async function FunnelPanel({ t }: { t: TFn }) {
  if (!funnelEnabled) {
    return (
      <div className="admin-card p-4 mb-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-text-faint mb-3">
          {t("admin.funnelTitle")}
        </div>
        <p className="text-xs text-yellow-400">{t("admin.funnelOff")}</p>
      </div>
    );
  }

  const days = recentDayKeys(DAYS);
  // Window start in the shop's timezone, matching the Redis day buckets.
  const since = shopDayStart(days[0]);

  const [counts, orderRows] = await Promise.all([
    readFunnel(days),
    prisma.$queryRaw<{ created: bigint; paid: bigint }[]>`
      SELECT
        count(*) FILTER (WHERE "status" <> 'CANCELLED')          AS created,
        count(*) FILTER (WHERE "paidAt" IS NOT NULL)             AS paid
      FROM "Order"
      WHERE "createdAt" >= ${since}
    `,
  ]);

  // Configured but unreachable (deleted database, bad token): say so.
  // Zeros here would read as "nobody visited", which is a different fact.
  if (counts === null) {
    return (
      <div className="admin-card p-4 mb-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-text-faint mb-3">
          {t("admin.funnelTitle")}
        </div>
        <p className="text-xs text-red-400">{t("admin.funnelUnavailable")}</p>
      </div>
    );
  }

  const created = Number(orderRows?.[0]?.created ?? 0);
  const paid = Number(orderRows?.[0]?.paid ?? 0);

  const rows: Row[] = [
    ...FUNNEL_STEPS.map((s) => ({
      label: t(STEP_LABEL[s]),
      count: counts?.[s] ?? 0,
    })),
    { label: t("admin.funnelOrder"), count: created },
    { label: t("admin.funnelPaid"), count: paid },
  ];

  const top = rows[0]?.count ?? 0;

  return (
    <div className="admin-card p-4 mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-text-faint">
          {t("admin.funnelTitle")}
        </div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-text-faint">
          {t("admin.funnelPeriod")}
        </div>
      </div>

      {top === 0 ? (
        <p className="text-xs text-text-dim">{t("admin.funnelEmpty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => {
            const prev = i === 0 ? r.count : rows[i - 1].count;
            const width = top > 0 ? Math.max(2, (r.count / top) * 100) : 2;
            // A step can only lose people, so a drop below ~40% of the
            // previous one is where the operator should look first.
            const leak = i > 0 && prev > 0 && r.count / prev < 0.4;
            return (
              <div key={r.label} className="flex items-center gap-3">
                <div className="w-40 shrink-0 text-xs text-text-dim truncate">
                  {r.label}
                </div>
                <div className="flex-1 h-5 rounded bg-surface/40 overflow-hidden">
                  <div
                    className="h-full rounded bg-gradient-to-r from-gold/70 to-gold"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="w-14 shrink-0 text-right text-xs text-text tabular-nums">
                  {r.count.toLocaleString()}
                </div>
                <div className="w-12 shrink-0 text-right text-[11px] text-text-faint tabular-nums">
                  {pct(r.count, top)}
                </div>
                <div
                  className={`w-24 shrink-0 text-right text-[11px] tabular-nums ${
                    leak ? "text-red-400" : "text-text-faint"
                  }`}
                  title={t("admin.funnelOfPrev")}
                >
                  {i === 0 ? "" : `${pct(r.count, prev)} ${t("admin.funnelOfPrev")}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
