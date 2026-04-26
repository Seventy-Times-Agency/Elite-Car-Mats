"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { brands, mockModels, matSets, evaColors, edgeColors, badges } from "@/data/mock";
import { useCart } from "@/context/CartContext";
import { MatPreview } from "@/components/product/MatPreview";
import { MatColorSwatch } from "@/components/product/MatColorSwatch";
import { MatSetType } from "@/types";
import { calculateItemUnitPrice, formatPrice } from "@/lib/pricing";
import {
  getVehicleProfile,
  getAvailableMatSets,
  getDefaultMatSet,
  type VehicleConfigProfile,
} from "@/lib/vehicle-profile";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/ProductJsonLd";
import { useT } from "@/i18n/I18nProvider";
import type { TFn } from "@/i18n/dictionary";
import {
  localizeBody,
  localizeColor,
  localizeMatSet,
  localizeMatSetDesc,
} from "@/i18n/labels";

function pickupSetOverride(
  profile: VehicleConfigProfile,
  type: MatSetType,
  t: TFn,
): { label: string; desc: string } | null {
  if (profile !== "pickup") return null;
  if (type === "cargo")
    return {
      label: t("matset.cargoTruck"),
      desc: t("matset.cargoTruckDesc"),
    };
  if (type === "full-cargo")
    return {
      label: t("matset.fullCargoTruck"),
      desc: t("matset.fullCargoTruckDesc"),
    };
  return null;
}

