"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function FloatingCTA() {
  const pathname = usePathname();
  // Hide on cart/checkout pages
  if (pathname === "/cart" || pathname === "/checkout") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link
        href="/catalog"
        className="group flex items-center gap-2 bg-gold hover:bg-gold-light text-dark px-5 py-3 shadow-lg shadow-gold/20 hover:shadow-gold/30 transition-all duration-300"
      >
        <span className="text-sm font-medium tracking-wide uppercase">Заказать</span>
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </motion.div>
  );
}
