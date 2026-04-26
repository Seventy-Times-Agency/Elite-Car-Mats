import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
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

interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  total: number;
  trackingNumber: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    brandName: string;
    modelName: string;
    matSet: string;
    color: { id: string; name: string; hex: string };
    edgeColor: { id: string; name: string; hex: string };
    badge: { id: string; brandName: string } | null;
    quantity: number;
    price: number;
  }>;
}

async function fetchOrder(id: string): Promise<OrderResponse | null> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/orders/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
  return res.json();
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await fetchOrder(id);
  if (!order) {
    redirect(`/track?error=notfound&n=${encodeURIComponent(id)}`);
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
                  className="w-12 h-12 rounded-lg border border-border shrink-0"
                  style={{ backgroundColor: i.color.hex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <h3 className="text-text font-medium text-sm">
                      {i.brandName} {i.modelName}
                    </h3>
                    <span className="text-gold text-sm font-semibold shrink-0">
                      {formatPrice(i.price * i.quantity)}
                    </span>
                  </div>
                  <p className="text-text-faint text-xs mt-1">
                    {matSetLabel(i.matSet, dict, fallback)} · {i.color.name} ·{" "}
                    {i.edgeColor.name}
                    {i.badge ? ` · ${i.badge.brandName}` : ""} · ×{i.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-baseline mt-5 pt-4 border-t border-border/50">
            <span className="text-text-dim text-xs uppercase tracking-wider">
              {s("ord.total")}
            </span>
            <span className="text-gold text-xl font-bold">
              {formatPrice(order.total)}
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
