"use client";

import { useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { BrandManager } from "./BrandManager";
import { ModelManager } from "./ModelManager";
import type { BrandRow, ModelRow } from "./types";

export type { BrandRow, ModelRow } from "./types";

/**
 * Tab switcher for the admin catalog page. The two tabs are
 * intentionally independent components — they don't share state,
 * each manages its own form + edit-id, the only thing they share
 * is the row shapes from `./types`.
 */
export function CatalogManager({
  initialBrands,
  initialModels,
  reservedBrandSlugs,
}: {
  initialBrands: BrandRow[];
  initialModels: ModelRow[];
  reservedBrandSlugs: string[];
}) {
  const t = useT();
  const [tab, setTab] = useState<"brands" | "models">("brands");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs text-gold/85 leading-relaxed">
        <strong className="font-semibold">{t("admin.catalogNoticeH")}:</strong>{" "}
        {t("admin.catalogNoticeP")}
      </div>

      <div className="inline-flex rounded-lg border border-border/60 p-0.5 text-[11px] font-semibold uppercase tracking-wider">
        <TabBtn
          active={tab === "brands"}
          onClick={() => setTab("brands")}
          label={`${t("admin.catalogTabBrands")} · ${initialBrands.length}`}
        />
        <TabBtn
          active={tab === "models"}
          onClick={() => setTab("models")}
          label={`${t("admin.catalogTabModels")} · ${initialModels.length}`}
        />
      </div>

      {tab === "brands" ? (
        <BrandManager
          initial={initialBrands}
          reservedSlugs={reservedBrandSlugs}
        />
      ) : (
        <ModelManager initial={initialModels} brands={initialBrands} />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-1.5 rounded-md ${
        active ? "bg-gold/15 text-gold" : "text-text-dim hover:text-gold"
      }`}
    >
      {label}
    </button>
  );
}
