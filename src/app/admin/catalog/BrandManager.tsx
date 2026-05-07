"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { CATEGORIES, slugify, type BrandRow } from "./types";

interface BrandForm {
  slug: string;
  name: string;
  logo: string;
  popularity: string;
  categories: string[];
}

const EMPTY: BrandForm = {
  slug: "",
  name: "",
  logo: "",
  popularity: "",
  categories: [],
};

export function BrandManager({
  initial,
  reservedSlugs,
}: {
  initial: BrandRow[];
  reservedSlugs: string[];
}) {
  const router = useRouter();
  const t = useT();
  const [busy, startBusy] = useTransition();
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<BrandForm>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const startNew = () => {
    setError(null);
    setForm(EMPTY);
    setEditId("new");
  };

  const startEdit = (b: BrandRow) => {
    setError(null);
    setForm({
      slug: b.slug,
      name: b.name,
      logo: b.logo ?? "",
      popularity: b.popularity != null ? String(b.popularity) : "",
      categories: b.categories,
    });
    setEditId(b.id);
  };

  const cancel = () => {
    setEditId(null);
    setForm(EMPTY);
    setError(null);
  };

  const submit = () => {
    setError(null);
    const slug = form.slug.trim() || slugify(form.name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError(t("admin.catalogErrSlug"));
      return;
    }
    if (reservedSlugs.includes(slug) && editId === "new") {
      setError(t("admin.catalogErrSlugReserved"));
      return;
    }
    if (form.name.trim().length < 2) {
      setError(t("admin.catalogErrName"));
      return;
    }
    const payload: Record<string, unknown> = {
      slug,
      name: form.name.trim(),
      logo: form.logo.trim() || null,
      popularity:
        form.popularity.trim() === "" ? null : Number(form.popularity),
      categories: form.categories,
    };
    if (
      payload.popularity !== null &&
      !Number.isFinite(payload.popularity)
    ) {
      setError(t("admin.catalogErrPopularity"));
      return;
    }

    startBusy(async () => {
      const url =
        editId === "new"
          ? "/api/admin/catalog/brands"
          : `/api/admin/catalog/brands/${editId}`;
      const res = await fetch(url, {
        method: editId === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "slug_exists")
          setError(t("admin.catalogErrSlugExists"));
        else if (data?.error === "slug_reserved_by_code")
          setError(t("admin.catalogErrSlugReserved"));
        else setError(data?.error ?? t("admin.catalogErrSave"));
        return;
      }
      cancel();
      router.refresh();
    });
  };

  const remove = (b: BrandRow) => {
    if (
      !confirm(
        t("admin.catalogConfirmDeleteBrand", {
          name: b.name,
          n: b.modelsCount,
        }),
      )
    )
      return;
    startBusy(async () => {
      const res = await fetch(`/api/admin/catalog/brands/${b.id}`, {
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
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg"
          >
            {t("admin.catalogBrandNew")}
          </button>
        )}
      </div>

      {editId !== null && (
        <div className="glass-card rounded-xl p-5 border-gold/30 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
            {editId === "new"
              ? t("admin.catalogBrandNew")
              : t("admin.catalogBrandEdit")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className={labelCls}>{t("admin.catalogFLogo")}</label>
              <input
                value={form.logo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, logo: e.target.value }))
                }
                placeholder="https://…"
                className={input}
                aria-label={t("admin.catalogFLogo")}
              />
            </div>
            <div>
              <label className={labelCls}>
                {t("admin.catalogFPopularity")}
              </label>
              <input
                value={form.popularity}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    popularity: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                className={input}
                aria-label={t("admin.catalogFPopularity")}
                placeholder="999"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>
                {t("admin.catalogFCategories")}
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const active = form.categories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          categories: active
                            ? p.categories.filter((x) => x !== c)
                            : [...p.categories, c],
                        }))
                      }
                      aria-pressed={active}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${active ? "bg-gradient-to-r from-gold to-gold-light text-bg" : "glass-card text-text-dim hover:text-gold"}`}
                    >
                      {t(`catalog.filter.${c}`)}
                    </button>
                  );
                })}
              </div>
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
          {t("admin.catalogBrandsEmpty")}
        </div>
      ) : (
        <ul className="glass-card rounded-xl divide-y divide-border/30">
          {initial.map((b) => (
            <li
              key={b.id}
              className="px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-text font-medium text-sm">
                  {b.name}{" "}
                  <span className="text-text-faint text-[11px] font-mono">
                    /{b.slug}
                  </span>
                </div>
                <div className="text-text-faint text-[11px] mt-0.5">
                  {t("admin.catalogModelsCount", { n: b.modelsCount })}
                  {b.popularity != null
                    ? ` · ${t("admin.catalogPopRank")} ${b.popularity}`
                    : ""}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(b)}
                  disabled={busy}
                  className="px-2 py-1 text-text-dim hover:text-gold text-[11px] uppercase tracking-wider"
                >
                  {t("admin.catalogBtnEdit")}
                </button>
                <button
                  type="button"
                  onClick={() => remove(b)}
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
