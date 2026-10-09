/**
 * Pieces shared by the product feeds (/api/feed.xml for Google,
 * /api/feed-meta.xml for the Facebook / Instagram shop).
 */

/**
 * Meta Shops treat an item with no stock count as not purchasable and
 * label it "Sold" in the Facebook / Instagram shop, even with
 * availability = in stock. Mats are cut to order, so there is no real
 * stock — a standing quantity keeps the shop buyable. Google ignores the
 * field.
 */
export const META_MADE_TO_ORDER_QTY = 100;

/**
 * Google Shopping product taxonomy id for the mats. Numeric ID is more
 * durable than the string path — Google can rename categories without
 * breaking us.
 */
// Verified against taxonomy-with-ids.en-US.txt on 2026-09-27: 8203 was
// "Ski & Snowboard Goggle Accessories" — every item in the feed sat in
// the wrong vertical. 8232 = "Vehicles & Parts > Vehicle Parts &
// Accessories > Motor Vehicle Parts > Motor Vehicle Carpet & Upholstery".
export const GOOGLE_PRODUCT_CATEGORY = "8232";

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 envelope with the `g:` namespace both feeds use. */
export function feedDocument(opts: {
  site: string;
  title: string;
  description: string;
  items: string[];
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${opts.title}</title>
    <link>${opts.site}</link>
    <description>${opts.description}</description>${opts.items.join("")}
  </channel>
</rss>
`;
}
