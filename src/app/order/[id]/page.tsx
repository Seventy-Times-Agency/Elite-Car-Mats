import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { verifyOrderToken } from "@/lib/order-token";
import { formatPrice } from "@/lib/pricing";
import { CopyNumber } from "./CopyNumber";
import { getDictionary } from "@/i18n/getDictionary";
import type { Dict } from "@/i18n/dictionary";

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

  if (!order) {
    redirect(`/track?error=notfound&n=${encodeURIComponent(id)}`);
  }

  // Auth: token in URL OR admin cookie. Without either, treat as if the
  // order doesn't exist (don't leak existence) — bounce to /track.
  const tokenOk = verifyOrderToken(order.id, token ?? null);
  if (!tokenOk) {
    const adminOk = await requireAdmin();
    if (!adminOk) {
      redirect(`/track?error=auth&n=${encodeURIComponent(order.orderNumber)}`);
    }
  }

  const { dict, fallback } = await getDictionary();
  const s = (k: string) => (dict[k] ?? fallback[k]) as string;

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
              <span className="text-text font-mono">{order.trackingNumber}</span>
            </p>
          )}
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
                      {i.color.name}
                    </span>
                    <span className="text-text-faint">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-border/40"
                        style={{ backgroundColor: i.edgeColor.hex }}
                        aria-hidden
                      />
                      {i.edgeColor.name}
                    </span>
                    {i.badge && (
                      <>
                        <span className="text-text-faint">·</span>
                        <span className="inline-flex items-center gap-1 text-gold/90">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.31L12 14.17l-4.78 2.52.91-5.31L4.27 7.62l5.34-.78L12 2z" />
                          </svg>
                          {i.badge.brandName}
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
