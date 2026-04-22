"use client";

interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

function lightness(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
}

/**
 * Swatch for EVA base colors (honeycomb variant) and PVC edge colors (solid
 * variant). Both share selected / hover treatments so the picker feels
 * consistent.
 */
export function MatColorSwatch({
  color,
  selected,
  localizedName,
  onClick,
  size = "md",
  variant = "honeycomb",
}: {
  color: ColorOption;
  selected: boolean;
  localizedName: string;
  onClick: () => void;
  size?: "sm" | "md";
  variant?: "honeycomb" | "solid";
}) {
  const isLight = lightness(color.hex) > 55;
  const dim = size === "sm" ? "w-12 h-12 rounded-xl" : "w-16 h-16 rounded-2xl";
  const label =
    size === "sm"
      ? "text-[10px] tracking-[0.1em]"
      : "text-[11px] tracking-[0.12em]";

  const darkHex = encodeURIComponent("rgba(0,0,0,0.28)");
  const lightHex = encodeURIComponent("rgba(255,255,255,0.22)");
  const hexSvg = (strokeUri: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='45' viewBox='0 0 26 45'%3E%3Cpath d='M13 0 L26 7.5 L26 22.5 L13 30 L0 22.5 L0 7.5 Z' fill='none' stroke='${strokeUri}' stroke-width='1.1'/%3E%3Cpath d='M13 30 L26 37.5 L13 45 L0 37.5 Z' fill='none' stroke='${strokeUri}' stroke-width='1.1'/%3E%3C/svg%3E")`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={localizedName}
      aria-pressed={selected}
      className="group flex flex-col items-center gap-2 focus:outline-none"
    >
      <div
        className={`relative ${dim} overflow-hidden transition-all duration-200 ${
          selected
            ? "ring-2 ring-gold ring-offset-2 ring-offset-bg scale-[1.08] shadow-[0_6px_18px_rgba(212,165,74,0.35)]"
            : "ring-1 ring-border/60 group-hover:ring-gold/45 group-hover:scale-[1.04]"
        }`}
        style={{ backgroundColor: color.hex }}
      >
        {variant === "honeycomb" && (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: hexSvg(darkHex),
                backgroundSize: "26px 45px",
                opacity: isLight ? 0.85 : 0.35,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: hexSvg(lightHex),
                backgroundSize: "26px 45px",
                opacity: isLight ? 0.25 : 0.75,
              }}
            />
          </>
        )}
        {/* Glossy highlight — applies to both variants for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/25 pointer-events-none" />
        {/* Extra hairline for very light solids so they read against the card */}
        {variant === "solid" && isLight && (
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none" />
        )}
        {selected && (
          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gold text-bg flex items-center justify-center shadow-[0_2px_8px_rgba(212,165,74,0.5)]">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
        )}
      </div>
      <span
        className={`${label} font-semibold uppercase transition-colors max-w-[5rem] text-center leading-tight ${
          selected ? "text-gold" : "text-text-dim group-hover:text-text"
        }`}
      >
        {localizedName}
      </span>
    </button>
  );
}
