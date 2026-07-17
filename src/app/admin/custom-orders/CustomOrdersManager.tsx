"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

type Status = "NEW" | "CONTACTED" | "QUOTED" | "CONVERTED" | "CLOSED";

export interface CustomRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: string;
  bodyType: string | null;
  matSet: string | null;
  notes: string | null;
  locale: string | null;
  status: Status;
  adminNotes: string | null;
  invoiceAmount: number | null;
  invoiceUrl: string | null;
  invoiceSentAt: string | null;
  invoicePaidAt: string | null;
  createdAt: string;
}

const STATUS_COLOR: Record<Status, string> = {
  NEW: "text-yellow-400 border-yellow-400/30",
  CONTACTED: "text-blue-400 border-blue-400/30",
  QUOTED: "text-purple-400 border-purple-400/30",
  CONVERTED: "text-green-400 border-green-400/30",
  CLOSED: "text-text-faint border-text-faint/30",
};

export function CustomOrdersManager({
  initial,
}: {
  initial: CustomRequest[];
}) {
  const router = useRouter();
  const t = useT();
  const [busy, startBusy] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);

  const LABELS: Record<Status, string> = {
    NEW: t("admin.customStatusNew"),
    CONTACTED: t("admin.customStatusContacted"),
    QUOTED: t("admin.customStatusQuoted"),
    CONVERTED: t("admin.customStatusConverted"),
    CLOSED: t("admin.customStatusClosed"),
  };

  const setStatus = (id: string, status: Status) => {
    startBusy(async () => {
      await fetch(`/api/admin/custom-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    });
  };

  const saveNotes = (id: string, adminNotes: string) => {
    startBusy(async () => {
      await fetch(`/api/admin/custom-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!confirm(t("admin.customConfirmDelete"))) return;
    startBusy(async () => {
      await fetch(`/api/admin/custom-orders/${id}`, { method: "DELETE" });
      router.refresh();
    });
  };

  if (initial.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center text-text-dim">
        {t("admin.customEmpty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {initial.map((r) => {
        const expanded = openId === r.id;
        const date = new Date(r.createdAt).toLocaleDateString();
        return (
          <div key={r.id} className="glass-card rounded-xl">
            <button
              onClick={() => setOpenId(expanded ? null : r.id)}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-gold font-semibold text-sm">
                    {r.make} {r.model} {r.year}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      STATUS_COLOR[r.status]
                    }`}
                  >
                    {LABELS[r.status]}
                  </span>
                  <span className="text-text-faint text-xs">{date}</span>
                </div>
                <div className="text-sm text-text mt-1 truncate">
                  {r.name} · {r.email} · {r.phone}
                </div>
              </div>
              <div className="text-text-faint shrink-0">
                {expanded ? "▲" : "▼"}
              </div>
            </button>
            {expanded && (
              <div className="px-4 pb-4 pt-2 border-t border-border/30 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-text-faint uppercase tracking-wider mb-1">
                      {t("admin.emailLabel")}
                    </div>
                    <a href={`mailto:${r.email}`} className="text-gold">
                      {r.email}
                    </a>
                  </div>
                  <div>
                    <div className="text-text-faint uppercase tracking-wider mb-1">
                      {t("admin.phoneLabel")}
                    </div>
                    <a href={`tel:${r.phone}`} className="text-gold">
                      {r.phone}
                    </a>
                  </div>
                  {r.bodyType && (
                    <div>
                      <div className="text-text-faint uppercase tracking-wider mb-1">
                        {t("admin.customBody")}
                      </div>
                      <div className="text-text">{r.bodyType}</div>
                    </div>
                  )}
                  {r.matSet && (
                    <div>
                      <div className="text-text-faint uppercase tracking-wider mb-1">
                        {t("admin.customSet")}
                      </div>
                      <div className="text-text">{r.matSet}</div>
                    </div>
                  )}
                </div>
                {r.notes && (
                  <div>
                    <div className="text-text-faint uppercase tracking-wider text-xs mb-1">
                      {t("admin.customNotes")}
                    </div>
                    <p className="text-sm text-text whitespace-pre-line">
                      {r.notes}
                    </p>
                  </div>
                )}

                <div>
                  <div className="text-text-faint uppercase tracking-wider text-xs mb-2">
                    {t("admin.statusLabel")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(LABELS) as Status[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(r.id, s)}
                        disabled={busy || r.status === s}
                        className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
                          r.status === s
                            ? STATUS_COLOR[s]
                            : "border-border/40 text-text-dim hover:text-gold hover:border-gold/40"
                        }`}
                      >
                        {LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-text-faint uppercase tracking-wider text-xs mb-1.5">
                    {t("admin.invSection")}
                  </div>
                  <InvoiceSection request={r} />
                </div>

                <div>
                  <div className="text-text-faint uppercase tracking-wider text-xs mb-1.5">
                    {t("admin.customAdminNotes")}
                  </div>
                  <AdminNotesField
                    initial={r.adminNotes ?? ""}
                    onSave={(v) => saveNotes(r.id, v)}
                    busy={busy}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => remove(r.id)}
                    disabled={busy}
                    className="text-xs text-text-dim hover:text-error uppercase tracking-wider"
                  >
                    {t("admin.customDelete")}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Invoice controls for one request: enter the phone-agreed amount, send
 * the Stripe hosted invoice (branded email goes to the customer), see
 * sent/paid state, re-issue if the price changed. The `invoice.paid`
 * webhook flips the request to CONVERTED automatically.
 */
function InvoiceSection({ request: r }: { request: CustomRequest }) {
  const router = useRouter();
  const t = useT();
  const [amount, setAmount] = useState(
    r.invoiceAmount != null ? String(r.invoiceAmount) : "",
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paid = Boolean(r.invoicePaidAt);
  const sent = Boolean(r.invoiceSentAt);
  const parsedAmount = Number(amount);
  const amountOk = Number.isFinite(parsedAmount) && parsedAmount >= 1;

  const sendInvoice = async () => {
    if (!amountOk || sending) return;
    if (sent && !paid && !confirm(t("admin.invConfirmResend"))) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/custom-orders/${r.id}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
    } catch {
      setError(t("admin.invError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-2">
      {sent && (
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span className="text-text">
            ${(r.invoiceAmount ?? 0).toFixed(2)}
          </span>
          <span className="text-text-faint">
            {t("admin.invSentAt")}:{" "}
            {new Date(r.invoiceSentAt!).toLocaleDateString()}
          </span>
          {paid ? (
            <span className="text-green-400 border border-green-400/30 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider">
              {t("admin.invPaidAt")}:{" "}
              {new Date(r.invoicePaidAt!).toLocaleDateString()}
            </span>
          ) : (
            r.invoiceUrl && (
              <a
                href={r.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold hover:text-gold-light"
              >
                {t("admin.invOpen")}
              </a>
            )
          )}
        </div>
      )}
      {!paid && (
        <div className="flex items-stretch gap-2">
          <input
            type="number"
            min={1}
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t("admin.invAmountPh")}
            aria-label={t("admin.invAmountPh")}
            className="w-44 glass-card rounded-lg px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
          />
          <button
            onClick={sendInvoice}
            disabled={sending || !amountOk}
            className="text-xs font-semibold uppercase tracking-wider px-4 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 disabled:opacity-40 transition-colors"
          >
            {sending
              ? t("admin.invSending")
              : sent
                ? t("admin.invResend")
                : t("admin.invSend")}
          </button>
        </div>
      )}
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  );
}

function AdminNotesField({
  initial,
  onSave,
  busy,
}: {
  initial: string;
  onSave: (v: string) => void;
  busy: boolean;
}) {
  const t = useT();
  const [value, setValue] = useState(initial);
  const dirty = value !== initial;
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder={t("admin.customAdminNotesPh")}
        className="w-full glass-card rounded-lg px-3 py-2 text-sm focus:border-gold/40 focus:outline-none resize-none"
      />
      {dirty && (
        <button
          onClick={() => onSave(value)}
          disabled={busy}
          className="text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-light"
        >
          {busy ? t("admin.saving") : t("admin.save")}
        </button>
      )}
    </div>
  );
}
