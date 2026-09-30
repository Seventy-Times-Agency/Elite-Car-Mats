"use client";

import { usePathname } from "next/navigation";

/**
 * Storefront chrome (announcement bar, header, footer, floating CTA,
 * cookie banner) stays off the operator panel — /admin has its own
 * shell, and a shop header above an admin sidebar reads as two sites
 * glued together.
 */
export function NotOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
