"use client";

import { useCart } from "@/context/CartContext";
import { evaColors, edgeColors } from "@/data/catalog";
import { findModelById } from "@/lib/vehicle-profile";
import { useT } from "@/i18n/I18nProvider";
import { localizeColor } from "@/i18n/labels";
import { MatColorSwatch } from "@/components/product/MatColorSwatch";
import type { MatCartItem } from "@/types";

/**
 * Year + colour picker for a cart line that came from the Meta Shop
 * without them (`pendingSetup`): year dropdown + the configurator's
 * colour tiles, so the buyer sees the actual texture they pick.
 */
export function PendingMatSetup({ item }: { item: MatCartItem }) {
  const t = useT();
  const { updateMatItem } = useCart();
  const years = [...(findModelById(item.modelId)?.years ?? [])].sort((a, b) => b - a);
  const missing = !item.year;

  const yearSelect = (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider text-text-dim mb-1.5">
        {t("cart.setup.year")}
      </span>
      <select
        value={item.year || ""}
        onChange={(e) => updateMatItem(item.id, { year: Number(e.target.value) })}
        className={`w-full rounded-lg bg-bg border px-3 py-2.5 text-sm text-text ${
          missing ? "border-gold" : "border-border"
        }`}
      >
        <option value="" disabled>
          {t("cart.setup.yearPick")}
        </option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="mt-3 rounded-lg border border-gold/40 bg-gold/5 p-3.5">
      <p className="text-sm font-semibold text-text">{t("cart.setup.title")}</p>
      <p className="text-xs text-text-dim mt-0.5 mb-3">{t("cart.setup.hint")}</p>

      <div className="space-y-3">
        <div className="max-w-[200px]">{yearSelect}</div>
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-text-dim mb-1.5">
            {t("cart.setup.base")} · {localizeColor(t, item.color.name)}
          </span>
          <div className="flex flex-wrap gap-2">
            {evaColors.map((c) => (
              <MatColorSwatch
                key={c.id}
                color={c}
                size="sm"
                variant="diamond"
                showLabel={false}
                selected={c.id === item.color.id}
                localizedName={localizeColor(t, c.name)}
                onClick={() => updateMatItem(item.id, { color: c })}
              />
            ))}
          </div>
        </div>
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-text-dim mb-1.5">
            {t("cart.setup.edge")} · {localizeColor(t, item.edgeColor.name)}
          </span>
          <div className="flex flex-wrap gap-2">
            {edgeColors.map((c) => (
              <MatColorSwatch
                key={c.id}
                color={c}
                size="sm"
                variant="solid"
                showLabel={false}
                selected={c.id === item.edgeColor.id}
                localizedName={localizeColor(t, c.name)}
                onClick={() => updateMatItem(item.id, { edgeColor: c })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
