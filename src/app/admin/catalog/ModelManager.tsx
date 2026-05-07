"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import {
  CATEGORIES,
  slugify,
  type BrandRow,
  type Category,
  type ModelRow,
} from "./types";

interface ModelForm {
  brandId: string;
  slug: string;
  name: string;
  bodyType: string;
  category: Category;
  years: string;
}

const empty = (firstBrandId: string): ModelForm => ({
  brandId: firstBrandId,
  slug: "",
  name: "",
  bodyType: "",
  category: "car",
  years: "",
});

export function ModelManager({
  initial,
  brands,
}: {
  initial: ModelRow[];
  brands: BrandRow[];
}) {
  const router = useRouter();
  const t = useT();
  const [busy, startBusy] = useTransition();
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<ModelForm>(() => empty(brands[0]?.id ?? ""));
  const [error, setError] = useState<string | null>(null);

  const startNew = () => {
    setError(null);
    setForm(empty(brands[0]?.id ?? ""));
    setEditId("new");
  };

  const startEdit = (m: ModelRow) => {
    setError(null);
    setForm({
      brandId: m.brandId,
      slug: m.slug,
      name: m.name,
      bodyType: m.bodyType,
      category: (CATEGORIES as readonly string[]).includes(m.category)
        ? (m.category as Category)
        : "car",
      years: m.years,
    });
    setEditId(m.id);
  };

  const cancel = () => {
    setEditId(null);
    setForm(empty(brands[0]?.id ?? ""));
    setError(null);
  };

  const submit = () => {
    setError(null);
    const slug = form.slug.trim() || slugify(form.name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError(t("admin.catalogErrSlug"));
      return;
    }
    if (form.name.trim().length < 1) {
      setError(t("admin.catalogErrName"));
      return;
    }
    if (!form.brandId) {
      setError(t("admin.catalogErrBrand"));
      return;
    }
    if (!/^\d{4}(?:\s*,\s*\d{4})*$/.test(form.years.trim())) {
      setError(t("admin.catalogErrYears"));
      return;
    }
    const payload = {
      brandId: form.brandId,
      slug,
      name: form.name.trim(),
      bodyType: form.bodyType.trim() || "—",
      category: form.category,
      years: form.years.trim(),
    };
    startBusy(async () => {
      const url =
        editId === "new"
          ? "/api/admin/catalog/models"
          : `/api/admin/catalog/models/${editId}`;
      const res = await fetch(url, {
        method: editId === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "slug_exists")
          setError(t("admin.catalogErrSlugExists"));
        else setError(data?.error ?? t("admin.catalogErrSave"));
        return;
      }
      cancel();
      router.refresh();
    });
  };

  const remove = (m: ModelRow) => {
    if (!confirm(t("admin.catalogConfirmDeleteModel", { name: m.name }))) return;
    startBusy(async () => {
      const res = await fetch(`/api/admin/catalog/models/${m.id}`, {
        method: "DELETE",
        headers: { "x-csrf": "1" },
      });
      if (res.ok) router.refresh();
    });
  };

  const input =
    "w-full glass-card rounded-lg px-3 py-2 text-sm focus:border-gold/40 focus:outline-none";
  const labelCls =
    "block text-[10px] uppercase tracking-wider text-text-faint mb-1";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {editId === null && (
          <button
            type="button"
            onClick={startNew}
            disabled={brands.length === 0}
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg disabled:opacity-50"
            title={brands.length === 0 ? t("admin.catalogModelNeedBrand") : ""}
          >
            {t("admin.catalogModelNew")}
          </button>
        )}
      </div>

      {editId !== null && (
        <div className="glass-card rounded-xl p-5 border-gold/30 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
            {editId === "new"
              ? t("admin.catalogModelNew")
              : t("admin.catalogModelEdit")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t("admin.catalogFBrand")}</label>
              <select
                value={form.brandId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, brandId: e.target.value }))
                }
                className={input}
                aria-label={t("admin.catalogFBrand")}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("admin.catalogFName")}</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    name: e.target.value,
                    slug:
                      editId === "new" && p.slug === slugify(p.name)
                        ? slugify(e.target.value)
                        : p.slug,
                  }))
                }
                className={input}
                aria-label={t("admin.catalogFName")}
              />
            </div>
            <div>
              <label className={labelCls}>{t("admin.catalogFSlug")}</label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
                className={input}
                aria-label={t("admin.catalogFSlug")}
              />
            </div>
            <div>
              <label className={labelCls}>{t("admin.catalogFCategory")}</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value as Category }))
                }
                className={input}
                aria-label={t("admin.catalogFCategory")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`catalog.filter.${c}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("admin.catalogFBodyType")}</label>
              <input
                value={form.bodyType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bodyType: e.target.value }))
                }
                placeholder="Sedan, SUV, Pickup…"
                className={input}
                aria-label={t("admin.catalogFBodyType")}
              />
            </div>
            <div>
              <label className={labelCls}>{t("admin.catalogFYears")}</label>
              <input
                value={form.years}
                onChange={(e) =>
                  setForm((p) => ({ ...p, years: e.target.value }))
                }
                placeholder="2020,2021,2022,2023,2024"
                className={input}
                aria-label={t("admin.catalogFYears")}
              />
            </div>
          </div>
          {error && (
            <div className="text-error text-xs glass-card rounded-lg px-3 py-2 border-error/30">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="px-4 py-2 text-xs uppercase tracking-wider text-text-dim hover:text-error"
            >
              {t("admin.catalogBtnCancel")}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {busy
                ? t("admin.catalogBtnSaving")
                : editId === "new"
                  ? t("admin.catalogBtnCreate")
                  : t("admin.catalogBtnSave")}
            </button>
          </div>
        </div>
      )}

      {initial.length === 0 && editId === null ? (
        <div className="glass-card rounded-xl p-12 text-center text-text-dim text-sm">
          {brands.length === 0
            ? t("admin.catalogModelNeedBrand")
            : t("admin.catalogModelsEmpty")}
        </div>
      ) : (
        <ul className="glass-card rounded-xl divide-y divide-border/30">
          {initial.map((m) => (
            <li
              key={m.id}
              className="px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-text font-medium text-sm">
                  <span className="text-gold/70 mr-1.5">{m.brandName}</span>
                  {m.name}{" "}
                  <span className="text-text-faint text-[11px] font-mono">
                    /{m.slug}
                  </span>
                </div>
                <div className="text-text-faint text-[11px] mt-0.5">
                  {m.bodyType} · {m.category} · {m.years}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(m)}
                  disabled={busy}
                  className="px-2 py-1 text-text-dim hover:text-gold text-[11px] uppercase tracking-wider"
                >
                  {t("admin.catalogBtnEdit")}
                </button>
                <button
                  type="button"
                  onClick={() => remove(m)}
                  disabled={busy}
                  className="px-2 py-1 text-text-faint hover:text-error text-[11px] uppercase tracking-wider"
                >
                  {t("admin.catalogBtnDelete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
