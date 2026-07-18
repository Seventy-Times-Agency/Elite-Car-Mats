/**
 * Carrier tracking-page URL for a tracking number. Client-safe.
 *
 * Preference order: the carrier code stored on the order (ShipStation
 * writes e.g. "usps" / "ups" / "fedex" into Order.carrier), then a
 * format sniff of the number itself — USPS numbers are long digit
 * strings usually starting 9x, UPS starts "1Z", FedEx is 12/15 digits.
 * Unknown formats return null and callers render plain text.
 */
export function trackingUrl(
  trackingNumber: string | null | undefined,
  carrier?: string | null,
): string | null {
  const num = trackingNumber?.trim();
  if (!num) return null;
  const encoded = encodeURIComponent(num);

  const c = carrier?.trim().toLowerCase() ?? "";
  if (c.includes("usps") || c.includes("stamps")) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
  }
  if (c.includes("ups")) {
    return `https://www.ups.com/track?tracknum=${encoded}`;
  }
  if (c.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
  }

  // Format sniffing when no carrier code is stored (manual admin entry).
  if (/^1Z[0-9A-Z]{10,18}$/i.test(num)) {
    return `https://www.ups.com/track?tracknum=${encoded}`;
  }
  if (/^(9[2-5]\d{18,24}|82\d{8})$/.test(num.replace(/\s/g, ""))) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
  }
  if (/^\d{12}$|^\d{15}$/.test(num.replace(/\s/g, ""))) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
  }
  // 20-26 digit strings default to USPS — their most common label range.
  if (/^\d{20,26}$/.test(num.replace(/\s/g, ""))) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
  }
  return null;
}
