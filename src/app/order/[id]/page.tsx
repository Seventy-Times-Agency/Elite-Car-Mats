import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/security/auth";
import { verifyOrderToken } from "@/lib/security/order-token";
import { formatPrice } from "@/lib/pricing";
import { CopyNumber } from "./CopyNumber";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT, type Dict } from "@/i18n/dictionary";
import { localizeColor } from "@/i18n/labels";
import { trackingUrl } from "@/lib/tracking-url";

export const dynamic = "force-dynamic";

const STATUS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PRODUCTION",
  "SHIPPED",
  "DELIVERED",
] as const;

function statusLabel(code: string, dict: Dict, fallback: Dict): string {
  const key =
    code === "PENDING"
      ? "ord.statusPending"
      : code === "CONFIRMED"
        ? "ord.statusConfirmed"
        : code === "PRODUCTION"
          ? "ord.statusProduction"
          : code === "SHIPPED"
            ? "ord.statusShipped"
            : code === "DELIVERED"
              ? "ord.statusDelivered"
              : code === "CANCELLED"
                ? "ord.statusCancelled"
                : null;
  if (!key) return code;
  return (dict[key] ?? fallback[key] ?? code) as string;
}

function matSetLabel(code: string, dict: Dict, fallback: Dict): string {
  const key =
    code === "FRONT"
      ? "matset.fronts"
      : code === "FULL"
        ? "matset.full"
        : code === "CARGO"
          ? "matset.cargo"
          : code === "FULL_CARGO"
            ? "matset.fullCargo"
            : null;
  if (!key) return code;
  return (dict[key] ?? fallback[key] ?? code) as string;
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: token } = await searchParams;

  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
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

  // Auth: token in URL OR admin cookie. Both "order doesn't exist" and
  // "order exists but bad/missing token" collapse to the same error code
  // so an attacker who guessed an orderNumber can't tell the difference
  // (which would otherwise be an enumeration oracle).
  if (!order) {
    redirect(`/track?error=invalid&n=${encodeURIComponent(id)}`);
  }
  const tokenOk = verifyOrderToken(order.id, token ?? null);
  if (!tokenOk) {
    const adminOk = await requireAdmin();
    if (!adminOk) {
      redirect(`/track?error=invalid&n=${encodeURIComponent(order.orderNumber)}`);
    }
  }

  const { dict, fallback } = await getDictionary();
  const s = (k: string) => (dict[k] ?? fallback[k]) as string;
  // Color rows store canonical Russian names — localize for display.
  const tLabels = makeT(dict, fallback);

  const currentStep =
    order.status === "CANCELLED"
      ? -1
      : STATUS_STEPS.indexOf(
          order.status as (typeof STATUS_STEPS)[number],
        );

  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-block text-5xl mb-3">✓</div>
          <h1 className="text-2xl lg:text-3xl font-bold">{s("ord.received")}</h1>
          <div className="text-text-dim text-sm mt-2">
            {s("ord.number")}: <CopyNumber value={order.orderNumber} />
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 mb-6">
          <span className="section-label text-[10px]">{s("ord.status")}</span>
          <div className="mt-3 text-gold text-lg font-semibold">
            {statusLabel(order.status, dict, fallback)}
          </div>
          {currentStep >= 0 && (
            <div className="mt-6 flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex-1 flex items-center gap-1">
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= currentStep
                        ? "bg-gradient-to-r from-gold to-gold-light"
                        : "bg-border/30"
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
          {order.trackingNumber && (
            <p className="mt-4 text-sm text-text-dim">
              {s("ord.tracking")}:{" "}
              {trackingUrl(order.trackingNumber, order.carrier) ? (
                <a
                  href={trackingUrl(order.trackingNumber, order.carrier)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light font-mono underline underline-offset-4 decoration-gold/40 transition-colors"
                >
                  {order.trackingNumber}
                </a>
              ) : (
                <span className="text-text font-mono">{order.trackingNumber}</span>
              )}
            </p>
          )}
          {order.receiptUrl && (
            <p className="mt-4">
              <a
                href={order.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold hover:text-gold-light text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {s("ord.receipt")}
              </a>
            </p>
          )}
        </div>

        {/* Review CTA — once the mats have shipped, the customer's own
            order page is the easiest place to leave a review. The token
            link marks the review "verified buyer" and pre-fills the form. */}
        {token &&
          (order.status === "SHIPPED" || order.status === "DELIVERED") && (
            <div className="glass-card rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-text font-semibold text-sm">
                  {s("ord.reviewCtaTitle")}
                </div>
                <p className="text-text-dim text-xs mt-1 leading-relaxed">
                  {s("ord.reviewCtaSub")}
                </p>
              </div>
              <Link
                href={`/reviews/new?order=${encodeURIComponent(order.orderNumber)}&t=${encodeURIComponent(token)}`}
                className="shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-5 py-3 rounded-lg shadow-[0_4px_20px_rgba(212,165,74,0.25)]"
              >
                {s("ord.reviewCtaBtn")}
              </Link>
            </div>
          )}

        <div className="glass-card rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <p className="text-text-dim text-xs leading-relaxed">
            {s("ord.checkEmail").replace("{email}", order.email)}
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 mb-6">
          <span className="section-label text-[10px]">{s("ord.summary")}</span>
          <div className="mt-4 space-y-3">
            {order.items.map((i) => (
              <div
                key={i.id}
                className="flex gap-4 py-3 border-b border-border/30 last:border-0"
              >
                <div
                  className="w-14 h-14 rounded-lg border border-border/60 shrink-0 relative overflow-hidden shadow-inner"
                  style={{ backgroundColor: i.color.hex }}
                  aria-hidden
                >
                  <div
                    className="absolute inset-0 border-[3px] rounded-lg"
                    style={{ borderColor: i.edgeColor.hex }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <h3 className="text-text font-medium text-sm">
                      {i.product.model.brand.name} {i.product.model.name}
                      {i.year ? <span className="text-text-faint font-normal"> · {i.year}</span> : null}
                    </h3>
                    <span className="text-gold text-sm font-semibold shrink-0">
                      {formatPrice(Number(i.price ?? 0) * i.quantity)}
                    </span>
                  </div>
                  <p className="text-text-dim text-xs mt-1.5">
                    {matSetLabel(i.product.matSet, dict, fallback)} · ×{i.quantity}
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-text-dim">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-sm border border-border/60"
                        style={{ backgroundColor: i.color.hex }}
                        aria-hidden
                      />
                      {localizeColor(tLabels, i.color.name)}
                    </span>
                    <span className="text-text-faint">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-border/40"
                        style={{ backgroundColor: i.edgeColor.hex }}
                        aria-hidden
                      />
                      {localizeColor(tLabels, i.edgeColor.name)}
                    </span>
                    {i.badge && (
                      <>
                        <span className="text-text-faint">·</span>
                        <span className="inline-flex items-center gap-1 text-gold/90">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.31L12 14.17l-4.78 2.52.91-5.31L4.27 7.62l5.34-.78L12 2z" />
                          </svg>
                          {i.badge.brandName}
                          {(i.badgeCount ?? 1) > 1 ? ` ×${i.badgeCount}` : ""}
                        </span>
                      </>
                    )}
                    {i.heelPad && (
                      <>
                        <span className="text-text-faint">·</span>
                        <span className="text-gold/90">
                          {s("cart.drawerHeelPadChip")}
                        </span>
                      </>
                    )}
                    {i.thirdRow && (
                      <>
                        <span className="text-text-faint">·</span>
                        <span className="text-gold/90">
                          {s("cart.drawerThirdRowChip")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-baseline mt-5 pt-4 border-t border-border/50">
            <span className="text-text-dim text-xs uppercase tracking-wider">
              {s("ord.total")}
            </span>
            <span className="text-gold text-xl font-bold">
              {formatPrice(Number(order.total ?? 0))}
            </span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 mb-6">
          <span className="section-label text-[10px]">{s("ord.shipping")}</span>
          <div className="mt-3 text-sm space-y-1">
            <div className="text-text">{order.customerName}</div>
            <div className="text-text-dim">
              {order.email} · {order.phone}
            </div>
            <div className="text-text-dim">
              {order.address}
              {order.city ? `, ${order.city}` : ""}
              {order.state ? `, ${order.state}` : ""}
              {order.zip ? ` ${order.zip}` : ""}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/catalog"
            className="inline-block text-gold hover:text-gold-light text-sm uppercase tracking-wider transition-colors"
          >
            {s("cta.backToCatalog")}
          </Link>
        </div>
      </div>
    </div>
  );
}
