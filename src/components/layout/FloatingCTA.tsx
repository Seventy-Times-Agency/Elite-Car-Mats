"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingCTA() {
  const pathname = usePathname();
  if (
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/order/")
  )
    return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Link href="/catalog" className="group flex items-center gap-2 bg-gold hover:bg-gold-light text-dark px-5 py-3 shadow-lg shadow-gold/20 transition-all duration-300 text-sm font-medium tracking-wide uppercase">
        Order Now
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
}
