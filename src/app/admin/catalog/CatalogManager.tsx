"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

export interface BrandRow {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  popularity: number | null;
  categories: string[];
  modelsCount: number;
}

export interface ModelRow {
  id: string;
  brandId: string;
  brandName: string;
  slug: string;
  name: string;
  bodyType: string;
  category: string;
  years: string;
}

const CATEGORIES = ["car", "suv", "truck", "commercial"] as const;

interface BrandForm {
  slug: string;
  name: string;
  logo: string;
  popularity: string;
  categories: string[];
}

interface ModelForm {
  brandId: string;
  slug: string;
  name: string;
  bodyType: string;
  category: (typeof CATEGORIES)[number];
  years: string;
}

const EMPTY_BRAND: BrandForm = {
  slug: "",
  name: "",
  logo: "",
  popularity: "",
  categories: [],
};

const EMPTY_MODEL: ModelForm = {
  brandId: "",
  slug: "",
  name: "",
  bodyType: "",
  category: "car",
  years: "",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function CatalogManager({
  initialBrands,
  initialModels,
  reservedBrandSlugs,
}: {
  initialBrands: BrandRow[];
  initialModels: ModelRow[];
  reservedBrandSlugs: string[];
}) {
  const router = useRouter();
  const t = useT();
  const [tab, setTab] = useState<"brands" | "models">("brands");
  const [busy, startBusy] = useTransition();

  // ---------- BRAND state ---------------------------------------------
  const [brandEditId, setBrandEditId] = useState<string | "new" | null>(null);
  const [brandForm, setBrandForm] = useState<BrandForm>(EMPTY_BRAND);
  const [brandError, setBrandError] = useState<string | null>(null);

  const startNewBrand = () => {
    setBrandError(null);
    setBrandForm(EMPTY_BRAND);
    setBrandEditId("new");
  };

  const startEditBrand = (b: BrandRow) => {
    setBrandError(null);
    setBrandForm({
      slug: b.slug,
      name: b.name,
      logo: b.logo ?? "",
      popularity: b.popularity != null ? String(b.popularity) : "",
      categories: b.categories,
    });
    setBrandEditId(b.id);
  };

  const cancelBrand = () => {
    setBrandEditId(null);
    setBrandForm(EMPTY_BRAND);
    setBrandError(null);
  };

  const submitBrand = () => {
    setBrandError(null);
    const slug = brandForm.slug.trim() || slugify(brandForm.name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setBrandError(t("admin.catalogErrSlug"));
      return;
    }
    if (reservedBrandSlugs.includes(slug) && brandEditId === "new") {
      setBrandError(t("admin.catalogErrSlugReserved"));
      return;
    }
    if (brandForm.name.trim().length < 2) {
      setBrandError(t("admin.catalogErrName"));
      return;
    }
    const payload: Record<string, unknown> = {
      slug,
      name: brandForm.name.trim(),
      logo: brandForm.logo.trim() || null,
      popularity:
        brandForm.popularity.trim() === ""
          ? null
          : Number(brandForm.popularity),
      categories: brandForm.categories,
    };
    if (
      payload.popularity !== null &&
      !Number.isFinite(payload.popularity)
    ) {
      setBrandError(t("admin.catalogErrPopularity"));
      return;
    }
    startBusy(async () => {
      const url =
        brandEditId === "new"
          ? "/api/admin/catalog/brands"
          : `/api/admin/catalog/brands/${brandEditId}`;
      const res = await fetch(url, {
        method: brandEditId === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "slug_exists") setBrandError(t("admin.catalogErrSlugExists"));
        else if (data?.error === "slug_reserved_by_code")
          setBrandError(t("admin.catalogErrSlugReserved"));
        else setBrandError(data?.error ?? t("admin.catalogErrSave"));
        return;
      }
      cancelBrand();
      router.refresh();
    });
  };

  const removeBrand = (b: BrandRow) => {
    if (
      !confirm(
        t("admin.catalogConfirmDeleteBrand", { name: b.name, n: b.modelsCount }),
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

  // ---------- MODEL state ---------------------------------------------
  const [modelEditId, setModelEditId] = useState<string | "new" | null>(null);
  const [modelForm, setModelForm] = useState<ModelForm>(EMPTY_MODEL);
  const [modelError, setModelError] = useState<string | null>(null);

  const startNewModel = () => {
    setModelError(null);
    setModelForm({
      ...EMPTY_MODEL,
      brandId: initialBrands[0]?.id ?? "",
    });
    setModelEditId("new");
  };

  const startEditModel = (m: ModelRow) => {
    setModelError(null);
    setModelForm({
      brandId: m.brandId,
      slug: m.slug,
      name: m.name,
      bodyType: m.bodyType,
      category: (CATEGORIES as readonly string[]).includes(m.category)
        ? (m.category as (typeof CATEGORIES)[number])
        : "car",
      years: m.years,
    });
    setModelEditId(m.id);
  };

  const cancelModel = () => {
    setModelEditId(null);
    setModelForm(EMPTY_MODEL);
    setModelError(null);
  };

  const submitModel = () => {
    setModelError(null);
    const slug = modelForm.slug.trim() || slugify(modelForm.name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setModelError(t("admin.catalogErrSlug"));
      return;
    }
    if (modelForm.name.trim().length < 1) {
      setModelError(t("admin.catalogErrName"));
      return;
    }
    if (!modelForm.brandId) {
      setModelError(t("admin.catalogErrBrand"));
      return;
    }
    if (!/^\d{4}(?:\s*,\s*\d{4})*$/.test(modelForm.years.trim())) {
      setModelError(t("admin.catalogErrYears"));
      return;
    }
    const payload = {
      brandId: modelForm.brandId,
      slug,
      name: modelForm.name.trim(),
      bodyType: modelForm.bodyType.trim() || "—",
      category: modelForm.category,
      years: modelForm.years.trim(),
    };
    startBusy(async () => {
      const url =
        modelEditId === "new"
          ? "/api/admin/catalog/models"
          : `/api/admin/catalog/models/${modelEditId}`;
      const res = await fetch(url, {
        method: modelEditId === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "slug_exists")
          setModelError(t("admin.catalogErrSlugExists"));
        else setModelError(data?.error ?? t("admin.catalogErrSave"));
        return;
      }
      cancelModel();
      router.refresh();
    });
  };

  const removeModel = (m: ModelRow) => {
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

  // -------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs text-gold/85 leading-relaxed">
        <strong className="font-semibold">{t("admin.catalogNoticeH")}:</strong>{" "}
        {t("admin.catalogNoticeP")}
      </div>

      {/* Tab switcher */}
      <div className="inline-flex rounded-lg border border-border/60 p-0.5 text-[11px] font-semibold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setTab("brands")}
          aria-pressed={tab === "brands"}
          className={`px-4 py-1.5 rounded-md ${tab === "brands" ? "bg-gold/15 text-gold" : "text-text-dim hover:text-gold"}`}
        >
          {t("admin.catalogTabBrands")} · {initialBrands.length}
        </button>
        <button
          type="button"
          onClick={() => setTab("models")}
          aria-pressed={tab === "models"}
          className={`px-4 py-1.5 rounded-md ${tab === "models" ? "bg-gold/15 text-gold" : "text-text-dim hover:text-gold"}`}
        >
          {t("admin.catalogTabModels")} · {initialModels.length}
        </button>
      </div>

      {tab === "brands" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            {brandEditId === null && (
              <button
                type="button"
                onClick={startNewBrand}
                className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg"
              >
                {t("admin.catalogBrandNew")}
              </button>
            )}
          </div>

          {brandEditId !== null && (
            <div className="glass-card rounded-xl p-5 border-gold/30 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
                {brandEditId === "new"
                  ? t("admin.catalogBrandNew")
                  : t("admin.catalogBrandEdit")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t("admin.catalogFName")}</label>
                  <input
                    value={brandForm.name}
                    onChange={(e) =>
                      setBrandForm((p) => ({
                        ...p,
                        name: e.target.value,
                        slug:
                          brandEditId === "new" && p.slug === slugify(p.name)
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
                    value={brandForm.slug}
                    onChange={(e) =>
                      setBrandForm((p) => ({
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
                    value={brandForm.logo}
                    onChange={(e) =>
                      setBrandForm((p) => ({ ...p, logo: e.target.value }))
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
                    value={brandForm.popularity}
                    onChange={(e) =>
                      setBrandForm((p) => ({
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
                      const active = brandForm.categories.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setBrandForm((p) => ({
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
              {brandError && (
                <div className="text-error text-xs glass-card rounded-lg px-3 py-2 border-error/30">
                  {brandError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelBrand}
                  disabled={busy}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-text-dim hover:text-error"
                >
                  {t("admin.catalogBtnCancel")}
                </button>
                <button
                  type="button"
                  onClick={submitBrand}
                  disabled={busy}
                  className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-5 py-2 rounded-lg disabled:opacity-50"
                >
                  {busy
                    ? t("admin.catalogBtnSaving")
                    : brandEditId === "new"
                      ? t("admin.catalogBtnCreate")
                      : t("admin.catalogBtnSave")}
                </button>
              </div>
            </div>
          )}

          {initialBrands.length === 0 && brandEditId === null ? (
            <div className="glass-card rounded-xl p-12 text-center text-text-dim text-sm">
              {t("admin.catalogBrandsEmpty")}
            </div>
          ) : (
            <ul className="glass-card rounded-xl divide-y divide-border/30">
              {initialBrands.map((b) => (
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
                      onClick={() => startEditBrand(b)}
                      disabled={busy}
                      className="px-2 py-1 text-text-dim hover:text-gold text-[11px] uppercase tracking-wider"
                    >
                      {t("admin.catalogBtnEdit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBrand(b)}
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
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            {modelEditId === null && (
              <button
                type="button"
                onClick={startNewModel}
                disabled={initialBrands.length === 0}
                className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg disabled:opacity-50"
                title={
                  initialBrands.length === 0
                    ? t("admin.catalogModelNeedBrand")
                    : ""
                }
              >
                {t("admin.catalogModelNew")}
              </button>
            )}
          </div>

          {modelEditId !== null && (
            <div className="glass-card rounded-xl p-5 border-gold/30 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
                {modelEditId === "new"
                  ? t("admin.catalogModelNew")
                  : t("admin.catalogModelEdit")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    {t("admin.catalogFBrand")}
                  </label>
                  <select
                    value={modelForm.brandId}
                    onChange={(e) =>
                      setModelForm((p) => ({ ...p, brandId: e.target.value }))
                    }
                    className={input}
                    aria-label={t("admin.catalogFBrand")}
                  >
                    {initialBrands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t("admin.catalogFName")}</label>
                  <input
                    value={modelForm.name}
                    onChange={(e) =>
                      setModelForm((p) => ({
                        ...p,
                        name: e.target.value,
                        slug:
                          modelEditId === "new" && p.slug === slugify(p.name)
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
                    value={modelForm.slug}
                    onChange={(e) =>
                      setModelForm((p) => ({
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
                  <label className={labelCls}>
                    {t("admin.catalogFCategory")}
                  </label>
                  <select
                    value={modelForm.category}
                    onChange={(e) =>
                      setModelForm((p) => ({
                        ...p,
                        category: e.target.value as (typeof CATEGORIES)[number],
                      }))
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
                  <label className={labelCls}>
                    {t("admin.catalogFBodyType")}
                  </label>
                  <input
                    value={modelForm.bodyType}
                    onChange={(e) =>
                      setModelForm((p) => ({ ...p, bodyType: e.target.value }))
                    }
                    placeholder="Sedan, SUV, Pickup…"
                    className={input}
                    aria-label={t("admin.catalogFBodyType")}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {t("admin.catalogFYears")}
                  </label>
                  <input
                    value={modelForm.years}
                    onChange={(e) =>
                      setModelForm((p) => ({ ...p, years: e.target.value }))
                    }
                    placeholder="2020,2021,2022,2023,2024"
                    className={input}
                    aria-label={t("admin.catalogFYears")}
                  />
                </div>
              </div>
              {modelError && (
                <div className="text-error text-xs glass-card rounded-lg px-3 py-2 border-error/30">
                  {modelError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelModel}
                  disabled={busy}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-text-dim hover:text-error"
                >
                  {t("admin.catalogBtnCancel")}
                </button>
                <button
                  type="button"
                  onClick={submitModel}
                  disabled={busy}
                  className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-5 py-2 rounded-lg disabled:opacity-50"
                >
                  {busy
                    ? t("admin.catalogBtnSaving")
                    : modelEditId === "new"
                      ? t("admin.catalogBtnCreate")
                      : t("admin.catalogBtnSave")}
                </button>
              </div>
            </div>
          )}

          {initialModels.length === 0 && modelEditId === null ? (
            <div className="glass-card rounded-xl p-12 text-center text-text-dim text-sm">
              {initialBrands.length === 0
                ? t("admin.catalogModelNeedBrand")
                : t("admin.catalogModelsEmpty")}
            </div>
          ) : (
            <ul className="glass-card rounded-xl divide-y divide-border/30">
              {initialModels.map((m) => (
                <li
                  key={m.id}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-text font-medium text-sm">
                      <span className="text-gold/70 mr-1.5">
                        {m.brandName}
                      </span>
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
                      onClick={() => startEditModel(m)}
                      disabled={busy}
                      className="px-2 py-1 text-text-dim hover:text-gold text-[11px] uppercase tracking-wider"
                    >
                      {t("admin.catalogBtnEdit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModel(m)}
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
      )}
    </div>
  );
}
