"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/I18nProvider";

const STORAGE_KEY = "ecm_cookies_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useT();

  useEffect(() => {
    const accepted =
      typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      const id = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(id);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t("cookies.aria")}
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-md"
    >
      <div className="glass-card rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-gold/20">
        <h2 className="text-sm font-semibold text-text">
          {t("cookies.title")}
        </h2>
        <p className="mt-2 text-text-dim text-xs leading-relaxed">
          {t("cookies.body")}{" "}
          <Link
            href="/privacy"
            className="text-gold hover:text-gold-light underline underline-offset-2"
          >
            {t("cookies.learnMore")}
          </Link>
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={accept}
            className="flex-1 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase py-2.5 rounded-lg shadow-[0_2px_12px_rgba(212,165,74,0.25)]"
          >
            {t("cookies.accept")}
          </button>
          <button
            onClick={accept}
            className="flex-1 text-text-dim hover:text-gold border border-border hover:border-gold/40 text-xs font-medium tracking-wider uppercase py-2.5 rounded-lg transition-colors"
          >
            {t("cookies.essential")}
          </button>
        </div>
      </div>
    </div>
  );
}
