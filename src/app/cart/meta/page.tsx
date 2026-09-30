import { Suspense } from "react";
import type { Metadata } from "next";
import { MetaCartLoader } from "./MetaCartLoader";

// A redirect-only page: keep it out of the index.
export const metadata: Metadata = { robots: { index: false, follow: false } };

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
