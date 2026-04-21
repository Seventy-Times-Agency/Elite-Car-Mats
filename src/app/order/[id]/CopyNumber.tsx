"use client";

import { useState } from "react";
import { useT } from "@/i18n/I18nProvider";

export function CopyNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const t = useT();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable; silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-medium transition-colors"
      title={t("ord.copyTitle")}
    >
      <span>{value}</span>
      <span className="text-[11px] text-text-faint">
        {copied ? t("ord.copied") : t("ord.copy")}
      </span>
    </button>
  );
}
