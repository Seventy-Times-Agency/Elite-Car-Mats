import Link from "next/link";
import { AdminBarNav, AdminSidebarNav } from "./AdminNav";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Operator chrome: a fixed sidebar with grouped navigation on wide
 * screens, a scrollable tab bar on phones, and a plain page header.
 * Deliberately flatter than the storefront — no glass, no honeycomb,
 * gold only where it marks the active item or a primary action — so the
 * numbers are the loudest thing on the page.
 */
export async function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: AdminShellProps) {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  return (
    <div className="admin-root min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen border-r border-border bg-bg-deep px-3 py-5">
        <Link href="/admin" className="px-3 mb-6 block">
          <span className="text-[13px] font-semibold tracking-[0.2em] uppercase text-text">
            Elite<span className="text-gold">Car</span>Mats
          </span>
          <span className="block text-[10px] uppercase tracking-[0.18em] text-text-faint mt-0.5">
            {t("admin.shellLabel")}
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <AdminSidebarNav />
        </div>
        <div className="mt-6 pt-4 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center h-8 px-3 rounded-md text-xs text-text-dim hover:text-text hover:bg-white/[0.04]"
          >
            {t("admin.backToSite")}
          </Link>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left flex items-center h-8 px-3 rounded-md text-xs text-text-dim hover:text-error hover:bg-white/[0.04]"
            >
              {t("admin.signOut")}
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Top bar (phone / tablet) */}
        <div className="lg:hidden border-b border-border bg-bg-deep px-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <Link href="/admin" className="text-[12px] font-semibold tracking-[0.2em] uppercase text-text">
              Elite<span className="text-gold">Car</span>Mats
              <span className="text-text-faint font-normal ml-2">{t("admin.shellLabel")}</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-[11px] text-text-dim hover:text-text">
                {t("admin.backToSite")}
              </Link>
              <form action="/admin/logout" method="POST">
                <button type="submit" className="text-[11px] text-text-dim hover:text-error">
                  {t("admin.signOut")}
                </button>
              </form>
            </div>
          </div>
          <AdminBarNav />
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-[1240px]">
          <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="text-text-dim text-xs mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
