"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { recordTouch } from "@/lib/analytics/attribution-client";

/**
 * Records the visit's origin for order attribution. Driven by pathname
 * AND search params: the Meta Shop hand-off lands on /cart/meta and is
 * client-side replaced with /cart?utm_source=…, which a pathname-only
 * effect would see but a mount-only one would not.
 */
export function AttributionTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = `${pathname}?${search?.toString() ?? ""}`;

  useEffect(() => {
    recordTouch();
  }, [key]);

  return null;
}
