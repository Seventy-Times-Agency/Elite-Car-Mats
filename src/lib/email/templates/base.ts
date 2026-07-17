import "server-only";
import { formatPrice } from "@/lib/pricing";
import { getDictionary, getDictionaryFor } from "@/i18n/getDictionary";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { makeT, type TFn } from "@/i18n/dictionary";
import { localizeColor, localizeMatSet } from "@/i18n/labels";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";
import type { VehicleConfigProfile } from "@/lib/vehicle-profile";
import type { MatSetType } from "@/types";

export interface OrderEmailItem {
  brandName: string;
  modelName: string;
  matSet: string;
  /**
   * Vehicle profile of the item's model. Makes the mat-set line
   * profile-aware: a minivan's `front` is "Front + middle" (4 mats) and
   * a semi's is "Cab set" — the generic per-code labels below misname
   * both and provoke support tickets.
   */
  profile?: VehicleConfigProfile;
  colorName: string;
  colorHex?: string | null;
  edgeColorName: string;
  edgeColorHex?: string | null;
  badgeName?: string | null;
  /** Adds an "+ Aluminum heel pad" line under the item when true. */
  heelPad?: boolean;
  year?: number | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderEmailData {
  orderNumber: string;
  /** HMAC token gating /order/<n> access. Required for customer email URLs. */
  orderToken?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  /** Free-form note from the customer at checkout (no promo annotation). */
  comment?: string | null;
  total: number;
  items: OrderEmailItem[];
  /** Order's stored storefront locale — the customer's language. */
  locale?: string | null;
}

/**
 * HTML-escape a customer-supplied string before interpolating it into an
 * email template. Covers both text nodes and quoted attribute values
 * (escapes `&`, `<`, `>`, `"`, `'`).
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const MAT_SET_CODE: Record<string, MatSetType> = {
  front: "front",
  FRONT: "front",
  full: "full",
  FULL: "full",
  cargo: "cargo",
  CARGO: "cargo",
  "full-cargo": "full-cargo",
  FULL_CARGO: "full-cargo",
};

export function matSetLabel(
  t: TFn,
  code: string,
  profile?: VehicleConfigProfile,
): string {
  const type = MAT_SET_CODE[code];
  // Profile-aware label first: reuses the storefront's canonical set
  // names (same ones the configurator shows), localized via labels.ts.
  if (type && profile) {
    const opt = MAT_SETS_BY_PROFILE[profile]?.find((s) => s.type === type);
    if (opt) return localizeMatSet(t, opt.label);
  }
  const key =
    type === "front"
      ? "email.matSetFront"
      : type === "full"
        ? "email.matSetFull"
        : type === "cargo"
          ? "email.matSetCargo"
          : type === "full-cargo"
            ? "email.matSetFullCargo"
            : null;
  return key ? t(key) : code;
}

export function swatch(
  hex: string | null | undefined,
  shape: "square" | "round",
): string {
  if (!hex) return "";
  const radius = shape === "round" ? "50%" : "2px";
  return `<span style="display:inline-block;width:11px;height:11px;background:${hex};border:1px solid #2a2a2a;border-radius:${radius};vertical-align:middle;margin-right:5px;"></span>`;
}

export function itemsTable(t: TFn, items: OrderEmailItem[]): string {
  return items
    .map((i) => {
      const titleSuffix = i.year ? ` · ${i.year}` : "";
      const badgeRow = i.badgeName
        ? `<div style="color:#D4A54A;font-size:12px;margin-top:4px;">+ ${i.badgeName}</div>`
        : "";
      const heelPadRow = i.heelPad
        ? `<div style="color:#D4A54A;font-size:12px;margin-top:4px;">+ ${t("email.heelPadSuffix")}</div>`
        : "";
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #222;">
            <div style="color:#F0ECE5;font-weight:500;">${i.brandName} ${i.modelName}${titleSuffix}</div>
            <div style="color:#8a8a8a;font-size:12px;margin-top:6px;">
              ${matSetLabel(t, i.matSet, i.profile)} · ×${i.quantity}
            </div>
            <div style="color:#bbb;font-size:12px;margin-top:6px;line-height:18px;">
              ${swatch(i.colorHex, "square")}${localizeColor(t, i.colorName)}
              <span style="color:#555;margin:0 6px;">·</span>
              ${swatch(i.edgeColorHex, "round")}${localizeColor(t, i.edgeColorName)}
            </div>
            ${badgeRow}
            ${heelPadRow}
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #222;text-align:right;color:#D4A54A;font-weight:600;white-space:nowrap;vertical-align:top;">
            ${formatPrice(i.unitPrice * i.quantity)}
          </td>
        </tr>`;
    })
    .join("");
}

/**
 * Renders the customer-supplied note (if any) as a labelled block.
 * Used in both customer and owner emails — owners especially need this
 * for delivery instructions like "leave at door" / "call on arrival".
 */
export function commentBlock(t: TFn, comment: string | null | undefined): string {
  const trimmed = comment?.trim();
  if (!trimmed) return "";
  // HTML-escape so a malicious customer can't inject markup.
  const safe = escapeHtml(trimmed).replace(/\n/g, "<br>");
  return `
    <div style="margin-top:24px;padding:14px 16px;border:1px solid #222;border-radius:6px;background:#161616;">
      <div style="color:#D4A54A;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;margin-bottom:6px;">
        ${t("email.noteLabel")}
      </div>
      <div style="color:#bbb;font-size:13px;line-height:1.5;">${safe}</div>
    </div>`;
}

export function baseTemplate(t: TFn, inner: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Elite Car Mats</title></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#F0ECE5;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:22px;font-weight:700;letter-spacing:0.15em;color:#D4A54A;">${t("email.ecm")}</div>
      <div style="font-size:11px;color:#8a8a8a;letter-spacing:0.2em;margin-top:4px;">${t("email.footerTag")}</div>
    </div>
    ${inner}
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #222;text-align:center;color:#8a8a8a;font-size:11px;">
      ${t("email.footerLoc")}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Translator for an email. Pass the ORDER's stored locale for anything
 * customer-facing — the ambient request locale belongs to whoever
 * triggered the send (an admin in a RU panel, a Stripe webhook with no
 * cookies at all), not to the customer. Falls back to the request locale
 * for legacy orders created before Order.locale existed, and for flows
 * where the request really is the customer's (contact form).
 */
export async function buildT(locale?: string | null): Promise<TFn> {
  if (isLocale(locale)) {
    return makeT(getDictionaryFor(locale), getDictionaryFor(DEFAULT_LOCALE));
  }
  const { dict, fallback } = await getDictionary();
  return makeT(dict, fallback);
}
