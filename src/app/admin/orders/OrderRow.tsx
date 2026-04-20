"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "PENDING" | "CONFIRMED" | "PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "Ожидает",
  CONFIRMED: "Подтверждён",
  PRODUCTION: "Производство",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
};

const STATUS_COLOR: Record<Status, string> = {
  PENDING: "text-yellow-400 border-yellow-400/30",
  CONFIRMED: "text-blue-400 border-blue-400/30",
  PRODUCTION: "text-purple-400 border-purple-400/30",
  SHIPPED: "text-gold border-gold/40",
  DELIVERED: "text-green-400 border-green-400/30",
  CANCELLED: "text-red-400 border-red-400/30",
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  trackingNumber: string | null;
  itemsCount: number;
  createdAt: string;
}

export function OrderRow({
  order,
  formattedTotal,
}: {
  order: Order;
  formattedTotal: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<Status>(order.status as Status);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

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
        setMessage("Ошибка сохранения");
        return;
      }
      setMessage("Сохранено");
      router.refresh();
      setTimeout(() => setMessage(null), 2000);
    });
  };

  const date = new Date(order.createdAt).toLocaleDateString("ru-RU", {
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
            {order.customerName} · {order.email} · {order.itemsCount} поз.
          </div>
        </div>
        <div className="text-gold font-semibold text-lg shrink-0">
          {formattedTotal}
        </div>
        <div className="text-text-faint shrink-0">{expanded ? "▲" : "▼"}</div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-text-faint uppercase tracking-wider mb-1">Телефон</div>
              <a href={`tel:${order.phone}`} className="text-text">{order.phone}</a>
            </div>
            <div>
              <div className="text-text-faint uppercase tracking-wider mb-1">Email</div>
              <a href={`mailto:${order.email}`} className="text-text">{order.email}</a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-faint mb-1.5">
                Статус
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
                Трек-номер
              </label>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Необязательно"
                className="w-full glass-card rounded-lg px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/order/${order.orderNumber}`}
              target="_blank"
              className="text-xs text-text-dim hover:text-gold"
            >
              Открыть страницу заказа →
            </Link>
            <div className="flex items-center gap-3">
              {message && (
                <span className="text-[11px] text-text-dim">{message}</span>
              )}
              <button
                onClick={save}
                disabled={!hasChanges || saving}
                className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
