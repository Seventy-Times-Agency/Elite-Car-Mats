import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  MAT_SETS_BY_PROFILE,
  type MatSetOption,
} from "@/data/catalog/mat-sets";
import { BADGE_PRICE, EDGE_SURCHARGE, formatPrice } from "@/lib/pricing";
import type { VehicleConfigProfile } from "@/lib/vehicle-profile";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

const PROFILE_LABEL: Record<VehicleConfigProfile, string> = {
  standard: "Sedan / SUV (default)",
  pickup: "Pickup",
  twoSeater: "Two-seater (roadster, supercar)",
  semi: "Semi-truck cabin",
  minivan: "Minivan (3 rows)",
};

export default async function AdminPricingPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const profiles = Object.entries(MAT_SETS_BY_PROFILE) as [
    VehicleConfigProfile,
    MatSetOption[],
  ][];

  return (
    <AdminShell
      title={t("admin.pricingTitle")}
      subtitle={t("admin.pricingSubtitle")}
    >
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 mb-6 text-xs text-gold/85 leading-relaxed">
        <strong className="font-semibold">{t("admin.pricingNoticeH")}:</strong>{" "}
        {t("admin.pricingNoticeP")}{" "}
        <code className="text-[11px] bg-bg/40 px-1.5 py-0.5 rounded">
          src/data/catalog/mat-sets.ts
        </code>
        .
      </div>

      <div className="space-y-6">
        {profiles.map(([profile, sets]) => (
          <section key={profile}>
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-semibold mb-2.5">
              {PROFILE_LABEL[profile]}
            </h2>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface/40 text-text-faint text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-2.5">
                      {t("admin.pricingColType")}
                    </th>
                    <th className="text-left px-4 py-2.5">
                      {t("admin.pricingColLabel")}
                    </th>
                    <th className="text-right px-4 py-2.5">
                      {t("admin.pricingColPrice")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {sets.map((s) => (
                    <tr key={s.type}>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-text-faint">
                        {s.type}
                      </td>
                      <td className="px-4 py-2.5 text-text">{s.label}</td>
                      <td className="px-4 py-2.5 text-right text-gold font-semibold">
                        {formatPrice(s.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-semibold mb-2.5">
            {t("admin.pricingAddonsH")}
          </h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/30">
                <tr>
                  <td className="px-4 py-2.5 text-text">
                    {t("admin.pricingMetallicBadge")}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gold font-semibold">
                    +{formatPrice(BADGE_PRICE)}
                  </td>
                </tr>
                {Object.entries(EDGE_SURCHARGE).map(([id, sur]) => (
                  <tr key={id}>
                    <td className="px-4 py-2.5 text-text">
                      {t("admin.pricingEdgeRow", { id })}
                    </td>
                    <td className="px-4 py-2.5 text-right text-text-dim">
                      {sur === 0 ? t("admin.pricingNoSurcharge") : `+${formatPrice(sur)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
