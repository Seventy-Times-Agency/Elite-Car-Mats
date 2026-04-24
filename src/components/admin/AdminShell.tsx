import Link from "next/link";
import { AdminNav } from "./AdminNav";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export async function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: AdminShellProps) {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <Link
            href="/"
            className="text-text-faint text-[10px] uppercase tracking-[0.25em] hover:text-gold transition-colors"
          >
            ← {t("admin.backToSite")}
          </Link>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="text-text-faint hover:text-error text-[10px] uppercase tracking-[0.25em] transition-colors"
            >
              {t("admin.signOut")}
            </button>
          </form>
        </div>

        <AdminNav />

        <div className="mt-8 mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-text-dim text-xs mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
        </div>

        {children}
      </div>
    </div>
  );
}
