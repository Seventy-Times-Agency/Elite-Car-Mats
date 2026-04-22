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
 * Compact swatch for EVA base (diamond-grid variant) and PVC edge (solid
 * variant). Keeps the visual identity of the mat surface without eating
 * the whole step.
 */
export function MatColorSwatch({
  color,
  selected,
  localizedName,
  onClick,
  size = "md",
  variant = "diamond",
}: {
  color: ColorOption;
  selected: boolean;
  localizedName: string;
  onClick: () => void;
  size?: "sm" | "md";
  variant?: "diamond" | "solid";
}) {
  const isLight = lightness(color.hex) > 55;
  const dim = size === "sm" ? "w-9 h-9 rounded-lg" : "w-11 h-11 rounded-[10px]";
  const labelSize =
    size === "sm"
      ? "text-[9px] tracking-[0.08em]"
      : "text-[10px] tracking-[0.1em]";

  // Perfect diamond/rhombus tile — every swatch reads as a proper rhombus grid.
  const darkHex = encodeURIComponent("rgba(0,0,0,0.3)");
  const lightHex = encodeURIComponent("rgba(255,255,255,0.28)");
  const rhombSvg = (strokeUri: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath d='M7 0 L14 7 L7 14 L0 7 Z' fill='none' stroke='${strokeUri}' stroke-width='0.9'/%3E%3C/svg%3E")`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={localizedName}
      aria-pressed={selected}
      className="group flex flex-col items-center gap-1.5 focus:outline-none"
    >
      <div
        className={`relative ${dim} overflow-hidden transition-all duration-200 ${
          selected
            ? "ring-2 ring-gold ring-offset-2 ring-offset-bg scale-[1.08] shadow-[0_4px_14px_rgba(212,165,74,0.35)]"
            : "ring-1 ring-border/60 group-hover:ring-gold/45 group-hover:scale-[1.04]"
        }`}
        style={{ backgroundColor: color.hex }}
      >
        {variant === "diamond" && (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: rhombSvg(darkHex),
                backgroundSize: "14px 14px",
                opacity: isLight ? 0.85 : 0.4,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: rhombSvg(lightHex),
                backgroundSize: "14px 14px",
                opacity: isLight ? 0.25 : 0.75,
              }}
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-black/22 pointer-events-none" />
        {variant === "solid" && isLight && (
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-[inherit]" />
        )}
        {selected && (
          <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-gold text-bg flex items-center justify-center shadow-[0_1px_4px_rgba(212,165,74,0.5)]">
            <svg
              className="w-2 h-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={3.5}
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
        className={`${labelSize} font-semibold uppercase transition-colors max-w-[4.5rem] text-center leading-tight whitespace-nowrap ${
          selected ? "text-gold" : "text-text-dim group-hover:text-text"
        }`}
      >
        {localizedName}
      </span>
    </button>
  );
}
