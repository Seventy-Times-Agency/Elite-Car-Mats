import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { MAT_SETS_BY_PROFILE, type MatSetOption } from "@/data/catalog/mat-sets";
import {
  getMatSetPrice,
  getBadgePrice,
  getHeelPadPrice,
  getThirdRowPrice,
  getAccessoryPrice,
  getShippingSettings,
  productShippingFee,
} from "@/lib/pricing";
import { loadPriceOverrides } from "@/lib/pricing-overrides";
import type { VehicleConfigProfile } from "@/lib/vehicle-profile";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { PricingManager, type PriceSection } from "./PricingManager";
import { getAddonAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

const PROFILE_ORDER: VehicleConfigProfile[] = [
  "standard",
  "minivan",
  "pickup",
  "twoSeater",
  "semi",
];

/**
 * Admin price list: every sellable thing with its live price and its own
 * shipping fee, edited in place. Code defaults are an implementation
 * detail — the operator only ever sees "the price" (see PricingManager).
 */
export default async function AdminPricingPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  // Uncached: the page must show what the next order will be billed.
  const overrides = await loadPriceOverrides();
  const availability = await getAddonAvailability();
  const shipping = getShippingSettings(overrides);

  const matSections: PriceSection[] = PROFILE_ORDER.map((profile) => {
    const sets: MatSetOption[] = MAT_SETS_BY_PROFILE[profile] ?? [];
    const cabinType = sets.some((s) => s.type === "full")
      ? "full"
      : sets.some((s) => s.type === "front")
        ? "front"
        : null;
    return {
      id: profile,
      title: t(`admin.profile.${profile}`),
      rows: sets.map((s) => ({
        id: `${profile}:${s.type}`,
        icon: s.type,
        setLabel: s.label,
        setDesc: s.description,
        price: {
          profile,
          matSet: s.type,
          value: getMatSetPrice(profile, s.type, overrides),
        },
        shipping: {
          key: `${profile}.${s.type}`,
          value: productShippingFee(`${profile}.${s.type}`, overrides),
        },
        // The complete set is the bundle: the row shows what it saves
        // against cabin + trunk bought separately.
        bundleParts:
          s.type === "full-cargo" && cabinType && sets.some((x) => x.type === "cargo")
            ? { cabin: `${profile}:${cabinType}`, cargo: `${profile}:cargo` }
            : undefined,
      })),
    };
  });

  const extrasSection: PriceSection = {
    id: "addons",
    title: t("admin.pricingAddonsH"),
    note: t("admin.pricingAddonsShipNote"),
    rows: [
      {
        id: "addon:badge",
        icon: "badge",
        name: t("admin.pricingMetallicBadge"),
        price: { profile: "addon", matSet: "badge", value: getBadgePrice(overrides) },
        availability: { key: "badges", value: availability.badges },
      },
      {
        id: "addon:heelPad",
        icon: "heelPad",
        name: t("admin.pricingHeelPad"),
        price: { profile: "addon", matSet: "heelPad", value: getHeelPadPrice(overrides) },
        availability: { key: "heelPad", value: availability.heelPad },
      },
      {
        id: "addon:thirdRow",
        icon: "thirdRow",
        name: t("admin.pricingThirdRow"),
        price: { profile: "addon", matSet: "thirdRow", value: getThirdRowPrice(overrides) },
      },
    ],
  };

  const accessorySection: PriceSection = {
    id: "accessories",
    title: t("admin.pricingAccessoriesH"),
    rows: [
      {
        id: "accessory:trunk-organizer",
        icon: "organizer",
        name: t("admin.accessoryOrganizer"),
        price: {
          profile: "accessory",
          matSet: "trunk-organizer",
          value: getAccessoryPrice("trunk-organizer", overrides),
        },
        shipping: {
          key: "accessory.trunk-organizer",
          value: productShippingFee("accessory.trunk-organizer", overrides),
        },
        availability: { key: "organizer", value: availability.organizer },
      },
    ],
  };

  return (
    <AdminShell title={t("admin.pricingTitle")} subtitle={t("admin.pricingSubtitle")}>
      <PricingManager
        sections={[...matSections, extrasSection, accessorySection]}
        shipping={shipping}
      />
    </AdminShell>
  );
}
