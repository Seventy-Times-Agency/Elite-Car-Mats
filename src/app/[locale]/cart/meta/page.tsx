import { Suspense } from "react";
import type { Metadata } from "next";
import { MetaCartLoader } from "./MetaCartLoader";
import { localeAlternates } from "@/lib/seo/alternates";

// A redirect-only page: keep it out of the index.
export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: { index: false, follow: false },
    alternates: await localeAlternates("/cart/meta"),
  };
}

/**
 * Checkout URL for the Facebook / Instagram Shop (Commerce Manager →
 * "Checkout URL"). Meta sends `products=<id>:<qty>,…`, `coupon`,
 * `cart_origin` and UTM params; the loader fills the cart with exactly
 * those items (Meta's requirement) and opens /cart.
 */
export default function MetaCartPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <MetaCartLoader />
    </Suspense>
  );
}
