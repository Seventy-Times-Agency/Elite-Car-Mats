"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { localizeColor, localizeMatSet } from "@/i18n/labels";
import { formatPrice } from "@/lib/pricing";

type Status =
  | "PENDING"
  | "CONFIRMED"
  | "PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const STATUS_COLOR: Record<Status, string> = {
  PENDING: "text-yellow-400 border-yellow-400/30",
  CONFIRMED: "text-blue-400 border-blue-400/30",
  PRODUCTION: "text-purple-400 border-purple-400/30",
  SHIPPED: "text-gold border-gold/40",
  DELIVERED: "text-green-400 border-green-400/30",
  CANCELLED: "text-red-400 border-red-400/30",
};

export interface OrderItemView {
  id: string;
  brandName: string;
  modelName: string;
  year: number | null;
  /** Canonical Russian mat-set label — localized via localizeMatSet. */
  matSetLabel: string;
  colorName: string;
  colorHex: string;
  edgeColorName: string;
  edgeColorHex: string;
  badgeBrand: string | null;
  /** 0 = no badge; otherwise plates count. */
  badgeCount: number;
  heelPad: boolean;
  /** Paid third-row add-on — the workshop must see it to produce it. */
  thirdRow: boolean;
  quantity: number;
  unitPrice: number;
}

interface Order {
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
  comment: string | null;
  promoCode: string | null;
  subtotal: number;
  discount: number;
  total: number;
  trackingNumber: string | null;
  itemsCount: number;
  createdAt: string;
}

