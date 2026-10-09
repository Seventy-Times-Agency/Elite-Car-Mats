import { NextResponse } from "next/server";
import { loadPriceOverridesCached } from "@/lib/pricing-overrides";
import { getAddonAvailabilityCached } from "@/lib/availability";
import { metaFeedItems } from "@/lib/feed/color-listing";
import { feedDocument } from "@/lib/feed/xml";
import { COLOR_COMBOS } from "@/data/catalog/color-combos";
import { getDictionaryFor } from "@/i18n/request-locale";
import { makeT } from "@/i18n/dictionary";

/**
 * Facebook / Instagram shop catalog: one card per mat colour combination
 * (see lib/feed/color-listing). The Google feed stays per car × set at
 * /api/feed.xml.
 */

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

export async function GET() {
  const [overrides, availability] = await Promise.all([
    loadPriceOverridesCached(),
    getAddonAvailabilityCached(),
  ]);
  const tEn = makeT(getDictionaryFor("en"), getDictionaryFor("en"));

  const xml = feedDocument({
    site: SITE,
    title: "Elite Car Mats",
    description:
      `Custom EVA car floor mats in ${COLOR_COMBOS.length} color combinations, cut to fit your exact car. Made in Rochester, NY.`,
    items: metaFeedItems({
      site: SITE,
      overrides,
      organizerInStock: availability.organizer,
      tEn,
    }),
  });

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
