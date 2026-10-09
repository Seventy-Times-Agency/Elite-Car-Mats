import { COLOR_COMBOS, colorComboFeedId, type ColorCombo } from "@/data/catalog/color-combos";
import { edgeColors, evaColors } from "@/data/catalog/colors";
import { getMatSetPrice, getShippingSettings, shippingFor, formatPrice, type PriceOverrideMap } from "@/lib/pricing";
import { localizeColor } from "@/i18n/labels";
import type { TFn } from "@/i18n/dictionary";
import { accessoryFeedItems } from "./accessory-items";
import { escapeXml, GOOGLE_PRODUCT_CATEGORY, META_MADE_TO_ORDER_QTY } from "./xml";

/**
 * Facebook / Instagram shop feed: one card per colour combination
 * instead of per car. A shop grid of 3.9k near-identical car listings
 * reads as spam; 65 cards in 65 real colours read as a palette, and the
 * car is chosen on the landing page the card opens.
 */

const TITLE_MAX = 150;
const META_UTM = "utm_source=facebook&utm_medium=shop&utm_campaign=meta-catalog";

// Real install / lifestyle photos, the same for every combo.
export const META_EXTRA_IMAGES = [
  "/mats/gallery/g02-install-front.jpg",
  "/mats/gallery/g14-red-driver.jpg",
  "/mats/gallery/g07-trunk-suv.jpg",
  "/mats/gallery/g10-texture.jpg",
] as const;

// The EN dictionary has a few lower-case colour names ("Light beige");
// title-style shop cards need them capitalised.
function titleCase(s: string): string {
  return s.replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

export function colorNamesEn(tEn: TFn, combo: ColorCombo): { eva: string; edge: string } {
  return {
    eva: titleCase(localizeColor(tEn, combo.eva.name)),
    edge: titleCase(localizeColor(tEn, combo.edge.name)),
  };
}

export function colorComboTitle(eva: string, edge: string): string {
  const title = `Custom EVA Car Floor Mats — ${eva} Base, ${edge} Trim | Made to Fit Your Car`;
  return title.length <= TITLE_MAX ? title : title.slice(0, TITLE_MAX);
}

export function colorComboDescription(
  eva: string,
  edge: string,
  overrides?: PriceOverrideMap,
): string {
  const { freeFrom } = getShippingSettings(overrides);
  return [
    `Custom EVA car floor mats in ${eva.toLowerCase()} with ${edge.toLowerCase()} trim, cut to the exact pattern of your make, model and year.`,
    "Honeycomb EVA cells hold water, mud and snow.",
    `Choose from ${evaColors.length} base and ${edgeColors.length} trim colors.`,
    "Handmade in Rochester, NY in 2–3 days.",
    "2-year warranty.",
    ...(freeFrom > 0 ? [`Free shipping on orders over ${formatPrice(freeFrom)}.`] : []),
    "Pick your car on the next page.",
  ].join(" ");
}

export function colorComboLandingPath(slug: string): string {
  return `/colors/${slug}`;
}

/** All items of the Meta feed: 65 colour combos, then the accessories. */
export function metaFeedItems(opts: {
  site: string;
  overrides: PriceOverrideMap;
  organizerInStock: boolean;
  tEn: TFn;
}): string[] {
  const { site, overrides, tEn } = opts;
  // The "from" price: front + rear set of a regular car.
  const price = getMatSetPrice("standard", "full", overrides);
  const shipping = shippingFor(price, overrides, ["standard.full"]);
  const items: string[] = [];

  if (Number.isFinite(price) && price > 0) {
    for (const combo of COLOR_COMBOS) {
      const names = colorNamesEn(tEn, combo);
      const link = `${site}${colorComboLandingPath(combo.slug)}?${META_UTM}`;
      // No g:item_group_id on purpose: grouped items collapse into one
      // card in the shop grid, and every colour must be its own card.
      items.push(`
    <item>
      <g:id>${escapeXml(colorComboFeedId(combo.eva.id, combo.edge.id))}</g:id>
      <g:title>${escapeXml(colorComboTitle(names.eva, names.edge))}</g:title>
      <g:description>${escapeXml(colorComboDescription(names.eva, names.edge, overrides))}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(`${site}/mats/${combo.slug}.jpg`)}</g:image_link>${META_EXTRA_IMAGES.map(
        (src) => `
      <g:additional_image_link>${escapeXml(`${site}${src}`)}</g:additional_image_link>`,
      ).join("")}
      <g:availability>in_stock</g:availability>
      <g:price>${price.toFixed(2)} USD</g:price>
      <g:brand>Elite Car Mats</g:brand>
      <g:color>${escapeXml(`${names.eva} / ${names.edge}`)}</g:color>
      <g:material>EVA</g:material>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${GOOGLE_PRODUCT_CATEGORY}</g:google_product_category>
      <g:product_type>${escapeXml("Auto Parts & Accessories > Floor Mats > Custom Colors")}</g:product_type>
      <g:quantity_to_sell_on_facebook>${META_MADE_TO_ORDER_QTY}</g:quantity_to_sell_on_facebook>
      <g:custom_label_0>color-combo</g:custom_label_0>
      <g:custom_label_1>${escapeXml(combo.eva.id)}</g:custom_label_1>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>${shipping.toFixed(2)} USD</g:price>
      </g:shipping>
    </item>`);
    }
  }

  items.push(
    ...accessoryFeedItems({
      site,
      overrides,
      organizerInStock: opts.organizerInStock,
      tEn,
      utm: META_UTM,
    }),
  );
  return items;
}
