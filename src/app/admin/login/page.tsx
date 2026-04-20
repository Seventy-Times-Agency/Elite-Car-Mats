import { redirect } from "next/navigation";
import { signInAdmin, requireAdmin, isAdminConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const ok = await signInAdmin(password);
  if (ok) redirect("/admin/orders");
  redirect("/admin/login?error=1");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await requireAdmin()) redirect("/admin/orders");
  const { error } = await searchParams;
  const configured = isAdminConfigured();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-2">Админка</h1>
        <p className="text-text-dim text-xs mb-6">EliteCarMats Control Panel</p>
        {!configured && (
          <div className="mb-4 rounded-lg border border-error/30 bg-error/5 p-3 text-[11px] text-error">
            ADMIN_PASSWORD не задан в переменных окружения. Добавьте его в Vercel Settings → Environment Variables.
          </div>
        )}
        <form action={login} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            autoFocus
            required
            className="w-full glass-card rounded-xl px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
          />
          {error && (
            <p className="text-[11px] text-error">Неверный пароль</p>
          )}
          <button
            type="submit"
            disabled={!configured}
            className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
