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
 * without them (`pendingSetup`). Rendered as order-form rows under the
 * line ("parameter — value"), full card width, so it reads as part of
 * the order rather than a box floating in the text column.
 */
export function PendingMatSetup({ item }: { item: MatCartItem }) {
  const t = useT();
  const { updateMatItem } = useCart();
  const years = [...(findModelById(item.modelId)?.years ?? [])].sort((a, b) => b - a);
  const missing = !item.year;

  return (
    <div className="border-t border-white/[0.07]">
      <Row label={t("cart.setup.year")} hint={t("cart.setup.yearHint")}>
        <select
          value={item.year || ""}
          onChange={(e) => updateMatItem(item.id, { year: Number(e.target.value) })}
          className={`w-full sm:max-w-[260px] h-11 rounded-lg bg-bg border px-3 text-sm text-text ${
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
      </Row>
      <Row label={t("cart.setup.base")} hint={localizeColor(t, item.color.name)}>
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
      </Row>
      <Row label={t("cart.setup.edge")} hint={localizeColor(t, item.edgeColor.name)}>
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
      </Row>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 px-4 py-3 border-t border-white/[0.05] first:border-t-0 sm:grid-cols-[180px_1fr] sm:items-center sm:px-5 sm:py-3.5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-text-dim">{label}</div>
        {hint && <div className="text-xs text-text-faint mt-0.5">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
