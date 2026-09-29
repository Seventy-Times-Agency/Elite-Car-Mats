"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePriceOverrides } from "@/context/PriceOverridesContext";
import { useT } from "@/i18n/I18nProvider";
import { formatPrice, getAccessoryPrice } from "@/lib/pricing";
import { accessorySku, organizerVariantForEdge } from "@/data/accessories";
import { accessoryView } from "@/lib/accessories/display";
import { trackEvent } from "@/lib/analytics";
import { QtyStepper } from "@/components/common/QtyStepper";

const SLUG = "trunk-organizer";

/**
 * Cross-sell card under the configurator add-ons: the trunk organizer in
 * the trim that matches the edge colour the customer just picked. Adds a
 * SEPARATE cart line (it is its own product), never touches the mat set.
 */
export function OrganizerCrossSell({ edgeColorId }: { edgeColorId: string }) {
  const t = useT();
  const { addItem, openCart } = useCart();
  const priceOverrides = usePriceOverrides();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const variant = organizerVariantForEdge(edgeColorId);
  const view = accessoryView(t, SLUG, variant.id);
  const price = getAccessoryPrice(SLUG, priceOverrides);

  const add = () => {
    addItem({ kind: "accessory", accessorySlug: SLUG, variantId: variant.id, quantity: qty });
    trackEvent("AddToCart", {
      content_type: "product",
      content_ids: [accessorySku(SLUG, variant.id)],
      contents: [{ id: accessorySku(SLUG, variant.id), quantity: qty, item_price: price }],
      value: price * qty,
      currency: "USD",
    });
    openCart();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="glass-card rounded-xl p-4 border-gold/20">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold/80 mb-3">
        {t("acc.crossSellTitle")}
      </div>
      <div className="flex gap-4">
        <Link
          href={`/accessories/${SLUG}?variant=${variant.id}`}
          className="relative w-24 h-20 sm:w-28 sm:h-24 rounded-lg overflow-hidden border border-border/50 shrink-0"
          aria-label={view.title}
        >
          <Image src={view.image} alt="" fill sizes="112px" className="object-cover" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-text font-medium text-sm">{view.title}</div>
          <div className="text-text-faint text-[11px] mt-0.5">{view.variantLabel}</div>
          <p className="text-text-dim text-xs mt-1.5 leading-snug">{t("acc.crossSellText")}</p>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <QtyStepper value={qty} onChange={setQty} size="sm" />
            <button
              type="button"
              onClick={add}
              className={`px-3.5 py-2 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-all ${
                added
                  ? "bg-success text-bg"
                  : "bg-gold/15 text-gold border border-gold/40 hover:bg-gold/25"
              }`}
            >
              {added ? t("acc.inCart") : t("acc.crossSellAdd", { price: formatPrice(price * qty) })}
            </button>
            <Link
              href={`/accessories/${SLUG}?variant=${variant.id}`}
              className="text-[11px] text-text-faint hover:text-gold underline-offset-2 hover:underline"
            >
              {t("acc.crossSellMore")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
