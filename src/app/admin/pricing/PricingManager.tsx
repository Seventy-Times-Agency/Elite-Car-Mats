"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/pricing";
import { useT } from "@/i18n/I18nProvider";

export interface PriceRow {
  matSet: string;
  label: string;
  /** Code-based default price (`src/data/catalog/mat-sets.ts`). */
  defaultPrice: number;
  /** Admin override or null = no override → defaultPrice applies. */
  override: number | null;
}

export interface ProfileBlock {
  profile: string;
  label: string;
  rows: PriceRow[];
}

interface AddonPrice {
  defaultPrice: number;
  override: number | null;
}

interface AddonRows {
  badge: AddonPrice;
  heelPad: AddonPrice;
}

export interface AddonAvailabilityProps {
  badges: boolean;
  heelPad: boolean;
}

export function PricingManager({
  profiles,
  addons,
  availability,
}: {
  profiles: ProfileBlock[];
  addons: AddonRows;
  availability: AddonAvailabilityProps;
}) {
  const t = useT();
  const router = useRouter();
  const [busy, startBusy] = useTransition();

  const toggleAvailability = (key: "badges" | "heelPad", value: boolean) => {
    startBusy(async () => {
      await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      router.refresh();
    });
  };
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const startEdit = (profile: string, matSet: string, current: number) => {
    setEditingKey(`${profile}:${matSet}`);
    setDraft(String(current));
    setError(null);
  };

  const cancel = () => {
    setEditingKey(null);
    setDraft("");
    setError(null);
  };

  const save = (profile: string, matSet: string) => {
    setError(null);
    const trimmed = draft.trim();
    let payload: { profile: string; matSet: string; price: number | null };
    if (trimmed === "") {
      payload = { profile, matSet, price: null };
    } else {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n < 0 || n > 99_999) {
        setError(t("admin.pricingErrInvalid"));
        return;
      }
      payload = { profile, matSet, price: Math.round(n * 100) / 100 };
    }
    startBusy(async () => {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? t("admin.pricingErrSave"));
        return;
      }
      cancel();
      router.refresh();
    });
  };

  const clearOverride = (profile: string, matSet: string) => {
    if (!confirm(t("admin.pricingConfirmClear"))) return;
    startBusy(async () => {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify({ profile, matSet, price: null }),
      });
      if (res.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs text-gold/85 leading-relaxed">
        <strong className="font-semibold">{t("admin.pricingNoticeH")}:</strong>{" "}
        {t("admin.pricingNoticeP")}
      </div>
      <div className="rounded-xl border border-border/50 bg-surface/30 px-4 py-3 text-[11px] text-text-dim leading-relaxed flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold uppercase tracking-wider text-text">
          {t("admin.pricingFeedH")}
        </span>
        <span>{t("admin.pricingFeedP")}</span>
        <a
          href="/api/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:text-gold-light underline underline-offset-2 font-mono"
        >
          /api/feed.xml
        </a>
      </div>

      {profiles.map((p) => (
        <section key={p.profile}>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-semibold mb-2.5">
            {p.label}
          </h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface/40 text-text-faint text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2.5">
                    {t("admin.pricingColType")}
                  </th>
                  <th className="text-left px-4 py-2.5">
                    {t("admin.pricingColLabel")}
                  </th>
                  <th className="text-right px-4 py-2.5 hidden sm:table-cell">
                    {t("admin.pricingColDefault")}
                  </th>
                  <th className="text-right px-4 py-2.5">
                    {t("admin.pricingColLive")}
                  </th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {p.rows.map((r) => {
                  const key = `${p.profile}:${r.matSet}`;
                  const live = r.override ?? r.defaultPrice;
                  const isEditing = editingKey === key;
                  return (
                    <tr key={key}>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-text-faint">
                        {r.matSet}
                      </td>
                      <td className="px-4 py-2.5 text-text">{r.label}</td>
                      <td className="px-4 py-2.5 text-right text-text-faint hidden sm:table-cell">
                        {formatPrice(r.defaultPrice)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            autoFocus
                            className="w-24 glass-card rounded-md px-2 py-1 text-sm text-right focus:border-gold/40 focus:outline-none"
                            aria-label={t("admin.pricingColLive")}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            {r.override !== null && (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/15 text-gold">
                                {t("admin.pricingOverride")}
                              </span>
                            )}
                            <span
                              className={`font-semibold ${r.override !== null ? "text-gold" : "text-text"}`}
                            >
                              {formatPrice(live)}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        {isEditing ? (
                          <span className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={() => save(p.profile, r.matSet)}
                              disabled={busy}
                              className="text-gold text-[11px] font-semibold uppercase tracking-wider px-2 py-1 hover:text-gold-light disabled:opacity-50"
                            >
                              {t("admin.pricingBtnSave")}
                            </button>
                            <button
                              type="button"
                              onClick={cancel}
                              disabled={busy}
                              className="text-text-faint text-[11px] uppercase tracking-wider px-2 py-1 hover:text-error"
                            >
                              {t("admin.pricingBtnCancel")}
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(p.profile, r.matSet, live)}
                              disabled={busy}
                              className="text-text-dim text-[11px] uppercase tracking-wider px-2 py-1 hover:text-gold"
                            >
                              {t("admin.pricingBtnEdit")}
                            </button>
                            {r.override !== null && (
                              <button
                                type="button"
                                onClick={() => clearOverride(p.profile, r.matSet)}
                                disabled={busy}
                                className="text-text-faint text-[11px] uppercase tracking-wider px-2 py-1 hover:text-error"
                              >
                                {t("admin.pricingBtnReset")}
                              </button>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-semibold mb-2.5">
          {t("admin.pricingAddonsH")}
        </h2>
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/30">
              {(
                [
                  {
                    matSet: "badge",
                    label: t("admin.pricingMetallicBadge"),
                    price: addons.badge,
                    availKey: "badges" as const,
                    available: availability.badges,
                  },
                  {
                    matSet: "heelPad",
                    label: t("admin.pricingHeelPad"),
                    price: addons.heelPad,
                    availKey: "heelPad" as const,
                    available: availability.heelPad,
                  },
                ]
              ).map((row) => {
                const key = `addon:${row.matSet}`;
                const live = row.price.override ?? row.price.defaultPrice;
                const isEditing = editingKey === key;
                return (
                  <tr key={key}>
                    <td className="px-4 py-2.5 text-text">{row.label}</td>
                    <td className="px-4 py-2.5 text-right text-text-faint hidden sm:table-cell">
                      +{formatPrice(row.price.defaultPrice)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          autoFocus
                          className="w-24 glass-card rounded-md px-2 py-1 text-sm text-right focus:border-gold/40 focus:outline-none"
                          aria-label={t("admin.pricingColLive")}
                        />
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          {row.price.override !== null && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/15 text-gold">
                              {t("admin.pricingOverride")}
                            </span>
                          )}
                          <span
                            className={`font-semibold ${row.price.override !== null ? "text-gold" : "text-gold/80"}`}
                          >
                            +{formatPrice(live)}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      {isEditing ? (
                        <span className="inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() => save("addon", row.matSet)}
                            disabled={busy}
                            className="text-gold text-[11px] font-semibold uppercase tracking-wider px-2 py-1 hover:text-gold-light disabled:opacity-50"
                          >
                            {t("admin.pricingBtnSave")}
                          </button>
                          <button
                            type="button"
                            onClick={cancel}
                            disabled={busy}
                            className="text-text-faint text-[11px] uppercase tracking-wider px-2 py-1 hover:text-error"
                          >
                            {t("admin.pricingBtnCancel")}
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit("addon", row.matSet, live)}
                            disabled={busy}
                            className="text-text-dim text-[11px] uppercase tracking-wider px-2 py-1 hover:text-gold"
                          >
                            {t("admin.pricingBtnEdit")}
                          </button>
                          {row.price.override !== null && (
                            <button
                              type="button"
                              onClick={() => clearOverride("addon", row.matSet)}
                              disabled={busy}
                              className="text-text-faint text-[11px] uppercase tracking-wider px-2 py-1 hover:text-error"
                            >
                              {t("admin.pricingBtnReset")}
                            </button>
                          )}
                          <button
                            onClick={() => toggleAvailability(row.availKey, !row.available)}
                            disabled={busy}
                            className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
                              row.available
                                ? "border-green-400/40 text-green-400 hover:border-green-400"
                                : "border-error/40 text-error hover:border-error"
                            }`}
                          >
                            {row.available
                              ? t("admin.availInStock")
                              : t("admin.availOut")}
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[10px] text-text-faint">
          {t("admin.pricingAddonsNote")}
        </p>
      </section>

      {error && (
        <div className="text-error text-xs glass-card rounded-lg px-3 py-2 border-error/30">
          {error}
        </div>
      )}
    </div>
  );
}
