import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signInAdmin, requireAdmin, isAdminConfigured } from "@/lib/auth";
import { rateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  // 5 attempts per 5 minutes per IP — stops password-spraying without
  // getting in the way of someone who fat-fingered their own password.
  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  const rl = rateLimit(`admin-login:${ip}`, { windowMs: 5 * 60_000, max: 5 });
  if (!rl.ok) {
    redirect(`/admin/login?error=throttled&retry=${rl.retryAfter}`);
  }
  const password = String(formData.get("password") ?? "");
  const ok = await signInAdmin(password);
  if (ok) redirect("/admin");
  redirect("/admin/login?error=1");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; retry?: string }>;
}) {
  if (await requireAdmin()) redirect("/admin");
  const { error, retry } = await searchParams;
  const configured = isAdminConfigured();
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const throttled = error === "throttled";
  const wrong = error === "1";

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
          {wrong && (
            <p className="text-[11px] text-error">{t("admin.wrongPassword")}</p>
          )}
          {throttled && (
            <p className="text-[11px] text-error">
              {t("admin.throttled", { retry: retry ?? "300" })}
            </p>
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
