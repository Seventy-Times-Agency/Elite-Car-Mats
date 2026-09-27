"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePriceOverrides } from "@/context/PriceOverridesContext";
import { useT } from "@/i18n/I18nProvider";
import { formatPrice, getAccessoryPrice } from "@/lib/pricing";
import { accessorySku, type Accessory } from "@/data/accessories";
import { accessoryView } from "@/lib/accessories/display";
import { trackEvent } from "@/lib/analytics";

export function AccessoryClient({
  accessory,
  available,
  initialVariant,
}: {
  accessory: Accessory;
  available: boolean;
  initialVariant?: string;
}) {
  const t = useT();
  const { addItem, openCart } = useCart();
  const priceOverrides = usePriceOverrides();
  const [variantId, setVariantId] = useState(
    accessory.variants.some((v) => v.id === initialVariant)
      ? initialVariant!
      : accessory.variants[0].id,
  );
  const [imageIdx, setImageIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const variant = accessory.variants.find((v) => v.id === variantId)!;
  const view = accessoryView(t, accessory.slug, variant.id);
  const price = getAccessoryPrice(accessory.slug, priceOverrides);
  const images = [...variant.images, ...accessory.gallery];
  const main = images[Math.min(imageIdx, images.length - 1)];

  const pickVariant = (id: string) => {
    setVariantId(id);
    setImageIdx(0);
  };

  const add = () => {
    addItem({
      kind: "accessory",
      accessorySlug: accessory.slug,
      variantId: variant.id,
      quantity: 1,
    });
    trackEvent("AddToCart", {
      content_type: "product",
      content_ids: [accessorySku(accessory.slug, variant.id)],
      contents: [
        { id: accessorySku(accessory.slug, variant.id), quantity: 1, item_price: price },
      ],
      value: price,
      currency: "USD",
    });
    openCart();
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Gallery */}
      <div>
        <div className="glass-card rounded-2xl overflow-hidden aspect-[4/3] relative">
          <Image
            key={main}
            src={main}
            alt={`${view.title} — ${view.variantLabel}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setImageIdx(i)}
              aria-label={`${view.title} ${i + 1}`}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-colors ${
                i === Math.min(imageIdx, images.length - 1)
                  ? "border-gold"
                  : "border-border/50 hover:border-gold/40"
              }`}
            >
              <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold">{view.title}</h1>
        <p className="mt-3 text-text-dim text-sm leading-relaxed">
          {t(`acc.${accessory.slug}.short`)}
        </p>
        <div className="mt-5 text-3xl font-semibold text-gold">{formatPrice(price)}</div>

        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-text-faint mb-2">
            {t("acc.variantLabel")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {accessory.variants.map((v) => {
              const vv = accessoryView(t, accessory.slug, v.id);
              const active = v.id === variant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => pickVariant(v.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                    active
                      ? "border-2 border-gold bg-gold-glow"
                      : "border border-border/50 bg-bg/30 hover:border-gold/30"
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-md border-[3px] shrink-0"
                    style={{ backgroundColor: vv.evaHex, borderColor: vv.edgeHex }}
                    aria-hidden
                  />
                  <span className="text-text">{vv.variantLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={add}
          disabled={!available}
          className={`mt-6 w-full py-4 rounded-xl text-[13px] font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${
            added
              ? "bg-success text-bg"
              : "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_20px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.4)] hover:-translate-y-0.5"
          }`}
        >
          {!available
            ? t("acc.soldOut")
            : added
              ? t("acc.inCart")
              : t("acc.addToCart", { price: formatPrice(price) })}
        </button>

        <ul className="mt-8 space-y-2.5 text-sm text-text-dim">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="flex gap-3">
              <span className="text-gold mt-0.5" aria-hidden>
                ✓
              </span>
              <span>{t(`acc.${accessory.slug}.f${n}`)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-text-dim leading-relaxed">
          {t(`acc.${accessory.slug}.desc`)}
        </p>

        <p className="mt-6 text-xs text-text-faint">
          <Link href="/catalog" className="text-gold hover:underline">
            {t("nav.catalog")}
          </Link>
          {" · "}
          <Link href="/delivery" className="hover:text-text">
            {t("delivery.t2")}
          </Link>
        </p>
      </div>
    </div>
  );
}