function StepHeader({
  n,
  label,
  value,
}: {
  n: number;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5 min-w-0">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gold/15 text-gold text-[9px] font-bold shrink-0">
        {n}
      </span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-gold/75 font-semibold shrink-0">
        {label}
      </span>
      {value && (
        <>
          <span className="text-border/60 text-xs shrink-0">·</span>
          <span className="text-text text-xs font-medium truncate min-w-0">
            {value}
          </span>
        </>
      )}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const t = useT();
  const brand = brands.find((b) => b.slug === params.brand);
  const model = mockModels.find(
    (m) => m.slug === params.model && m.brandId === brand?.id,
  );
  const { addItem } = useCart();
  const [set, setSet] = useState<MatSetType>("full-cargo");
  const [color, setColor] = useState(evaColors[0]);
  const [edge, setEdge] = useState(edgeColors[0]);
  const [year, setYear] = useState(
    model ? model.years[model.years.length - 1] : 0,
  );
  const [badge, setBadge] = useState(false);
  const [added, setAdded] = useState(false);

  const profile: VehicleConfigProfile = model
    ? getVehicleProfile(model)
    : "standard";
  const availableSetTypes = useMemo(() => getAvailableMatSets(profile), [profile]);
  const filteredMatSets = useMemo(
    () => matSets.filter((s) => availableSetTypes.includes(s.type)),
    [availableSetTypes],
  );

  // If the currently selected set isn't valid for this vehicle's profile
  // (e.g. user navigated from a sedan to a 2-seater), snap to the default.
  useEffect(() => {
    if (!availableSetTypes.includes(set)) {
      setSet(getDefaultMatSet(profile));
    }
  }, [profile, availableSetTypes, set]);

  if (!brand || !model)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">{t("prod.notFound")}</h1>
        <Link href="/catalog" className="mt-3 inline-block text-gold text-sm">
          {t("nav.catalog")}
        </Link>
      </div>
    );

  const bdg = badges.find((b) => b.brandName === brand.name);
  const ms = matSets.find((s) => s.type === set)!;
  const unitPrice = calculateItemUnitPrice({
    matSet: set,
    edgeColor: { id: edge.id },
    badge: badge && bdg ? { id: bdg.id } : null,
  });

  const localizedColor = localizeColor(t, color.name);
  const localizedEdge = localizeColor(t, edge.name);
  const setOverride = pickupSetOverride(profile, set, t);
  const localizedSet = setOverride
    ? setOverride.label
    : localizeMatSet(t, ms.label);

  const add = () => {
    // For pickups we store the truck-bed label ("Кузов пикапа"/"Полный + Кузов")
    // so cart / checkout / emails pick up the right localized string via
    // labels.ts instead of showing "Багажник" for a bed.
    const pickupLabels: Partial<Record<MatSetType, string>> =
      profile === "pickup"
        ? { cargo: "Кузов пикапа", "full-cargo": "Полный + Кузов" }
        : {};
    const storedLabel = pickupLabels[set] ?? ms.label;
    addItem({
      modelId: model.id,
      brandName: brand.name,
      modelName: model.name,
      year,
      matSet: set,
      matSetLabel: storedLabel,
      color,
      edgeColor: edge,
      badge: badge && bdg ? bdg : undefined,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <ProductJsonLd
        brand={brand.name}
        model={model.name}
        price={unitPrice}
        name={t("prod.jsonLdName", { brand: brand.name, model: model.name })}
        description={t("prod.jsonLdDesc", { brand: brand.name, model: model.name })}
        url={`/catalog/${brand.slug}/${model.slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: t("prod.breadcrumbCatalog"), url: "/catalog" },
          { name: brand.name, url: `/catalog/${brand.slug}` },
          { name: model.name, url: `/catalog/${brand.slug}/${model.slug}` },
        ]}
      />
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-xs text-text-dim">
            <Link href="/catalog" className="hover:text-gold transition-colors">
              {t("prod.breadcrumbCatalog")}
            </Link>
            <span className="mx-2 text-border">/</span>
            <Link
              href={`/catalog/${brand.slug}`}
              className="hover:text-gold transition-colors"
            >
              {brand.name}
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="text-text">{model.name}</span>
          </nav>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-28 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 lg:gap-10">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[5/4] glass-card rounded-xl relative overflow-hidden p-4 lg:p-5">
              <MatPreview
                color={color}
                edgeColor={edge}
                showBadge={badge && !!bdg}
                brandLogoUrl={brand.logo}
                brandName={brand.name}
              />
              <div className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] text-gold/60 font-semibold">
                {t("prod.previewLabel")}
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-xl lg:text-2xl font-bold leading-tight">
              {brand.name} {model.name}
            </h1>
            <p className="text-text-dim text-xs mt-1">
              {localizeBody(t, model.bodyType)} · {t("prod.subtitleSuffix")}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-gold text-2xl font-bold">
                {formatPrice(unitPrice)}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {/* Step 1 — Year */}
              <div>
                <StepHeader n={1} label={t("prod.stepYear")} value={String(year)} />
                <div className="flex flex-wrap gap-1.5">
                  {[...model.years]
                    .sort((a, b) => b - a)
                    .map((y) => (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          year === y
                            ? "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_2px_10px_rgba(212,165,74,0.3)]"
                            : "glass-card text-text-dim hover:text-gold hover:border-gold/30"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                </div>
              </div>

              {/* Step 2 — Set */}
              <div>
                <StepHeader n={2} label={t("prod.stepSet")} value={localizedSet} />
                {profile !== "standard" && (
                  <div className="mb-2.5 flex items-start gap-2 rounded-md border border-gold/15 bg-gold/[0.04] px-2.5 py-1.5">
                    <svg
                      className="w-3 h-3 text-gold/70 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 01 1.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                    <span className="text-[10.5px] text-gold/85 leading-snug">
                      {profile === "twoSeater"
                        ? t("prod.profile2seaterHint")
                        : profile === "semi"
                          ? t("prod.profileSemiHint")
                          : t("prod.profilePickupHint")}
                    </span>
                  </div>
                )}
                <div
                  className={`grid ${filteredMatSets.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-2`}
                >
                  {filteredMatSets.map((s) => {
                    const ov = pickupSetOverride(profile, s.type, t);
                    const label = ov ? ov.label : localizeMatSet(t, s.label);
                    const desc = ov ? ov.desc : localizeMatSetDesc(t, s.description);
                    return (
                      <button
                        key={s.type}
                        onClick={() => setSet(s.type)}
                        className={`px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                          set === s.type
                            ? "border-2 border-gold bg-gold-glow"
                            : "glass-card glow-hover"
                        }`}
                      >
                        <div
                          className={`text-xs font-semibold leading-tight ${
                            set === s.type ? "text-gold" : "text-text"
                          }`}
                        >
                          {label}
                        </div>
                        <div className="text-[10px] text-text-dim mt-0.5 leading-snug">
                          {desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3 — Mat color */}
              <div>
                <StepHeader
                  n={3}
                  label={t("prod.stepColor")}
                  value={localizedColor}
                />
                <div className="flex flex-wrap gap-1.5">
                  {evaColors.map((c) => (
                    <MatColorSwatch
                      key={c.id}
                      color={c}
                      selected={color.id === c.id}
                      localizedName={localizeColor(t, c.name)}
                      onClick={() => setColor(c)}
                      showLabel={false}
                    />
                  ))}
                </div>
              </div>

              {/* Step 4 — Edge */}
              <div>
                <StepHeader
                  n={4}
                  label={t("prod.stepEdge")}
                  value={localizedEdge}
                />
                <div className="flex flex-wrap gap-1.5">
                  {edgeColors.map((c) => (
                    <MatColorSwatch
                      key={c.id}
                      color={c}
                      selected={edge.id === c.id}
                      localizedName={localizeColor(t, c.name)}
                      onClick={() => setEdge(c)}
                      size="sm"
                      variant="solid"
                      showLabel={false}
                    />
                  ))}
                </div>
              </div>

              {/* Step 5 — Badge */}
              <div>
                <StepHeader n={5} label={t("prod.stepBadge")} />
                {bdg ? (
                  <label
                    className={`flex items-center gap-3 cursor-pointer glass-card rounded-lg p-3 transition-all duration-200 ${badge ? "!border-gold/50 shadow-[0_0_14px_rgba(212,165,74,0.12)]" : "glow-hover"}`}
                  >
                    <input
                      type="checkbox"
                      checked={badge}
                      onChange={(e) => setBadge(e.target.checked)}
                      className="w-4 h-4 text-gold focus:ring-gold accent-[#D4A54A] rounded shrink-0"
                    />
                    <div className="relative w-16 h-5 rounded-[3px] overflow-hidden shrink-0 ring-1 ring-black/40 bg-[linear-gradient(180deg,#F0F0F0_0%,#C8C8C8_28%,#8E8E8E_52%,#B4B4B4_72%,#6C6C6C_100%)] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_2px_rgba(0,0,0,0.35)]">
                      {brand.logo && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-w-[80%] max-h-[75%] object-contain"
                        />
                      )}
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-b from-white/55 to-transparent pointer-events-none" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-text text-xs font-semibold truncate">
                        {t("prod.badgeName", { brand: brand.name })}
                      </div>
                      <div className="text-text-dim text-[10px] mt-0.5 truncate">
                        {t("prod.badgeSubtext")}
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-surface/30 p-3">
                    <div className="w-16 h-5 rounded-[3px] border border-dashed border-border/70 flex items-center justify-center shrink-0 text-text-faint">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-text-dim text-xs font-semibold truncate">
                        {t("prod.badgeUnavailable")}
                      </div>
                      <div className="text-text-faint text-[10px] mt-0.5 leading-snug">
                        {t("prod.badgeUnavailableSub", { brand: brand.name })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit — desktop only */}
              <button
                onClick={add}
                className={`hidden lg:block w-full py-3.5 rounded-xl text-[13px] font-semibold tracking-wider uppercase transition-all duration-300 ${added ? "bg-success text-bg" : "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_20px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.4)]"}`}
              >
                {added
                  ? t("prod.addedFull")
                  : t("prod.addToCartFull", { price: formatPrice(unitPrice) })}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky add-to-cart */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur-xl border-t border-border/50 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-text-faint truncate">
              {localizedSet}
            </div>
            <div className="text-gold text-lg font-bold leading-tight">
              {formatPrice(unitPrice)}
            </div>
          </div>
          <button
            onClick={add}
            className={`px-5 py-3 rounded-xl text-xs font-semibold tracking-[0.15em] uppercase shrink-0 transition-all duration-300 ${added ? "bg-success text-bg" : "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_18px_rgba(212,165,74,0.3)]"}`}
          >
            {added ? t("prod.addedShort") : t("prod.addToCartShort")}
          </button>
        </div>
      </div>
    </div>
  );
}
