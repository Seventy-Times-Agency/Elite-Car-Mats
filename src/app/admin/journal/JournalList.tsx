"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import type { Problem } from "@/lib/ops/journal";

function ago(ms: number, t: ReturnType<typeof useT>): string {
  const min = Math.max(0, Math.round((Date.now() - ms) / 60_000));
  if (min < 1) return t("journal.justNow");
  if (min < 60) return t("journal.minAgo", { n: min });
  const h = Math.round(min / 60);
  if (h < 48) return t("journal.hAgo", { n: h });
  return t("journal.dAgo", { n: Math.round(h / 24) });
}

export function JournalList({ problems }: { problems: Problem[] | null }) {
  const t = useT();
  const router = useRouter();
  const [busy, start] = useTransition();
  const [open, setOpen] = useState<string | null>(null);

  if (problems === null) {
    return (
      <div className="admin-card px-5 py-4 text-sm text-text-dim">
        {t("journal.unavailable")}
      </div>
    );
  }
  if (problems.length === 0) {
    return (
      <div className="admin-card px-5 py-4 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.6)]" aria-hidden />
        <span className="text-sm text-text">{t("journal.allGood")}</span>
      </div>
    );
  }

  const title = (area: string) => {
    const key = `journal.area.${area}`;
    const v = t(key);
    return v === key ? area : v;
  };

  const resolve = (id: string) =>
    start(async () => {
      await fetch("/api/admin/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    });

  const critical = problems.filter((p) => p.severity === "critical").length;

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-dim">
        {t("journal.summary", { total: problems.length, critical })}
      </p>
      <ul className="space-y-2">
        {problems.map((p) => {
          const isOpen = open === p.id;
          return (
            <li key={p.id} className="admin-card overflow-hidden">
              <div className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${p.severity === "critical" ? "bg-error" : "bg-gold/70"}`}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  aria-expanded={isOpen}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-sm text-text font-medium">{title(p.area)}</div>
                  <div className="text-[11px] text-text-faint mt-0.5">
                    {t("journal.meta", {
                      count: p.count,
                      last: ago(p.lastAt, t),
                      first: ago(p.firstAt, t),
                    })}
                    {p.context ? ` · ${p.context}` : ""}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => resolve(p.id)}
                  disabled={busy}
                  className="shrink-0 text-[11px] uppercase tracking-wider text-text-dim hover:text-gold px-2 py-1 disabled:opacity-50"
                >
                  {t("journal.resolve")}
                </button>
              </div>
              {isOpen && (
                <pre className="px-4 pb-3 text-[11px] text-text-dim whitespace-pre-wrap break-words font-mono">
                  {p.message}
                </pre>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[10px] text-text-faint">{t("journal.note")}</p>
    </div>
  );
}
