"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

export interface Promo {
  id: string;
  code: string;
  discount: number;
  description: string | null;
  maxUses: number | null;
  usedCount: number;
  minOrder: number | null;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface FormState {
  code: string;
  discount: string;
  description: string;
  maxUses: string;
  minOrder: string;
  expiresAt: string;
  active: boolean;
}

const EMPTY_FORM: FormState = {
  code: "",
  discount: "10",
  description: "",
  maxUses: "",
  minOrder: "",
  expiresAt: "",
  active: true,
};

export function PromosManager({ initial }: { initial: Promo[] }) {
  const router = useRouter();
  const t = useT();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();
  // Inline edit of an existing promo. The code itself stays immutable —
  // order history references promos by code string.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editError, setEditError] = useState<string | null>(null);

  const startEdit = (p: Promo) => {
    setEditingId(p.id);
    setEditError(null);
    setEditForm({
      code: p.code,
      discount: String(p.discount),
      description: p.description ?? "",
      maxUses: p.maxUses !== null ? String(p.maxUses) : "",
      minOrder: p.minOrder !== null ? String(p.minOrder) : "",
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : "",
      active: p.active,
    });
  };

  const saveEdit = (id: string) => {
    setEditError(null);
    const discount = parseInt(editForm.discount, 10);
    if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
      setEditError(t("admin.promosErrInvalid"));
      return;
    }
    startBusy(async () => {
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discount,
          description: editForm.description.trim() || null,
          maxUses: editForm.maxUses ? parseInt(editForm.maxUses, 10) : null,
          minOrder: editForm.minOrder ? parseFloat(editForm.minOrder) : null,
          active: editForm.active,
          expiresAt: editForm.expiresAt
            ? new Date(editForm.expiresAt).toISOString()
            : null,
        }),
      });
      if (!res.ok) {
        setEditError(t("admin.promosErrSave"));
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  };

  const input =
    "w-full glass-card rounded-lg px-3 py-2 text-sm focus:border-gold/40 focus:outline-none";
  const label = "block text-[10px] uppercase tracking-wider text-text-faint mb-1";

  const submit = () => {
    setError(null);
    const code = form.code.trim().toUpperCase();
    const discount = parseInt(form.discount, 10);
    if (!code || !Number.isFinite(discount) || discount < 1 || discount > 100) {
      setError(t("admin.promosErrInvalid"));
      return;
    }
    startBusy(async () => {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discount,
          description: form.description.trim() || null,
          maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
          minOrder: form.minOrder ? parseFloat(form.minOrder) : null,
          active: form.active,
          expiresAt: form.expiresAt
            ? new Date(form.expiresAt).toISOString()
            : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "code_exists"
            ? t("admin.promosErrExists")
            : t("admin.promosErrSave"),
        );
        return;
      }
      setForm(EMPTY_FORM);
      setCreating(false);
      router.refresh();
    });
  };

  const toggle = (id: string, active: boolean) => {
    startBusy(async () => {
      await fetch(`/api/admin/promos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!confirm(t("admin.promosConfirmDelete"))) return;
    startBusy(async () => {
      await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setCreating((p) => !p)}
          className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg"
        >
          {creating ? t("admin.promosCancel") : t("admin.promosNew")}
        </button>
      </div>

      {creating && (
        <div className="glass-card rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>{t("admin.promosFieldCode")}</label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                placeholder="SUMMER10"
                className={input}
              />
            </div>
            <div>
              <label className={label}>
                {t("admin.promosFieldDiscount")}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.discount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discount: e.target.value }))
                }
                className={input}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>
                {t("admin.promosFieldDescription")}
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder={t("admin.promosFieldDescriptionPh")}
                className={input}
              />
            </div>
            <div>
              <label className={label}>{t("admin.promosFieldMaxUses")}</label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxUses: e.target.value }))
                }
                placeholder={t("admin.promosUnlimited")}
                className={input}
              />
            </div>
            <div>
              <label className={label}>{t("admin.promosFieldMinOrder")}</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.minOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minOrder: e.target.value }))
                }
                placeholder="0"
                className={input}
              />
            </div>
            <div>
              <label className={label}>{t("admin.promosFieldExpires")}</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiresAt: e.target.value }))
                }
                className={input}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
                className="accent-gold"
              />
              <label htmlFor="active" className="text-sm text-text-dim">
                {t("admin.promosFieldActive")}
              </label>
            </div>
          </div>
          {error && <div className="text-xs text-error">{error}</div>}
          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={busy}
              className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg disabled:opacity-40"
            >
              {busy ? t("admin.saving") : t("admin.promosCreate")}
            </button>
          </div>
        </div>
      )}

      {initial.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-text-dim">
          {t("admin.promosEmpty")}
        </div>
      ) : (
        <div className="space-y-2">
          {initial.map((p) => {
            const expired = p.expiresAt && new Date(p.expiresAt) < new Date();
            const usedUp = p.maxUses !== null && p.usedCount >= p.maxUses;
            const deadish = !p.active || expired || usedUp;
            return (
              <div
                key={p.id}
                className={`glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap ${
                  deadish ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-gold font-mono text-base">
                      {p.code}
                    </span>
                    <span className="text-text font-semibold">
                      −{p.discount}%
                    </span>
                    {!p.active && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-text-faint/30 text-text-faint">
                        {t("admin.promosInactive")}
                      </span>
                    )}
                    {expired && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-error/30 text-error">
                        {t("admin.promosExpired")}
                      </span>
                    )}
                    {usedUp && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-error/30 text-error">
                        {t("admin.promosUsedUp")}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-dim mt-1">
                    {p.description && <span>{p.description} · </span>}
                    {t("admin.promosUsedCount", {
                      n: String(p.usedCount),
                      max: p.maxUses !== null ? String(p.maxUses) : "∞",
                    })}
                    {p.minOrder ? ` · min $${p.minOrder}` : ""}
                    {p.expiresAt
                      ? ` · до ${new Date(p.expiresAt).toLocaleDateString()}`
                      : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      editingId === p.id ? setEditingId(null) : startEdit(p)
                    }
                    disabled={busy}
                    className="text-xs text-text-dim hover:text-gold uppercase tracking-wider"
                  >
                    {editingId === p.id
                      ? t("admin.promosCancel")
                      : t("admin.promosEdit")}
                  </button>
                  <button
                    onClick={() => toggle(p.id, !p.active)}
                    disabled={busy}
                    className="text-xs text-text-dim hover:text-gold uppercase tracking-wider"
                  >
                    {p.active
                      ? t("admin.promosDisable")
                      : t("admin.promosEnable")}
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    disabled={busy}
                    className="text-xs text-text-dim hover:text-error uppercase tracking-wider"
                  >
                    {t("admin.promosDelete")}
                  </button>
                </div>
                {editingId === p.id && (
                  <div className="w-full pt-3 mt-1 border-t border-border/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={label}>
                          {t("admin.promosFieldDiscount")}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={editForm.discount}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, discount: e.target.value }))
                          }
                          className={input}
                        />
                      </div>
                      <div>
                        <label className={label}>
                          {t("admin.promosFieldMaxUses")}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={editForm.maxUses}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, maxUses: e.target.value }))
                          }
                          placeholder={t("admin.promosUnlimited")}
                          className={input}
                        />
                      </div>
                      <div>
                        <label className={label}>
                          {t("admin.promosFieldExpires")}
                        </label>
                        <input
                          type="date"
                          value={editForm.expiresAt}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, expiresAt: e.target.value }))
                          }
                          className={input}
                        />
                      </div>
                      <div>
                        <label className={label}>
                          {t("admin.promosFieldMinOrder")}
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={editForm.minOrder}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, minOrder: e.target.value }))
                          }
                          placeholder="0"
                          className={input}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={label}>
                          {t("admin.promosFieldDescription")}
                        </label>
                        <input
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          className={input}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm text-text-dim">
                        <input
                          type="checkbox"
                          checked={editForm.active}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, active: e.target.checked }))
                          }
                          className="accent-gold"
                        />
                        {t("admin.promosFieldActive")}
                      </label>
                      <div className="flex items-center gap-3">
                        {editError && (
                          <span className="text-xs text-error">{editError}</span>
                        )}
                        <button
                          onClick={() => saveEdit(p.id)}
                          disabled={busy}
                          className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg disabled:opacity-40"
                        >
                          {busy ? t("admin.saving") : t("admin.save")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
