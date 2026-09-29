"use client";

import { useT } from "@/i18n/I18nProvider";

export const QTY_MAX = 10;

/** Compact −/n/+ control; clamps to 1..max. */
export function QtyStepper({
  value,
  onChange,
  max = QTY_MAX,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  size?: "sm" | "md";
}) {
  const t = useT();
  const set = (n: number) => onChange(Math.min(max, Math.max(1, n)));
  const box = size === "sm" ? "h-8 w-8 text-sm" : "h-12 w-12 text-lg";
  const num = size === "sm" ? "w-8 text-sm" : "w-12 text-base";
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border/60 bg-bg/40 select-none"
      role="group"
      aria-label={t("acc.qtyLabel")}
    >
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={value <= 1}
        aria-label={t("acc.qtyMinus")}
        className={`${box} flex items-center justify-center text-text-dim hover:text-gold disabled:opacity-30 disabled:hover:text-text-dim`}
      >
        −
      </button>
      <span className={`${num} text-center font-semibold text-text tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        aria-label={t("acc.qtyPlus")}
        className={`${box} flex items-center justify-center text-text-dim hover:text-gold disabled:opacity-30 disabled:hover:text-text-dim`}
      >
        +
      </button>
    </div>
  );
}
