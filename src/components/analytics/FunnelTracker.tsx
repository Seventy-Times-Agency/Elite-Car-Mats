"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackFunnel } from "@/lib/analytics/funnel-client";

/**
 * Records the funnel steps that can be read off the URL alone. The three
 * steps that depend on what the visitor actually did — picking a mat set,
 * adding to cart, pressing pay — are fired from the components that own
 * those interactions.
 *
 * Mounted once in the root layout and driven by `usePathname`, so App
 * Router client-side navigations count too: the browser never reloads, so
 * a mount-only effect would see nothing but the landing page.
 */
export function FunnelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // /ru/* and /uk/* are the same routes behind a locale prefix
    // (src/proxy.ts rewrites them). Strip it so a Ukrainian visitor's
    // product view lands in the same bucket as an English one.
    const path = pathname.replace(/^\/(ru|uk)(?=\/|$)/, "") || "/";

    trackFunnel("visit");

    if (path === "/catalog" || path.startsWith("/catalog/")) {
      trackFunnel("catalog");
      // /catalog/<brand>/<model> — the configurator itself.
      if (path.split("/").filter(Boolean).length >= 3) {
        trackFunnel("product");
      }
    }

    if (path === "/checkout") trackFunnel("checkout");
  }, [pathname]);

  return null;
}
