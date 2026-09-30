"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

interface NavItem {
  href: string;
  key: string;
}

interface NavGroup {
  key: string;
  items: NavItem[];
}

/**
 * Grouped by the question the operator is asking — "what sold" / "what
 * do we sell" / "what do we publish" / "is anything broken" — rather
 * than one flat row of eleven links.
 */
const GROUPS: NavGroup[] = [
  {
    key: "admin.navGroupSales",
    items: [
      { href: "/admin", key: "admin.navDashboard" },
      { href: "/admin/orders", key: "admin.navOrders" },
      { href: "/admin/custom-orders", key: "admin.navCustomOrders" },
      { href: "/admin/funnel", key: "admin.navFunnel" },
    ],
  },
  {
    key: "admin.navGroupShop",
    items: [
      { href: "/admin/catalog", key: "admin.navCatalog" },
      { href: "/admin/pricing", key: "admin.navPricing" },
      { href: "/admin/promos", key: "admin.navPromos" },
      { href: "/admin/reviews", key: "admin.navReviews" },
    ],
  },
  {
    key: "admin.navGroupContent",
    items: [
      { href: "/admin/blog", key: "admin.navBlog" },
      { href: "/admin/newsletter", key: "admin.navNewsletter" },
    ],
  },
  {
    key: "admin.navGroupSystem",
    items: [{ href: "/admin/journal", key: "admin.navJournal" }],
  },
];

function isActive(pathname: string | null, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname?.startsWith(href) ?? false;
}

/** Vertical, grouped — the desktop sidebar. */
export function AdminSidebarNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="space-y-5">
      {GROUPS.map((g) => (
        <div key={g.key}>
          <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.18em] text-text-faint">
            {t(g.key)}
          </div>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center h-9 px-3 rounded-md text-[13px] transition-colors ${
                      active
                        ? "bg-white/[0.06] text-text font-medium border-l-2 border-gold -ml-px"
                        : "text-text-dim hover:text-text hover:bg-white/[0.04]"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Horizontal, scrollable — phones and narrow windows. */
export function AdminBarNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="-mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex gap-1 min-w-max pb-px">
        {GROUPS.flatMap((g) => g.items).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block h-9 leading-9 px-3 text-[13px] whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "text-text border-gold"
                    : "text-text-dim border-transparent hover:text-text"
                }`}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
