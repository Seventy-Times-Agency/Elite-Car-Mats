"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { splitLocaleFromPath } from "@/i18n/locale-path";

export function FloatingCTA() {
  // Strip the /ru//uk URL prefix so the route checks below keep working.
  const pathname = splitLocaleFromPath(usePathname() ?? "/").path;
  const t = useT();
  // Hide on flows where it adds clutter: cart, checkout, admin, order detail,
  // and the product detail page (it already has its own sticky add-to-cart
  // bar on mobile + a primary CTA on desktop, so the floating one would
  // double up and overlap the sticky bar at the bottom).
  const onProductPage = /^\/catalog\/[^/]+\/[^/]+/.test(pathname ?? "");
  if (
    pathname === "/cart" ||
    pathname === "/checkout" ||
    (pathname?.startsWith("/admin") ?? false) ||
    (pathname?.startsWith("/order/") ?? false) ||
    onProductPage
  )
    return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Link
        href="/catalog"
        className="group flex items-center gap-2 bg-gold hover:bg-gold-light text-bg px-5 py-3 shadow-lg shadow-gold/20 transition-all duration-300 text-sm font-medium tracking-wide uppercase"
      >
        {t("floatcta.order")}
        <svg
          className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>
    </div>
  );
}
