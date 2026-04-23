"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT, useLocale } from "@/i18n/I18nProvider";

export default function CustomOrderPage() {
  const t = useT();
  const locale = useLocale();
  const sp = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    make: sp?.get("make") ?? "",
    model: sp?.get("model") ?? "",
    year: sp?.get("year") ?? "",
    bodyType: "",
    matSet: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t("custom.nameRequired");
    if (!form.email.trim()) e.email = t("custom.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = t("custom.emailInvalid");
    if (form.phone.trim().length < 5) e.phone = t("custom.phoneRequired");
    if (!form.make.trim()) e.make = t("custom.makeRequired");
    if (!form.model.trim()) e.model = t("custom.modelRequired");
    if (!form.year.trim()) e.year = t("custom.yearRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("custom.errGeneric"));
      }
      setDone(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("custom.errGeneric"));
      setSubmitting(false);
    }
  };

  const input =
    "w-full glass-card rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none focus:shadow-[0_0_0_1px_rgba(212,165,74,0.3)] transition-all";
  const inputError =
    "border-error/60 focus:border-error/80 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.4)]";

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{t("custom.success")}</h1>
          <p className="mt-3 text-text-dim text-sm leading-relaxed">
            {t("custom.successSub")}
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-block bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-6 py-3 rounded-lg shadow-[0_4px_20px_rgba(212,165,74,0.25)]"
          >
            {t("custom.successBack")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 lg:py-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="section-label">{t("custom.metaTitle")}</span>
          <h1 className="mt-3 text-3xl lg:text-4xl font-bold">
            {t("custom.title")}
          </h1>
          <p className="mt-3 text-text-dim text-sm max-w-md mx-auto leading-relaxed">
            {t("custom.subtitle")}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-1.5 block">
                {t("custom.nameLabel")} *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className={`${input} ${errors.name ? inputError : ""}`}
              />
              {errors.name && (
                <p className="text-[11px] text-error mt-1.5">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-1.5 block">
                {t("custom.phoneLabel")} *
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className={`${input} ${errors.phone ? inputError : ""}`}
              />
              {errors.phone && (
                <p className="text-[11px] text-error mt-1.5">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-1.5 block">
              {t("custom.emailLabel")} *
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className={`${input} ${errors.email ? inputError : ""}`}
            />
            {errors.email && (
              <p className="text-[11px] text-error mt-1.5">{errors.email}</p>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent my-2" />

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-1.5 block">
                {t("custom.makeLabel")} *
              </label>
              <input
                name="make"
                value={form.make}
                onChange={onChange}
                className={`${input} ${errors.make ? inputError : ""}`}
              />
              {errors.make && (
                <p className="text-[11px] text-error mt-1.5">{errors.make}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-1.5 block">
                {t("custom.modelLabel")} *
              </label>
              <input
                name="model"
                value={form.model}
                onChange={onChange}
                className={`${input} ${errors.model ? inputError : ""}`}
              />
              {errors.model && (
                <p className="text-[11px] text-error mt-1.5">{errors.model}</p>
              )}
            </div>
            <div className="sm:w-24">
              <label className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-1.5 block">
                {t("custom.yearLabel")} *
              </label>
              <input
                name="year"
                value={form.year}
                onChange={onChange}
                inputMode="numeric"
                className={`${input} ${errors.year ? inputError : ""}`}
              />
              {errors.year && (
                <p className="text-[11px] text-error mt-1.5">{errors.year}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-1.5 block">
              {t("custom.bodyLabel")}
            </label>
            <input
              name="bodyType"
              value={form.bodyType}
              onChange={onChange}
              placeholder={t("custom.bodyPh")}
              className={input}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-1.5 block">
              {t("custom.notesLabel")}
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              rows={4}
              placeholder={t("custom.notesPh")}
              className={input + " resize-none"}
            />
          </div>

          {formError && (
            <div className="text-sm text-error glass-card rounded-xl px-4 py-3 border-error/30">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-3.5 rounded-xl shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.35)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? t("custom.submitting") : t("custom.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
