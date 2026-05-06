"use client";

import { useT } from "@/i18n/I18nProvider";

/**
 * Three-up reassurance row: secure-checkout / returns / ships-from.
 * Used at the bottom of the checkout sidebar and on the cart drawer.
 *
 * Stripe's PCI compliance is the actual basis for the "Secure" claim,
 * so this only renders honestly — no fake "256-bit" gimmick badges.
 */
export function TrustBadges({ compact = false }: { compact?: boolean }) {
  const t = useT();

  const items: { icon: React.ReactNode; label: string }[] = [
    {
      label: t("trust.secure"),
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      ),
    },
    {
      label: t("trust.returns"),
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      ),
    },
    {
      label: t("trust.ships"),
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-3.75m-9-3.75h6"
          />
        </svg>
      ),
    },
  ];

  if (compact) {
    return (
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10.5px] uppercase tracking-wider text-text-faint">
        {items.map((it, i) => (
          <li
            key={i}
            className="inline-flex items-center gap-1.5"
          >
            <span className="text-gold/70">{it.icon}</span>
            <span>{it.label}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-2 text-center">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex flex-col items-center gap-1.5 rounded-lg border border-border/40 bg-surface/40 px-2 py-3"
        >
          <span className="text-gold/80">{it.icon}</span>
          <span className="text-[10px] uppercase tracking-wider text-text-dim leading-tight">
            {it.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
