"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { cartLinesFromMeta } from "@/lib/cart/from-meta";

export function MetaCartLoader() {
  const params = useSearchParams();
  const router = useRouter();
  const { replaceCart, hydrated } = useCart();
  const done = useRef(false);

  useEffect(() => {
    // Wait for the provider to read localStorage first, or its hydration
    // would restore the old cart on top of ours.
    if (!hydrated || done.current) return;
    done.current = true;
    replaceCart(cartLinesFromMeta(params.get("products")));
    const origin = params.get("cart_origin") === "instagram" ? "instagram" : "facebook";
    const next = new URLSearchParams({
      utm_source: params.get("utm_source") ?? origin,
      utm_medium: params.get("utm_medium") ?? "shop",
      utm_campaign: params.get("utm_campaign") ?? "meta-shop",
    });
    router.replace(`/cart?${next.toString()}`);
  }, [hydrated, params, replaceCart, router]);

  return <div className="min-h-[60vh]" />;
}
