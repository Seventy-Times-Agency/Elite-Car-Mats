"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";

const MAX_PHOTOS = 3;

function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-2">
        {label}
      </span>
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}/5`}
            onClick={() => onChange(n)}
            className="p-0.5"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-8 h-8 transition-colors ${
                n <= value ? "fill-gold" : "fill-border hover:fill-gold/40"
              }`}
              aria-hidden
            >
              <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.8l-6.4 3.9 1.7-7.3L1.7 9.5l7.4-.6L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({
  prefillName,
  prefillCar,
  orderNumber,
  orderToken,
  photosEnabled,
}: {
  prefillName: string;
  prefillCar: string;
  orderNumber: string;
  orderToken: string;
  photosEnabled: boolean;
}) {
  const t = useT();
  const [name, setName] = useState(prefillName);
  const [carModel, setCarModel] = useState(prefillCar);
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addPhoto = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const res = await fetch("/api/reviews/upload", {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(t("revs.formPhotoErr"));
        return;
      }
      setPhotos((p) => (p.length < MAX_PHOTOS ? [...p, data.url] : p));
    } catch {
      setError(t("revs.formPhotoErr"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2 || carModel.trim().length < 2 || text.trim().length < 10) {
      setError(t("revs.formErrFill"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          carModel: carModel.trim(),
          rating,
          text: text.trim(),
          email: email.trim(),
          photos,
          orderNumber,
          orderToken,
        }),
      });
      if (!res.ok) {
        setError(
          res.status === 429 ? t("revs.formErrRate") : t("revs.formErrGeneric"),
        );
        return;
      }
      setDone(true);
    } catch {
      setError(t("revs.formErrGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done)
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{t("revs.formDoneTitle")}</h1>
          <p className="mt-3 text-text-dim text-sm leading-relaxed">
            {t("revs.formDoneBody")}
          </p>
          <Link
            href="/reviews"
            className="mt-6 inline-block glass-card text-text-dim hover:text-gold text-xs font-semibold tracking-[0.15em] uppercase px-5 py-3 rounded-lg transition-colors"
          >
            {t("revs.formDoneBack")}
          </Link>
        </div>
      </div>
    );

  const inputCls =
    "w-full bg-bg/40 border border-border/60 rounded-lg px-4 py-3 text-sm text-text placeholder:text-text-faint focus:border-gold/50 focus:outline-none transition-colors";

  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">{t("revs.label")}</span>
          <h1 className="mt-4 text-3xl font-bold">{t("revs.formTitle")}</h1>
          <p className="mt-3 text-text-dim text-sm">{t("revs.formSubtitle")}</p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-2xl p-6 space-y-5">
          <StarPicker value={rating} onChange={setRating} label={t("revs.formRating")} />

          <div>
            <label htmlFor="rev-name" className="block text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-2">
              {t("revs.formName")}
            </label>
            <input
              id="rev-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoComplete="name"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="rev-car" className="block text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-2">
              {t("revs.formCar")}
            </label>
            <input
              id="rev-car"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              maxLength={120}
              placeholder={t("revs.formCarPh")}
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="rev-text" className="block text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-2">
              {t("revs.formText")}
            </label>
            <textarea
              id="rev-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={3000}
              rows={5}
              placeholder={t("revs.formTextPh")}
              className={inputCls}
            />
          </div>

          {photosEnabled && (
            <div>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-2">
                {t("revs.formPhotos")}
              </span>
              <div className="flex gap-2 flex-wrap items-center">
                {photos.map((url, i) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${i + 1}`}
                      className="w-20 h-20 rounded-lg object-cover border border-border/40"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                      aria-label={t("revs.formPhotoRemove")}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bg border border-border text-text-dim hover:text-error text-xs leading-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 rounded-lg border border-dashed border-border/70 text-text-faint hover:border-gold/40 hover:text-gold transition-colors text-2xl disabled:opacity-40"
                    aria-label={t("revs.formPhotoAdd")}
                  >
                    {uploading ? "…" : "+"}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void addPhoto(f);
                  }}
                />
              </div>
              <p className="mt-2 text-text-faint text-[11px]">{t("revs.formPhotosHint")}</p>
            </div>
          )}

          <div>
            <label htmlFor="rev-email" className="block text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold mb-2">
              {t("revs.formEmail")}
            </label>
            <input
              id="rev-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={200}
              autoComplete="email"
              placeholder="you@example.com"
              className={inputCls}
            />
            <p className="mt-2 text-text-faint text-[11px]">{t("revs.formEmailHint")}</p>
          </div>

          {error && (
            <p className="text-error text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-4 rounded-xl transition-all duration-300 shadow-[0_4px_24px_rgba(212,165,74,0.25)] disabled:opacity-50"
          >
            {submitting ? t("revs.formSubmitting") : t("revs.formSubmit")}
          </button>
          <p className="text-text-faint text-[11px] text-center">{t("revs.formModNote")}</p>
        </form>
      </div>
    </div>
  );
}
