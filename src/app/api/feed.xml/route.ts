import { NextResponse } from "next/server";
import { getMergedCatalogCached } from "@/lib/catalog-merge";
import { loadPriceOverridesCached } from "@/lib/pricing-overrides";
import { getMatSetPrice } from "@/lib/pricing";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";
import {
  getVehicleProfile,
  type VehicleConfigProfile,
} from "@/lib/vehicle-profile";
import { getDictionaryFor } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localizeMatSet, localizeMatSetDesc } from "@/i18n/labels";

export const runtime = "nodejs";
// Regenerate hourly at most — Google Merchant Center pulls daily and
// the feed itself is cached at the edge for an hour via Cache-Control.
// Dropping force-dynamic lets us also serve a prerendered version on
// the first hit after deploy instead of generating ~700×3 ≈ 2k items
// for every bot poke.
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

/**
 * Google Shopping product taxonomy: "Vehicles & Parts > Vehicle Parts &
 * Accessories > Motor Vehicle Interior Accessories > Motor Vehicle
 * Carpet Kits & Floor Mats". Numeric ID is more durable than the
 * string path — Google can rename categories without breaking us.
 */
const GOOGLE_PRODUCT_CATEGORY = "8203";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildItemDescription(
  brand: string,
  model: string,
  setDescriptionEn: string,
  yMin: number,
  yMax: number,
): string {
  const yearStr = yMin === yMax ? String(yMin) : `${yMin}–${yMax}`;
  return `Premium EVA car floor mats custom-cut for ${brand} ${model} (${yearStr}). ${setDescriptionEn}. CNC-cut from a 3D template specific to your year and trim. Made in Rochester, NY. Free US shipping, 30-day returns.`;
}

export async function GET() {
  const [{ brands, models }, overrides] = await Promise.all([
    getMergedCatalogCached(),
    loadPriceOverridesCached(),
  ]);

  // O(1) brand lookup — was a 60-deep `find` inside a 700-item loop,
  // so 42k comparisons per Googlebot poke.
  const brandById = new Map(brands.map((b) => [b.id, b] as const));

  // Mat-set labels/descriptions are stored in canonical Russian — the
  // feed is EN-only, so localize through the EN dictionary.
  const tEn = makeT(getDictionaryFor("en"), getDictionaryFor("en"));

  const items: string[] = [];

  for (const model of models) {
    const brand = brandById.get(model.brandId);
    if (!brand) continue;

    const profile: VehicleConfigProfile = getVehicleProfile(model);
    const setOptions = MAT_SETS_BY_PROFILE[profile];
    if (!setOptions || setOptions.length === 0) continue;

    const yMin = model.years[0] ?? 0;
    const yMax = model.years[model.years.length - 1] ?? yMin;

    for (const set of setOptions) {
      const price = getMatSetPrice(profile, set.type, overrides);
      if (!Number.isFinite(price) || price <= 0) continue;

      const sku = `ECM-${brand.slug}-${model.slug}-${set.type}`;
      // Deep-link to the configurator with the set pre-selected. The
      // landing page's `?set=` and `?year=` parameters are honoured by
      // ProductClient when present.
      // utm_medium is deliberately NOT "cpc" — the same feed also powers
      // free listings, and mislabelling those as paid skews analytics.
      const link = `${SITE}/catalog/${brand.slug}/${model.slug}?utm_source=google&utm_medium=shopping&utm_campaign=merchant-feed&set=${set.type}`;
      const setLabelEn = localizeMatSet(tEn, set.label);
      const setDescEn = localizeMatSetDesc(tEn, set.description);
      // Product-first title: the item is OUR mats FOR the vehicle — the
      // OEM name leads only as compatibility, not as g:brand.
      const title = `EVA Floor Mats for ${brand.name} ${model.name} — ${setLabelEn}`;
      const description = buildItemDescription(
        brand.name,
        model.name,
        setDescEn,
        yMin,
        yMax,
      );
      // Real product photo (self-hosted studio shot of the black set).
      // A car-maker's LOGO here violates Merchant Center image policy
      // (placeholder/logo images → item disapproval) and rode on an
      // uncontrolled third-party CDN; SVG isn't supported at all.
      const image = `${SITE}/mats/black-black.jpg`;

      items.push(`
    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:additional_image_link>${escapeXml(`${SITE}/mats/gallery/g01-hero-colors.jpg`)}</g:additional_image_link>
      <g:additional_image_link>${escapeXml(`${SITE}/mats/gallery/g02-install-front.jpg`)}</g:additional_image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${price.toFixed(2)} USD</g:price>
      <g:brand>Elite Car Mats</g:brand>
      <g:item_group_id>${escapeXml(`ECM-${brand.slug}-${model.slug}`)}</g:item_group_id>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${GOOGLE_PRODUCT_CATEGORY}</g:google_product_category>
      <g:product_type>${escapeXml("Auto Parts & Accessories > Floor Mats")}</g:product_type>
      <g:custom_label_0>${escapeXml(profile)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(set.type)}</g:custom_label_1>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
    </item>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Elite Car Mats</title>
    <link>${SITE}</link>
    <description>Premium EVA car floor mats custom-cut for your exact car. Made in Rochester, NY.</description>${items.join("")}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache at the edge for an hour — Merchant Center pulls daily,
      // and the feed is huge (~700 models × ~3 sets ≈ 2k items) so we
      // don't want to regenerate it on every Googlebot poke.
      "Cache-Control":
        "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
