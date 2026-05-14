import { NextResponse } from "next/server";
import { getMergedCatalogCached } from "@/lib/catalog-merge";
import { loadPriceOverridesCached } from "@/lib/pricing-overrides";
import { getMatSetPrice } from "@/lib/pricing";
import {
  MAT_SETS_BY_PROFILE,
  type MatSetOption,
} from "@/data/catalog/mat-sets";
import {
  getVehicleProfile,
  type VehicleConfigProfile,
} from "@/lib/vehicle-profile";

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
  set: MatSetOption,
  yMin: number,
  yMax: number,
): string {
  const yearStr = yMin === yMax ? String(yMin) : `${yMin}–${yMax}`;
  return `Premium EVA car floor mats custom-cut for ${brand} ${model} (${yearStr}). ${set.description}. CNC-cut from a 3D template specific to your year and trim. Made in Rochester, NY. Free US shipping, 30-day returns.`;
}

export async function GET() {
  const [{ brands, models }, overrides] = await Promise.all([
    getMergedCatalogCached(),
    loadPriceOverridesCached(),
  ]);

  // O(1) brand lookup — was a 60-deep `find` inside a 700-item loop,
  // so 42k comparisons per Googlebot poke.
  const brandById = new Map(brands.map((b) => [b.id, b] as const));

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
      const link = `${SITE}/catalog/${brand.slug}/${model.slug}?utm_source=google&utm_medium=cpc&utm_campaign=shopping&set=${set.type}`;
      const title = `${brand.name} ${model.name} — ${set.label} EVA mats`;
      const description = buildItemDescription(
        brand.name,
        model.name,
        set,
        yMin,
        yMax,
      );
      // Brand logo as the image until real product photos arrive.
      // Google requires SOME image_link; brand mark is better than
      // skipping the item entirely.
      const image = brand.logo ?? `${SITE}/placeholder-car.svg`;

      items.push(`
    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${price.toFixed(2)} USD</g:price>
      <g:brand>${escapeXml(brand.name)}</g:brand>
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
