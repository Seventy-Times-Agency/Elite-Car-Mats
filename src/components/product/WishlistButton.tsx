"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useT } from "@/i18n/I18nProvider";

export function WishlistButton({
  modelId,
  brandSlug,
  modelSlug,
  brandName,
  modelName,
  bodyType,
  size = "md",
}: {
  modelId: string;
  brandSlug: string;
  modelSlug: string;
  brandName: string;
  modelName: string;
  bodyType?: string;
  size?: "sm" | "md";
}) {
  const { has, toggle } = useWishlist();
  const t = useT();
  const saved = has(modelId);

  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const ico = size === "sm" ? "w-4 h-4" : "w-[18px] h-[18px]";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({
          modelId,
          brandSlug,
          modelSlug,
          brandName,
          modelName,
          bodyType,
        });
      }}
      aria-pressed={saved}
      aria-label={saved ? t("wish.removeAria") : t("wish.addAria")}
      title={saved ? t("wish.removeTitle") : t("wish.addTitle")}
      className={`${dim} inline-flex items-center justify-center rounded-full border transition-all duration-200 ${
        saved
          ? "bg-gold/15 border-gold/50 text-gold shadow-[0_0_12px_rgba(212,165,74,0.18)]"
          : "bg-bg/60 border-border/60 text-text-dim hover:border-gold/40 hover:text-gold"
      }`}
    >
      <svg
        className={ico}
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.687-4.5-1.935 0-3.597 1.126-4.313 2.733-.715-1.607-2.378-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
}
