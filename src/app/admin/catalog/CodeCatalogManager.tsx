"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

export interface CodeModelRow {
  /** Canonical `${brandId}-${slug}` id — the visibility key. */
  id: string;
  brandName: string;
  name: string;
  bodyType: string;
  yearsLabel: string;
}

const MAX_RESULTS = 60;

/**
 * The read-only view of the ~700 code-catalog models with a hide/show
 * switch per row. Hiding masks the model from the public site (catalog,
 * search, sitemap, feed) without touching the code list or past orders.
 */
export function CodeCatalogManager({
  models,
  hiddenIds,
}: {
  models: CodeModelRow[];
  hiddenIds: string[];
}) {
  const t = useT();
  const router = useRouter();
  const [busy, startBusy] = useTransition();
  const [query, setQuery] = useState("");
  const hidden = useMemo(() => new Set(hiddenIds), [hiddenIds]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return models
      .filter((m) =>
        `${m.brandName} ${m.name}`.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [models, q]);

  const hiddenRows = useMemo(
    () => models.filter((m) => hidden.has(m.id)),
    [models, hidden],
  );

  const toggle = (id: string, nextHidden: boolean) => {
    startBusy(async () => {
      await fetch("/api/admin/catalog/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf": "1" },
        body: JSON.stringify({ modelId: id, hidden: nextHidden }),
      });
      router.refresh();
    });
  };

  const Row = ({ m }: { m: CodeModelRow }) => {
    const isHidden = hidden.has(m.id);
    return (
      <li className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-medium ${isHidden ? "text-text-faint line-through" : "text-text"}`}>
            <span className="text-gold/70 mr-1.5">{m.brandName}</span>
            {m.name}
          </div>
          <div className="text-text-faint text-[11px] mt-0.5">
            {m.bodyType} · {m.yearsLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggle(m.id, !isHidden)}
          disabled={busy}
          className={`shrink-0 text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${
            isHidden
              ? "border-gold/40 text-gold hover:border-gold"
              : "border-border/60 text-text-dim hover:border-error/60 hover:text-error"
          }`}
        >
          {isHidden ? t("admin.catalogUnhide") : t("admin.catalogHide")}
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-text-dim leading-relaxed">
        {t("admin.catalogCodeNote")}
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("admin.catalogCodeSearchPh")}
        aria-label={t("admin.catalogCodeSearchPh")}
        className="w-full glass-card rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none"
      />

      {hiddenRows.length > 0 && (
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-semibold mb-2">
            {t("admin.catalogHiddenH")} · {hiddenRows.length}
          </h2>
          <ul className="glass-card rounded-xl divide-y divide-border/30 border-gold/20">
            {hiddenRows.map((m) => (
              <Row key={m.id} m={m} />
            ))}
          </ul>
        </section>
      )}

      {q ? (
        results.length === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center text-text-dim text-sm">
            {t("admin.catalogCodeNoResults")}
          </div>
        ) : (
          <ul className="glass-card rounded-xl divide-y divide-border/30">
            {results.map((m) => (
              <Row key={m.id} m={m} />
            ))}
          </ul>
        )
      ) : (
        hiddenRows.length === 0 && (
          <div className="glass-card rounded-xl p-10 text-center text-text-dim text-sm">
            {t("admin.catalogCodeStart", { n: models.length })}
          </div>
        )
      )}
    </div>
  );
}
