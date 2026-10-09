"use client";
import { useEffect } from "react";
import { usePriceOverrides } from "@/context/PriceOverridesContext";
import { useT } from "@/i18n/I18nProvider";
import { formatPrice, getMatSetPrice } from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics";

/** Front + rear set of a regular car — the lowest full-cabin price. */
function useFromPrice(): number {
  return getMatSetPrice("standard", "full", usePriceOverrides());
}

export function ComboFromPrice() {
  const t = useT();
  return (
    <div className="text-3xl font-semibold text-gold">
      {t("colors.from", { price: formatPrice(useFromPrice()) })}
    </div>
  );
}

/**
 * Meta Pixel ViewContent with the colour item's catalog id, so visitors
 * from the shop card match their item in the Meta catalog.
 */
export function ComboViewContent({
  feedId,
  contentName,
}: {
  feedId: string;
  contentName: string;
}) {
  const price = useFromPrice();
  useEffect(() => {
    trackEvent("ViewContent", {
      content_type: "product",
      content_ids: [feedId],
      content_name: contentName,
      value: price,
      currency: "USD",
    });
  }, [feedId, contentName, price]);
  return null;
}
