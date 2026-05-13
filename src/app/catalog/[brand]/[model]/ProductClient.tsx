"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { evaColors, edgeColors, badges } from "@/data/catalog";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";
import { useCart } from "@/context/CartContext";
import { MatPreview } from "@/components/product/MatPreview";
import { MatColorSwatch } from "@/components/product/MatColorSwatch";
import type { Brand, CarModel, MatSetType } from "@/types";
import {
  BADGE_PRICE,
  HEEL_PAD_PRICE,
  calculateItemUnitPrice,
  formatPrice,
} from "@/lib/pricing";
import {
  getVehicleProfile,
  getDefaultMatSet,
  type VehicleConfigProfile,
} from "@/lib/vehicle-profile";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/ProductJsonLd";
import { ProductFaq } from "@/components/product/ProductFaq";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useT } from "@/i18n/I18nProvider";
import {
  localizeBody,
  localizeColor,
  localizeMatSet,
  localizeMatSetDesc,
} from "@/i18n/labels";

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

export default function ProductClient({
  brand,
  model,
}: {
  brand: Brand | null;
  model: CarModel | null;
}) {
  const searchParams = useSearchParams();
  const t = useT();
  const { addItem, openCart } = useCart();

  const profile: VehicleConfigProfile = model
    ? getVehicleProfile(model)
    : "standard";
  const profileMatSets = useMemo(() => MAT_SETS_BY_PROFILE[profile], [profile]);
  const availableSetTypes = useMemo(
    () => profileMatSets.map((s) => s.type),
    [profileMatSets],
  );

  const [setRaw, setSet] = useState<MatSetType>(() => {
    // Honour ?set=full from Google Shopping deep-links; if it isn't a
    // valid type for this vehicle's profile, fall back to the default.
    const fromUrl = searchParams?.get("set") as MatSetType | null;
    if (fromUrl && availableSetTypes.includes(fromUrl)) return fromUrl;
    return getDefaultMatSet(profile);
  });
  // Derived view of the chosen set. If the user navigates from a sedan
  // to a 2-seater without ever clicking the step (e.g. via search), the
  // raw state lags behind the profile — fall back to the profile default
  // for rendering and price math while keeping the raw state intact for
  // when they navigate back.
  const set: MatSetType = availableSetTypes.includes(setRaw)
    ? setRaw
    : getDefaultMatSet(profile);
  const [color, setColor] = useState(evaColors[0]);
  const [edge, setEdge] = useState(edgeColors[0]);
  const [year, setYear] = useState(() => {
    if (!model) return 0;
    // Honour ?year=YYYY from the home configurator if it matches a real year
    // for this model — otherwise fall back to the most recent.
    const fromUrl = Number(searchParams?.get("year") ?? "");
    if (Number.isFinite(fromUrl) && model.years.includes(fromUrl)) {
      return fromUrl;
    }
    return model.years[model.years.length - 1];
  });
  const [badge, setBadge] = useState(false);
  const [heelPad, setHeelPad] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't leak the "added" timeout across navigations / unmounts — would
  // otherwise trigger setState on an unmounted component (React 19 warns).
  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

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
  const ms =
    profileMatSets.find((s) => s.type === set) ?? profileMatSets[0];
  const cartModelId = `${brand.slug}-${model.slug}`;
  const unitPrice = calculateItemUnitPrice({
    matSet: ms.type,
    modelId: cartModelId,
    edgeColor: { id: edge.id },
    badge: badge && bdg ? { id: bdg.id } : null,
    heelPad,
  });

  const localizedColor = localizeColor(t, color.name);
  const localizedEdge = localizeColor(t, edge.name);
  const localizedSet = localizeMatSet(t, ms.label);

  const add = () => {
    addItem({
      modelId: cartModelId,
      brandName: brand.name,
      modelName: model.name,
      year,
      matSet: ms.type,
      matSetLabel: ms.label,
      color,
      edgeColor: edge,
      badge: badge && bdg ? bdg : undefined,
      heelPad,
      quantity: 1,
    });
    openCart();
    setAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 2000);
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold leading-tight">
                  {brand.name} {model.name}
                </h1>
                <p className="text-text-dim text-xs mt-1">
                  {localizeBody(t, model.bodyType)} · {t("prod.subtitleSuffix")}
                </p>
              </div>
              <WishlistButton
                modelId={cartModelId}
                brandSlug={brand.slug}
                modelSlug={model.slug}
                brandName={brand.name}
                modelName={model.name}
                bodyType={model.bodyType}
              />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-gold text-2xl font-bold">
                {formatPrice(unitPrice)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gold/10 px-2 py-1 ring-1 ring-gold/25 text-gold font-semibold">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                {t("ann.ships")}
              </span>
              <span className="inline-flex items-center gap-1 text-text-dim">
                <svg
                  className="w-3 h-3 text-gold/70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25"
                  />
                </svg>
                {t("ann.freeShipping")}
              </span>
              <span className="inline-flex items-center gap-1 text-text-dim">
                <svg
                  className="w-3 h-3 text-gold/70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                {t("ann.returns")}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {/* Step 1 — Year */}
              <div>
                <StepHeader n={1} label={t("prod.stepYear")} />
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full appearance-none glass-card rounded-lg px-3.5 py-3 pr-10 text-sm font-medium text-text cursor-pointer focus:outline-none focus:border-gold/50 hover:border-gold/30 transition-colors"
                    aria-label={t("prod.stepYear")}
                  >
                    {[...model.years]
                      .sort((a, b) => b - a)
                      .map((y) => (
                        <option key={y} value={y} className="bg-bg text-text">
                          {y}
                        </option>
                      ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
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
                          : profile === "minivan"
                            ? t("prod.profileMinivanHint")
                            : t("prod.profilePickupHint")}
                    </span>
                  </div>
                )}
                <div
                  className={`grid ${profileMatSets.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-2`}
                >
                  {profileMatSets.map((s) => {
                    const label = localizeMatSet(t, s.label);
                    const desc = localizeMatSetDesc(t, s.description);
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
                <div className="grid grid-cols-7 gap-1.5">
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
                    <span className="shrink-0 inline-flex items-center rounded-md bg-gold/10 px-2 py-1 text-[11px] font-bold text-gold ring-1 ring-gold/30">
                      +{formatPrice(BADGE_PRICE)}
                    </span>
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

              {/* Step 6 — Heel pad */}
              <div>
                <StepHeader n={6} label={t("prod.stepHeelPad")} />
                <label
                  className={`flex items-center gap-3 cursor-pointer glass-card rounded-lg p-3 transition-all duration-200 ${heelPad ? "!border-gold/50 shadow-[0_0_14px_rgba(212,165,74,0.12)]" : "glow-hover"}`}
                >
                  <input
                    type="checkbox"
                    checked={heelPad}
                    onChange={(e) => setHeelPad(e.target.checked)}
                    className="w-4 h-4 text-gold focus:ring-gold accent-[#D4A54A] rounded shrink-0"
                  />
                  <div className="relative w-16 h-10 rounded-md overflow-hidden shrink-0 ring-1 ring-black/40 bg-[linear-gradient(135deg,#C8C8C8_0%,#7A7A7A_50%,#A8A8A8_100%)] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.4)]">
                    <div
                      className="absolute inset-1.5 rounded-sm opacity-60"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 2px, transparent 2px 4px)",
                      }}
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-b from-white/45 to-transparent pointer-events-none" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-text text-xs font-semibold truncate">
                      {t("prod.heelPadName")}
                    </div>
                    <div className="text-text-dim text-[10px] mt-0.5 truncate">
                      {t("prod.heelPadSubtext")}
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center rounded-md bg-gold/10 px-2 py-1 text-[11px] font-bold text-gold ring-1 ring-gold/30">
                    +{formatPrice(HEEL_PAD_PRICE)}
                  </span>
                </label>
              </div>

              {/* Submit — desktop only */}
              <button
                onClick={add}
                className={`hidden lg:flex w-full py-4 rounded-xl text-[13px] font-semibold tracking-wider uppercase transition-all duration-300 items-center justify-center gap-2.5 ${added ? "bg-success text-bg" : "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_20px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.4)] hover:-translate-y-0.5 active:translate-y-0"}`}
              >
                {added ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                )}
                {added
                  ? t("prod.addedFull")
                  : t("prod.addToCartFull", { price: formatPrice(unitPrice) })}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductFaq brand={brand.name} model={model.name} />

      {/* Mobile sticky add-to-cart */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur-xl border-t border-border/50 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md border border-border/60 relative overflow-hidden shrink-0"
            style={{ backgroundColor: color.hex }}
            aria-hidden
          >
            <div
              className="absolute inset-0 border-[3px] rounded-md pointer-events-none"
              style={{ borderColor: edge.hex }}
            />
          </div>
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
            className={`flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-semibold tracking-[0.15em] uppercase shrink-0 transition-all duration-300 ${added ? "bg-success text-bg" : "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_18px_rgba(212,165,74,0.3)] active:scale-[0.97]"}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              viewBox="0 0 24 24"
              aria-hidden
            >
              {added ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              )}
            </svg>
            {added ? t("prod.addedShort") : t("prod.addToCartShort")}
          </button>
        </div>
      </div>
    </div>
  );
}
