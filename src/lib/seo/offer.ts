/**
 * Shipping and return terms for Offer structured data, shared by the mat
 * and accessory product pages. Must match the delivery/returns pages and
 * the Merchant Center account rule ("Standard USPS/UPS"): made in 2–3
 * business days, 3–7 days in transit, 30-day returns by mail with return
 * shipping paid by the customer (free when the item is defective — the
 * schema has no per-reason field, so the common case is declared).
 */
export function offerShippingDetails(rateUsd: number) {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: rateUsd.toFixed(2),
      currency: "USD",
    },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 3, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
    },
  };
}

export const MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "US",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 30,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
};