export function OrderRow({
  order,
  items,
  formattedTotal,
}: {
  order: Order;
  items: OrderItemView[];
  formattedTotal: string;
}) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<Status>(order.status as Status);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const STATUS_LABEL: Record<Status, string> = {
    PENDING: t("admin.statusPending"),
    CONFIRMED: t("admin.statusConfirmed"),
    PRODUCTION: t("admin.statusProduction"),
    SHIPPED: t("admin.statusShipped"),
    DELIVERED: t("admin.statusDelivered"),
    CANCELLED: t("admin.statusCancelled"),
  };

  const hasChanges =
    status !== order.status || (tracking || "") !== (order.trackingNumber ?? "");

  const save = () => {
    setMessage(null);
    startSaving(async () => {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: tracking.trim() || null,
        }),
      });
      if (!res.ok) {
        setMessage(t("admin.saveFailed"));
        return;
      }
      setMessage(t("admin.saved"));
      router.refresh();
      setTimeout(() => setMessage(null), 2000);
    });
  };

  const remove = () => {
    if (!window.confirm(t("admin.deleteConfirm", { n: order.orderNumber }))) {
      return;
    }
    setMessage(null);
    startDeleting(async () => {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setMessage(t("admin.deleteFailed"));
        return;
      }
      router.refresh();
    });
  };

  const localeTag =
    locale === "ru" ? "ru-RU" : locale === "uk" ? "uk-UA" : "en-US";
  const date = new Date(order.createdAt).toLocaleDateString(localeTag, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="glass-card rounded-xl">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gold font-mono text-sm">{order.orderNumber}</span>
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                STATUS_COLOR[order.status as Status] ?? ""
              }`}
            >
              {STATUS_LABEL[order.status as Status] ?? order.status}
            </span>
            <span className="text-text-faint text-xs">{date}</span>
          </div>
          <div className="text-sm text-text mt-1 truncate">
            {order.customerName} · {order.email} ·{" "}
            {t("admin.itemsCount", { n: order.itemsCount })}
          </div>
        </div>
        <div className="text-gold font-semibold text-lg shrink-0">
          {formattedTotal}
        </div>
        <div className="text-text-faint shrink-0">{expanded ? "▲" : "▼"}</div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/30 space-y-4">
          {/* Customer + shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-text-faint uppercase tracking-wider mb-1">
                {t("admin.phoneLabel")}
              </div>
              <a href={`tel:${order.phone}`} className="text-text">
                {order.phone}
              </a>
            </div>
            <div>
              <div className="text-text-faint uppercase tracking-wider mb-1">
                {t("admin.emailLabel")}
              </div>
              <a href={`mailto:${order.email}`} className="text-text">
                {order.email}
              </a>
            </div>
            <div>
              <div className="text-text-faint uppercase tracking-wider mb-1">
                {t("admin.shipAddressLabel")}
              </div>
              <div className="text-text leading-snug">
                {[order.address, order.city, order.state, order.zip]
                  .filter(Boolean)
                  .join(", ") || (
                  <span className="text-text-faint">
                    {t("admin.shipAddressPendingStripe")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {order.comment && (
            <div className="text-xs">
              <div className="text-text-faint uppercase tracking-wider mb-1">
                {t("admin.commentLabel")}
              </div>
              <div className="text-text whitespace-pre-wrap leading-snug">
                {order.comment}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-faint mb-2">
              {t("admin.orderItemsLabel")}
            </div>
            <div className="space-y-2">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="rounded-lg border border-border/40 bg-bg/30 px-3 py-2.5 text-xs"
                >
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <div className="font-semibold text-text">
                      {i.brandName} {i.modelName}
                      {i.year ? (
                        <span className="text-text-faint font-normal">
                          {" "}
                          · {i.year}
                        </span>
                      ) : null}
                      <span className="text-gold font-normal">
                        {" "}
                        · {localizeMatSet(t, i.matSetLabel)}
                      </span>
                    </div>
                    <div className="text-gold font-semibold shrink-0 tabular-nums">
                      {i.quantity > 1
                        ? `${formatPrice(i.unitPrice)} × ${i.quantity} = ${formatPrice(i.unitPrice * i.quantity)}`
                        : formatPrice(i.unitPrice)}
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-x-3 gap-y-1 flex-wrap text-text-dim">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-sm border border-border/50"
                        style={{ backgroundColor: i.colorHex }}
                        aria-hidden
                      />
                      {localizeColor(t, i.colorName)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-border/50"
                        style={{ backgroundColor: i.edgeColorHex }}
                        aria-hidden
                      />
                      {localizeColor(t, i.edgeColorName)}
                    </span>
                    {i.badgeBrand && (
                      <span className="text-gold/90">
                        {t("admin.badgeChip", {
                          brand: i.badgeBrand,
                          n: i.badgeCount,
                        })}
                      </span>
                    )}
                    {i.heelPad && (
                      <span className="text-gold/90">
                        {t("admin.heelPadChip")}
                      </span>
                    )}
                    {i.thirdRow && (
                      <span className="text-gold/90">
                        {t("admin.thirdRowChip")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="rounded-lg border border-border/40 bg-bg/30 px-3 py-2.5 text-xs space-y-1.5 max-w-xs ml-auto">
            <div className="flex justify-between gap-4">
              <span className="text-text-dim">{t("admin.subtotalLabel")}</span>
              <span className="text-text tabular-nums">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            {order.promoCode && (
              <div className="flex justify-between gap-4">
                <span className="text-text-dim">
                  {t("admin.promoLabel")}{" "}
                  <span className="text-gold font-mono">{order.promoCode}</span>
                </span>
                <span className="text-gold tabular-nums">
                  −{formatPrice(order.discount)}
                </span>
              </div>
            )}
            {!order.promoCode && order.discount > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-text-dim">{t("admin.discountLabel")}</span>
                <span className="text-gold tabular-nums">
                  −{formatPrice(order.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4 pt-1.5 border-t border-border/30">
              <span className="text-text font-semibold">
                {t("admin.totalLabel")}
              </span>
              <span className="text-gold font-bold tabular-nums">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-faint mb-1.5">
                {t("admin.statusLabel")}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full glass-card rounded-lg px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
              >
                {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                  <option key={s} value={s} className="bg-bg">
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-faint mb-1.5">
                {t("admin.trackingLabel")}
              </label>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder={t("admin.trackingPh")}
                className="w-full glass-card rounded-lg px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-4">
              <Link
                href={`/order/${order.orderNumber}`}
                target="_blank"
                className="text-xs text-text-dim hover:text-gold"
              >
                {t("admin.openOrderPage")}
              </Link>
              <button
                onClick={remove}
                disabled={deleting}
                className="text-xs text-text-faint hover:text-error transition-colors disabled:opacity-40"
              >
                {deleting ? t("admin.deleting") : t("admin.deleteOrder")}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {message && (
                <span className="text-[11px] text-text-dim">{message}</span>
              )}
              <button
                onClick={save}
                disabled={!hasChanges || saving}
                className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? t("admin.saving") : t("admin.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
