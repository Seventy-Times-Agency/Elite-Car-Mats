"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label={t("lang.aria", "Language")}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.15em] text-text-dim hover:text-gold transition-colors px-2 py-1 rounded-md border border-border/50 hover:border-gold/40"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9zM3.6 9h16.8M3.6 15h16.8"
          />
        </svg>
        {LOCALE_SHORT[locale]}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 glass-card rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden min-w-[140px] z-50"
        >
          {LOCALES.map((l: Locale) => (
            <button
              key={l}
              role="menuitemradio"
              aria-checked={locale === l}
              onClick={() => {
                setOpen(false);
                if (l !== locale) setLocale(l);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-3 ${
                locale === l
                  ? "text-gold bg-gold/8 font-medium"
                  : "text-text-dim hover:text-text hover:bg-surface-hover"
              }`}
            >
              <span>{LOCALE_NAMES[l]}</span>
              <span className="text-[10px] text-text-faint font-mono">
                {LOCALE_SHORT[l]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
