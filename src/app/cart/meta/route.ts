import { NextResponse, type NextRequest } from "next/server";
import { parseMetaProducts, resolveSku } from "@/lib/feed/resolve-sku";

/**
 * Checkout URL for the Facebook / Instagram Shop (Commerce Manager →
 * "Add checkout URL"). Meta sends `products=<id>:<qty>,…` plus
 * `cart_origin` and UTM params.
 *
 * A mat can't go straight into the cart — it needs the vehicle year and
 * both colours, which the catalog item doesn't carry — so a mat lands on
 * its configurator with the set pre-selected (the same deep link the
 * feed uses). A mat wins over an accessory when both are in the Meta
 * cart: the organizer is offered again as the configurator's add-on.
 */
export function GET(req: NextRequest) {
  const url = req.nextUrl;
  const items = parseMetaProducts(url.searchParams.get("products"));
  const resolved = items
    .map((i) => ({ ...i, target: resolveSku(i.sku) }))
    .filter((i) => i.target !== null);

  const origin = url.searchParams.get("cart_origin");
  const source = origin === "instagram" ? "instagram" : "facebook";
  const tracking = new URLSearchParams({
    utm_source: url.searchParams.get("utm_source") ?? source,
    utm_medium: url.searchParams.get("utm_medium") ?? "shop",
    utm_campaign: url.searchParams.get("utm_campaign") ?? "meta-shop",
  });

  const mat = resolved.find((i) => i.target?.kind === "mat");
  const acc = resolved.find((i) => i.target?.kind === "accessory");
  let dest: URL;
  if (mat && mat.target?.kind === "mat") {
    dest = new URL(`/catalog/${mat.target.brandSlug}/${mat.target.modelSlug}`, url.origin);
    dest.searchParams.set("set", mat.target.set);
  } else if (acc && acc.target?.kind === "accessory") {
    dest = new URL(`/accessories/${acc.target.slug}`, url.origin);
    dest.searchParams.set("variant", acc.target.variant);
  } else {
    dest = new URL("/catalog", url.origin);
  }
  tracking.forEach((v, k) => dest.searchParams.set(k, v));
  return NextResponse.redirect(dest, 302);
}
