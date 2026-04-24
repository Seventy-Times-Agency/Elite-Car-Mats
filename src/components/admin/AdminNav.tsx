"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

interface NavItem {
  href: string;
  key: string;
  icon: string;
}

const NAV: NavItem[] = [
  { href: "/admin", key: "admin.navDashboard", icon: "◆" },
  { href: "/admin/orders", key: "admin.navOrders", icon: "▸" },
  { href: "/admin/promos", key: "admin.navPromos", icon: "%" },
  { href: "/admin/reviews", key: "admin.navReviews", icon: "★" },
  { href: "/admin/custom-orders", key: "admin.navCustomOrders", icon: "✎" },
  { href: "/admin/newsletter", key: "admin.navNewsletter", icon: "✉" },
];

export function AdminNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="glass-card rounded-xl p-2 flex flex-wrap gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
              active
                ? "bg-gold/15 text-gold"
                : "text-text-dim hover:text-gold hover:bg-gold/5"
            }`}
          >
            <span className="mr-1.5 opacity-60">{item.icon}</span>
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
