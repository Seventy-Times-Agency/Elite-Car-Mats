"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { evaColors, edgeColors, badges } from "@/data/catalog";
import { matPhotoSrc } from "@/data/catalog/mat-photos";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";
import { useCart } from "@/context/CartContext";
import { MatPreview } from "@/components/product/MatPreview";
import { MatColorSwatch } from "@/components/product/MatColorSwatch";
import type { Brand, CarModel, MatSetType } from "@/types";
import {
  getBadgePrice,
  getHeelPadPrice,
  calculateItemUnitPrice,
  formatPrice,
} from "@/lib/pricing";
import {
  getVehicleProfile,
  getDefaultMatSet,
  type VehicleConfigProfile,
} from "@/lib/vehicle-profile";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/ProductJsonLd";
import { trackEvent } from "@/lib/analytics";
import { ProductFaq } from "@/components/product/ProductFaq";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useT } from "@/i18n/I18nProvider";
import {
  localizeBody,
  localizeColor,
  localizeMatSet,
  localizeMatSetDesc,
} from "@/i18n/labels";
import { usePriceOverrides } from "@/context/PriceOverridesContext";

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
  addonAvailability = { badges: true, heelPad: true },
}: {
  brand: Brand | null;
  model: CarModel | null;
  /** Operator stock switches — out-of-stock add-ons are not offered. */
  addonAvailability?: { badges: boolean; heelPad: boolean };
}) {
  const searchParams = useSearchParams();
  const t = useT();
  const { addItem, openCart } = useCart();
  const priceOverrides = usePriceOverrides();

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
  const [badgeCount, setBadgeCount] = useState(1);
  const [heelPad, setHeelPad] = useState(false);
  // Trim/floor configuration note (hybrid, AWD, captain chairs...) — one
  // model can have different floor pans; the workshop cuts by this.
  const [configNote, setConfigNote] = useState("");
  // Preview mode. Real photos exist for the black mat (one per edge
  // color); other mat colors fall back to the schematic preview until
  // the supplier shoots them.
  const [previewMode, setPreviewMode] = useState<"photo" | "scheme">("photo");
  // Gallery: slide 0 is the live configurator view (color-variant photo
  // or the schematic), the rest are static product shots. Color-swatch
  // clicks jump back to slide 0 so the "what am I buying" feedback loop
  // stays tight.
  const [slide, setSlide] = useState(0);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't leak the "added" timeout across navigations / unmounts — would
  // otherwise trigger setState on an unmounted component (React 19 warns).
  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  // Meta Pixel: product view. Inert until the pixel id is configured.
  useEffect(() => {
    if (!brand || !model) return;
    trackEvent("ViewContent", {
      content_type: "product",
      content_ids: [`${brand.slug}-${model.slug}`],
      content_name: `${brand.name} ${model.name}`,
    });
  }, [brand, model]);

  if (!brand || !model)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">{t("prod.notFound")}</h1>
        <Link href="/catalog" className="mt-3 inline-block text-gold text-sm">
          {t("nav.catalog")}
        </Link>
      </div>
    );

  // Out-of-stock plates behave like "no plate for this brand" — the
  // option renders in its unavailable state and can't be added.
  const bdg = addonAvailability.badges
    ? badges.find((b) => b.brandName === brand.name)
    : undefined;
  const ms =
    profileMatSets.find((s) => s.type === set) ?? profileMatSets[0];
  const cartModelId = `${brand.slug}-${model.slug}`;
  // One plate per mat, cargo included — cap follows the chosen set. The
  // raw count survives set switches; it's re-clamped for render/price so
  // going full-cargo (5) → cargo (1) → back keeps the user's pick.
  const badgeMax = ms.mats;
  const effBadgeCount = Math.min(badgeCount, badgeMax);
  // Heel pad lives on the driver's mat — a cargo-only set has none.
  // Also hidden entirely while the operator marks it out of stock.
  const heelPadAvailable = ms.type !== "cargo" && addonAvailability.heelPad;
  const effHeelPad = heelPad && heelPadAvailable;
  const unitPrice = calculateItemUnitPrice(
    {
      matSet: ms.type,
      modelId: cartModelId,
      edgeColor: { id: edge.id },
      badge: badge && bdg ? { id: bdg.id } : null,
      badgeCount: effBadgeCount,
      heelPad: effHeelPad,
    },
    priceOverrides,
  );

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
      badgeCount: badge && bdg ? effBadgeCount : undefined,
      heelPad: effHeelPad,
      configNote: configNote.trim() || undefined,
      quantity: 1,
    });
    trackEvent("AddToCart", {
      content_type: "product",
      content_ids: [cartModelId],
      value: unitPrice,
      currency: "USD",
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-5 pb-28 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 lg:gap-10">
          {/* Mobile-only header — name + price sit above the photo so the
              configurator (year → set → colors) starts right under it. On
              desktop this is hidden and the header shows in the right column. */}
          <div className="lg:hidden -mb-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold leading-tight">
                  {brand.name} {model.name}
                </p>
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
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-gold text-2xl font-bold">
                {formatPrice(unitPrice)}
              </span>
            </div>
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            {(() => {
              const photoSrc = matPhotoSrc(color.id, edge.id);
              const showVariantPhoto =
                photoSrc !== null && previewMode === "photo";
              const gallery = [
                { src: "/mats/gallery/g01-hero-colors.jpg", alt: t("prod.galleryAltHeroColors") },
                { src: "/mats/gallery/g02-install-front.jpg", alt: t("prod.galleryAltInstallFront") },
                { src: "/mats/gallery/g03-install-heelpad.jpg", alt: t("prod.galleryAltInstallHeel") },
                { src: "/mats/gallery/g04-rear-red.jpg", alt: t("prod.galleryAltRearRed") },
                { src: "/mats/gallery/g05-rear-black.jpg", alt: t("prod.galleryAltRearBlack") },
                { src: "/mats/gallery/g06-trunk-sedan.jpg", alt: t("prod.galleryAltTrunkSedan") },
                { src: "/mats/gallery/g07-trunk-suv.jpg", alt: t("prod.galleryAltTrunkSuv") },
                { src: "/mats/gallery/g08-edge-swatches.jpg", alt: t("prod.galleryAltEdgeSwatches") },
                { src: "/mats/gallery/g09-addons.jpg", alt: t("prod.galleryAltAddons") },
                { src: "/mats/gallery/g10-texture.jpg", alt: t("prod.galleryAltTexture") },
                { src: "/mats/gallery/g11-poster.jpg", alt: t("prod.galleryAltPoster") },
                { src: "/mats/gallery/g12-before-after.jpg", alt: t("prod.galleryAltBeforeAfter") },
              ];
              const slidesCount = 1 + gallery.length;
              const go = (d: number) =>
                setSlide((p) => (p + d + slidesCount) % slidesCount);
              const isLive = slide === 0;
              return (
                <div>
                  <div className="aspect-[2/3] glass-card rounded-xl relative overflow-hidden p-4 lg:p-5 max-w-[290px] mx-auto lg:max-w-none">
                    {isLive ? (
                      showVariantPhoto ? (
                        <Image
                          src={photoSrc}
                          alt={t("prod.photoAlt", {
                            color: localizedColor,
                            edge: localizedEdge,
                          })}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <MatPreview
                          color={color}
                          edgeColor={edge}
                          showBadge={badge && !!bdg}
                          showHeelPad={effHeelPad}
                          brandLogoUrl={brand.logo}
                          brandName={brand.name}
                        />
                      )
                    ) : (
                      <Image
                        src={gallery[slide - 1].src}
                        alt={gallery[slide - 1].alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] text-gold/60 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                      {t("prod.previewLabel")}
                    </div>
                    {isLive && photoSrc && (
                      <div className="absolute top-2.5 right-2.5 flex rounded-lg overflow-hidden border border-border/60 bg-bg/70 backdrop-blur-sm">
                        {(["photo", "scheme"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPreviewMode(m)}
                            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                              previewMode === m
                                ? "bg-gold text-bg"
                                : "text-text-dim hover:text-gold"
                            }`}
                          >
                            {m === "photo"
                              ? t("prod.viewPhoto")
                              : t("prod.viewScheme")}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Prev / next arrows */}
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label={t("prod.galleryPrev")}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg/70 backdrop-blur-sm border border-border/60 text-text-dim hover:text-gold hover:border-gold/50 transition-colors flex items-center justify-center"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      aria-label={t("prod.galleryNext")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg/70 backdrop-blur-sm border border-border/60 text-text-dim hover:text-gold hover:border-gold/50 transition-colors flex items-center justify-center"
                    >
                      ›
                    </button>
                  </div>
                  {/* Thumbnails — single scrollable row on desktop, hidden on mobile */}
                  <div className="hidden lg:flex mt-2.5 gap-1.5 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setSlide(0)}
                      aria-label={t("prod.galleryYourColors")}
                      title={t("prod.galleryYourColors")}
                      className={`w-12 h-12 shrink-0 rounded-lg overflow-hidden relative border transition-colors ${
                        slide === 0
                          ? "border-gold"
                          : "border-border/50 hover:border-gold/40"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <span
                        className="absolute inset-1 rounded-md border-[3px]"
                        style={{ borderColor: edge.hex }}
                        aria-hidden
                      />
                    </button>
                    {gallery.map((g, i) => (
                      <button
                        key={g.src}
                        type="button"
                        onClick={() => setSlide(i + 1)}
                        aria-label={g.alt}
                        className={`w-12 h-12 shrink-0 rounded-lg overflow-hidden relative border transition-colors ${
                          slide === i + 1
                            ? "border-gold"
                            : "border-border/50 hover:border-gold/40"
                        }`}
                      >
                        <Image
                          src={g.src}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  {isLive && showVariantPhoto && (
                    <p className="mt-2 text-[10.5px] text-text-faint leading-snug px-1">
                      {t("prod.photoNote")}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          <div>
            {/* Header repeats on desktop; on mobile it moves above the
                photo (see the lg:hidden block at the top of the grid) so
                the configurator sits right under the photo. */}
            <div className="hidden lg:block">
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
            </div>

            {/* Year picker — promoted out of the step list because it's a
                "which generation of this car do you have" qualifier, not
                a configurator choice. Sits between the trust strip and
                the configurator so the user confirms fit before styling. */}
            <div className="mt-4 flex items-center gap-2.5">
              <label
                htmlFor="year-picker"
                className="text-[10px] uppercase tracking-[0.18em] text-text-dim font-semibold"
              >
                {t("prod.stepYear")}
              </label>
              <div className="relative">
                <select
                  id="year-picker"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="appearance-none rounded-md bg-bg/40 border border-border/60 hover:border-gold/40 text-text text-xs font-semibold pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-none focus:border-gold/60 transition-colors"
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
                  className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gold/70"
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

            <div className="mt-5 space-y-4">
              {/* Section 1 — Set */}
              <section className="glass-card rounded-xl p-4">
                <StepHeader n={1} label={t("prod.stepSet")} value={localizedSet} />
                {profile !== "standard" && (
                  <div className="mb-3 flex items-start gap-2 rounded-md border border-gold/15 bg-gold/[0.04] px-2.5 py-1.5">
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
                            : "border border-border/50 bg-bg/30 hover:border-gold/30 hover:bg-bg/50"
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
              </section>

              {/* Section 2 — Style (mat color + edge color, one decision) */}
              <section className="glass-card rounded-xl p-4">
                <StepHeader
                  n={2}
                  label={t("prod.stepStyle")}
                  value={`${localizedColor} · ${localizedEdge}`}
                />
                {/* Two symmetric columns: mat color (left) and edge
                    binding (right), with a divider between. Reads as one
                    balanced "style" decision instead of two stacked rows. */}
                <div className="grid grid-cols-2 gap-0">
                  <div className="pr-4">
                    <div className="flex items-baseline justify-between gap-2 mb-3">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-gold/75 font-semibold">
                        {t("prod.stepColor")}
                      </span>
                      <span className="text-[10px] text-text-dim truncate">
                        {localizedColor}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 justify-items-center">
                      {evaColors.map((c) => (
                        <MatColorSwatch
                          key={c.id}
                          color={c}
                          selected={color.id === c.id}
                          localizedName={localizeColor(t, c.name)}
                          onClick={() => {
                            setColor(c);
                            setSlide(0);
                          }}
                          showLabel={false}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="pl-4 border-l border-border/40">
                    <div className="flex items-baseline justify-between gap-2 mb-3">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-gold/75 font-semibold">
                        {t("prod.stepEdge")}
                      </span>
                      <span className="text-[10px] text-text-dim truncate">
                        {localizedEdge}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 justify-items-center">
                      {edgeColors.map((c) => (
                        <MatColorSwatch
                          key={c.id}
                          color={c}
                          selected={edge.id === c.id}
                          localizedName={localizeColor(t, c.name)}
                          onClick={() => {
                            setEdge(c);
                            setSlide(0);
                          }}
                          size="sm"
                          variant="solid"
                          showLabel={false}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 — Add-ons (badge + heel pad in one block) */}
              <section className="glass-card rounded-xl p-4">
                <StepHeader n={3} label={t("prod.stepAddons")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bdg ? (
                    <div
                      className={`rounded-lg p-3 transition-all duration-200 border ${badge ? "border-gold/60 bg-gold-glow shadow-[0_0_14px_rgba(212,165,74,0.12)]" : "border-border/50 bg-bg/30 hover:border-gold/30 hover:bg-bg/50"}`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={badge}
                          onChange={(e) => setBadge(e.target.checked)}
                          className="w-4 h-4 text-gold focus:ring-gold accent-[#D4A54A] rounded shrink-0"
                        />
                        {/* Photo-real thumb: honeycomb EVA + the actual
                            brushed plate (logo overlaid per brand). */}
                        <div
                          className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 ring-1 ring-border/50 flex items-center justify-center"
                          style={{
                            backgroundImage: "url(/swatches/eva-black.jpg)",
                            backgroundSize: "cover",
                          }}
                        >
                          <div
                            className="relative w-12 h-[13px] rounded-[2px] overflow-hidden ring-1 ring-black/50 -rotate-6 flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.55)]"
                            style={{
                              backgroundImage: "url(/addons/badge-plate.jpg)",
                              backgroundSize: "cover",
                            }}
                          >
                            {brand.logo && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="max-w-[78%] max-h-[80%] object-contain drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.4)]"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-text text-[11px] font-semibold truncate">
                            {t("prod.stepBadge")}
                          </div>
                          <div className="text-text-dim text-[10px] mt-0.5 truncate">
                            {t("prod.badgeSubtext")}
                          </div>
                        </div>
                        <span className="shrink-0 inline-flex items-center rounded-md bg-gold/10 px-2 py-1 text-[11px] font-bold text-gold ring-1 ring-gold/30">
                          +{formatPrice(getBadgePrice(priceOverrides) * (badge ? effBadgeCount : 1))}
                        </span>
                      </label>
                      {badge && badgeMax > 1 && (
                        <div className="mt-2.5 pt-2.5 border-t border-gold/15 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-text-dim leading-snug">
                            {t("prod.badgeQtyLabel", { max: badgeMax })}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setBadgeCount(Math.max(1, effBadgeCount - 1))
                              }
                              disabled={effBadgeCount <= 1}
                              aria-label={t("prod.badgeQtyDec")}
                              className="w-6 h-6 rounded-md border border-border/60 text-text text-sm leading-none hover:border-gold/50 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-gold tabular-nums">
                              {effBadgeCount}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setBadgeCount(Math.min(badgeMax, effBadgeCount + 1))
                              }
                              disabled={effBadgeCount >= badgeMax}
                              aria-label={t("prod.badgeQtyInc")}
                              className="w-6 h-6 rounded-md border border-border/60 text-text text-sm leading-none hover:border-gold/50 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-surface/30 p-3">
                      <div className="w-14 h-14 rounded-lg border border-dashed border-border/70 flex items-center justify-center shrink-0 text-text-faint">
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
                        <div className="text-text-dim text-[11px] font-semibold truncate">
                          {t("prod.badgeUnavailable")}
                        </div>
                        <div className="text-text-faint text-[10px] mt-0.5 leading-snug truncate">
                          {t("prod.badgeUnavailableSub", { brand: brand.name })}
                        </div>
                      </div>
                    </div>
                  )}

                  {heelPadAvailable && (
                  <label
                    className={`flex items-center gap-3 cursor-pointer rounded-lg p-3 transition-all duration-200 border ${effHeelPad ? "border-gold/60 bg-gold-glow shadow-[0_0_14px_rgba(212,165,74,0.12)]" : "border-border/50 bg-bg/30 hover:border-gold/30 hover:bg-bg/50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={effHeelPad}
                      onChange={(e) => setHeelPad(e.target.checked)}
                      className="w-4 h-4 text-gold focus:ring-gold accent-[#D4A54A] rounded shrink-0"
                    />
                    {/* Photo of the real aluminum heel pad. */}
                    <div
                      className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 ring-1 ring-border/50"
                      style={{
                        backgroundImage: "url(/addons/heelpad-thumb.jpg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-text text-[11px] font-semibold truncate">
                        {t("prod.heelPadName")}
                      </div>
                      <div className="text-text-dim text-[10px] mt-0.5 truncate">
                        {t("prod.heelPadSubtext")}
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-md bg-gold/10 px-2 py-1 text-[11px] font-bold text-gold ring-1 ring-gold/30">
                      +{formatPrice(getHeelPadPrice(priceOverrides))}
                    </span>
                  </label>
                  )}
                </div>
                {/* Trim / floor-pan note: hybrids, AWD, captain chairs —
                    the workshop picks the cut pattern by this. */}
                <div className="mt-3">
                  <label
                    htmlFor="cfg-note"
                    className="block text-[10px] uppercase tracking-[0.15em] text-text-dim font-semibold mb-1.5"
                  >
                    {t("prod.configNoteLabel")}
                  </label>
                  <input
                    id="cfg-note"
                    value={configNote}
                    onChange={(e) => setConfigNote(e.target.value)}
                    maxLength={120}
                    placeholder={t("prod.configNotePh")}
                    className="w-full bg-bg/40 border border-border/60 rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
              </section>

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
