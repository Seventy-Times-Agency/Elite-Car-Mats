import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  MAT_SETS_BY_PROFILE,
  type MatSetOption,
} from "@/data/catalog/mat-sets";
import { BADGE_PRICE, HEEL_PAD_PRICE } from "@/lib/pricing";
import type { VehicleConfigProfile } from "@/lib/vehicle-profile";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { PricingManager, type ProfileBlock } from "./PricingManager";

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

  const overrideRows = await prisma.matSetPriceOverride.findMany({
    select: { profile: true, matSet: true, price: true },
  });
  const overrideMap = new Map<string, number>();
  for (const r of overrideRows) {
    overrideMap.set(`${r.profile}:${r.matSet}`, Number(r.price ?? 0));
  }

  const profiles: ProfileBlock[] = (
    Object.entries(MAT_SETS_BY_PROFILE) as [
      VehicleConfigProfile,
      MatSetOption[],
    ][]
  ).map(([profile, sets]) => ({
    profile,
    label: PROFILE_LABEL[profile],
    rows: sets.map((s) => ({
      matSet: s.type,
      label: s.label,
      defaultPrice: s.price,
      override: overrideMap.get(`${profile}:${s.type}`) ?? null,
    })),
  }));

  const addons = {
    badge: BADGE_PRICE,
    heelPad: HEEL_PAD_PRICE,
  };

  return (
    <AdminShell
      title={t("admin.pricingTitle")}
      subtitle={t("admin.pricingSubtitle")}
    >
      <PricingManager profiles={profiles} addons={addons} />
    </AdminShell>
  );
}
