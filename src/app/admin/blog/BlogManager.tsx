"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

export interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  locale: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  locale: string; // "" = neutral / all
  published: boolean;
}

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  locale: "",
  published: false,
};

const LOCALE_CHOICES: { value: string; label: string }[] = [
  { value: "", label: "—" },
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
  { value: "uk", label: "UK" },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function BlogManager({ initial }: { initial: PostRow[] }) {
  const router = useRouter();
  const t = useT();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  const input =
    "w-full glass-card rounded-lg px-3 py-2 text-sm focus:border-gold/40 focus:outline-none";
  const labelCls =
    "block text-[10px] uppercase tracking-wider text-text-faint mb-1";

  const sorted = useMemo(() => initial, [initial]);

  const startNew = () => {
    setError(null);
    setForm(EMPTY_FORM);
    setEditingId("new");
  };

  const startEdit = (p: PostRow) => {
    setError(null);
    setForm({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage ?? "",
      locale: p.locale ?? "",
      published: p.published,
    });
    setEditingId(p.id);
  };

  const cancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const submit = () => {
    setError(null);
    const slug = form.slug.trim() || slugify(form.title);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError(t("admin.blogErrSlug"));
      return;
    }
    if (form.title.trim().length < 2) {
      setError(t("admin.blogErrTitle"));
      return;
    }
    if (form.excerpt.trim().length < 10) {
      setError(t("admin.blogErrExcerpt"));
      return;
    }
    if (form.content.trim().length < 10) {
      setError(t("admin.blogErrContent"));
      return;
    }

    const payload = {
      slug,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      coverImage: form.coverImage.trim() || null,
      locale: form.locale === "" ? null : form.locale,
      published: form.published,
    };

    startBusy(async () => {
      const url =
        editingId === "new"
          ? "/api/admin/blog"
          : `/api/admin/blog/${editingId}`;
      const method = editingId === "new" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "slug_exists") {
          setError(t("admin.blogErrSlugExists"));
        } else {
          setError(data?.error ?? t("admin.blogErrSave"));
        }
        return;
      }
      cancel();
      router.refresh();
    });
  };

  const togglePublish = (p: PostRow) => {
    startBusy(async () => {
      const res = await fetch(`/api/admin/blog/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify({ published: !p.published }),
      });
      if (res.ok) router.refresh();
    });
  };

  const remove = (p: PostRow) => {
    if (!confirm(t("admin.blogConfirmDelete", { title: p.title }))) return;
    startBusy(async () => {
      const res = await fetch(`/api/admin/blog/${p.id}`, {
        method: "DELETE",
        headers: { "x-csrf": "1" },
      });
      if (res.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3">
        <p className="text-text-dim text-xs">
          {t("admin.blogCount", { n: sorted.length })}
        </p>
        {editingId === null && (
          <button
            type="button"
            onClick={startNew}
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg shadow-[0_2px_12px_rgba(212,165,74,0.25)]"
          >
            {t("admin.blogNew")}
          </button>
        )}
      </div>

      {editingId !== null && (
        <div className="glass-card rounded-xl p-5 space-y-4 border-gold/30">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
            {editingId === "new" ? t("admin.blogNew") : t("admin.blogEdit")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("admin.blogFTitle")}</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    title: e.target.value,
                    // Auto-fill slug while creating, never overwrite
                    // an admin-edited slug when editing existing post.
                    slug:
                      editingId === "new" && p.slug === slugify(p.title)
                        ? slugify(e.target.value)
                        : p.slug,
                  }))
                }
                className={input}
                aria-label={t("admin.blogFTitle")}
              />
            </div>
            <div>
              <label className={labelCls}>{t("admin.blogFSlug")}</label>
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
                aria-label={t("admin.blogFSlug")}
                placeholder="my-post-slug"
              />
            </div>
            <div>
              <label className={labelCls}>{t("admin.blogFLocale")}</label>
              <select
                value={form.locale}
                onChange={(e) =>
                  setForm((p) => ({ ...p, locale: e.target.value }))
                }
                className={input}
                aria-label={t("admin.blogFLocale")}
              >
                {LOCALE_CHOICES.map((c) => (
                  <option key={c.value || "all"} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("admin.blogFExcerpt")}</label>
              <textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, excerpt: e.target.value }))
                }
                rows={2}
                className={`${input} resize-none`}
                aria-label={t("admin.blogFExcerpt")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("admin.blogFCover")}</label>
              <input
                value={form.coverImage}
                onChange={(e) =>
                  setForm((p) => ({ ...p, coverImage: e.target.value }))
                }
                className={input}
                placeholder="https://…"
                aria-label={t("admin.blogFCover")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("admin.blogFContent")}</label>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                rows={14}
                className={`${input} font-mono text-[13px] resize-y`}
                aria-label={t("admin.blogFContent")}
                placeholder={t("admin.blogFContentPh")}
              />
              <p className="mt-1.5 text-[10px] text-text-faint">
                {t("admin.blogFContentHelp")}
              </p>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((p) => ({ ...p, published: e.target.checked }))
                }
                className="accent-[#D4A54A]"
              />
              <label htmlFor="published" className="text-text-dim text-xs">
                {t("admin.blogFPublish")}
              </label>
            </div>
          </div>

          {error && (
            <div className="text-error text-xs glass-card rounded-lg px-3 py-2 border-error/30">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="px-4 py-2 text-xs uppercase tracking-wider text-text-dim hover:text-error"
            >
              {t("admin.blogBtnCancel")}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {busy
                ? t("admin.blogBtnSaving")
                : editingId === "new"
                  ? t("admin.blogBtnCreate")
                  : t("admin.blogBtnSave")}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 && editingId === null ? (
        <div className="glass-card rounded-xl p-12 text-center text-text-dim text-sm">
          {t("admin.blogEmpty")}
        </div>
      ) : (
        <ul className="glass-card rounded-xl divide-y divide-border/30">
          {sorted.map((p) => (
            <li
              key={p.id}
              className="px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                      p.published
                        ? "bg-success/15 text-success"
                        : "bg-text-faint/15 text-text-faint"
                    }`}
                  >
                    {p.published ? t("admin.blogStLive") : t("admin.blogStDraft")}
                  </span>
                  {p.locale && (
                    <span className="text-[9px] uppercase font-mono tracking-wider text-text-faint">
                      {p.locale}
                    </span>
                  )}
                  <span className="text-text font-medium text-sm truncate">
                    {p.title}
                  </span>
                </div>
                <div className="text-text-faint text-[10px] mt-1 font-mono truncate">
                  /blog/{p.slug}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-[11px]">
                <button
                  type="button"
                  onClick={() => togglePublish(p)}
                  disabled={busy}
                  className="px-2 py-1 text-text-dim hover:text-gold uppercase tracking-wider"
                >
                  {p.published
                    ? t("admin.blogBtnUnpublish")
                    : t("admin.blogBtnPublish")}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  disabled={busy}
                  className="px-2 py-1 text-text-dim hover:text-gold uppercase tracking-wider"
                >
                  {t("admin.blogBtnEdit")}
                </button>
                <button
                  type="button"
                  onClick={() => remove(p)}
                  disabled={busy}
                  className="px-2 py-1 text-text-faint hover:text-error uppercase tracking-wider"
                >
                  {t("admin.blogBtnDelete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
