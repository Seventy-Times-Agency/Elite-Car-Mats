import { redirect } from "next/navigation";
import { signInAdmin, requireAdmin, isAdminConfigured } from "@/lib/auth";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const ok = await signInAdmin(password);
  if (ok) redirect("/admin");
  redirect("/admin/login?error=1");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await requireAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = isAdminConfigured();
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-2">{t("admin.loginTitle")}</h1>
        <p className="text-text-dim text-xs mb-6">{t("admin.loginSubtitle")}</p>
        {!configured && (
          <div className="mb-4 rounded-lg border border-error/30 bg-error/5 p-3 text-[11px] text-error">
            {t("admin.passwordMissingEnv")}
          </div>
        )}
        <form action={login} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder={t("admin.passwordPh")}
            autoFocus
            required
            className="w-full glass-card rounded-xl px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
          />
          {error && (
            <p className="text-[11px] text-error">{t("admin.wrongPassword")}</p>
          )}
          <button
            type="submit"
            disabled={!configured}
            className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("admin.signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}
