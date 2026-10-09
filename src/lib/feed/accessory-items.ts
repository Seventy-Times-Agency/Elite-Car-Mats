import { ACCESSORIES, accessorySku } from "@/data/accessories";
import { getAccessoryPrice, shippingFor, type PriceOverrideMap } from "@/lib/pricing";
import type { TFn } from "@/i18n/dictionary";
import { escapeXml, META_MADE_TO_ORDER_QTY } from "./xml";

/**
 * Accessory items, shared by every feed: one item per colour variant,
 * grouped by product so Shopping shows them as colour options of the
 * same listing. Verified against taxonomy-with-ids.en-US.txt on
 * 2026-09-27: 8237 = "Vehicles & Parts > Vehicle Parts & Accessories >
 * Vehicle Storage & Cargo" (there is no narrower organizer node).
 */
export function accessoryFeedItems(opts: {
  site: string;
  overrides: PriceOverrideMap;
  organizerInStock: boolean;
  /** EN translator — feeds are English-only. */
  tEn: TFn;
  /** Query string with the feed's utm tags, without the leading "&". */
  utm: string;
}): string[] {
  const { site, overrides, tEn } = opts;
  const items: string[] = [];
  for (const acc of ACCESSORIES) {
    const price = getAccessoryPrice(acc.slug, overrides);
    if (!Number.isFinite(price) || price <= 0) continue;
    const inStock = acc.slug === "trunk-organizer" ? opts.organizerInStock : true;
    for (const v of acc.variants) {
      const color = tEn(`acc.variant.${v.id}`);
      const [image, ...more] = v.images;
      items.push(`
    <item>
      <g:id>${escapeXml(accessorySku(acc.slug, v.id))}</g:id>
      <g:title>${escapeXml(`${tEn(`acc.${acc.slug}.name`)} — ${color}`)}</g:title>
      <g:description>${escapeXml(tEn(`acc.${acc.slug}.desc`))}</g:description>
      <g:link>${escapeXml(`${site}/accessories/${acc.slug}?variant=${v.id}&${opts.utm}`)}</g:link>
      <g:image_link>${escapeXml(`${site}${image}`)}</g:image_link>${more
        .map((src) => `
      <g:additional_image_link>${escapeXml(`${site}${src}`)}</g:additional_image_link>`)
        .join("")}
      <g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${price.toFixed(2)} USD</g:price>
      <g:brand>Elite Car Mats</g:brand>
      <g:item_group_id>${escapeXml(`ECM-ACC-${acc.slug}`)}</g:item_group_id>
      <g:color>${escapeXml(color)}</g:color>
      <g:material>${escapeXml(acc.material)}</g:material>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>8237</g:google_product_category>
      <g:product_type>${escapeXml("Auto Parts & Accessories > Trunk Organizers")}</g:product_type>
      <g:quantity_to_sell_on_facebook>${inStock ? META_MADE_TO_ORDER_QTY : 0}</g:quantity_to_sell_on_facebook>
      <g:custom_label_0>accessory</g:custom_label_0>
      <g:custom_label_1>${escapeXml(acc.slug)}</g:custom_label_1>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>${shippingFor(price, overrides, [`accessory.${acc.slug}`]).toFixed(2)} USD</g:price>
      </g:shipping>
    </item>`);
    }
  }
  return items;
}
