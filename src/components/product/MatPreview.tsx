"use client";

interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

interface MatPreviewProps {
  color: ColorOption;
  edgeColor: ColorOption;
  /** Metal brand-logo medallion — shown when true + brandLogoUrl given. */
  showBadge?: boolean;
  brandLogoUrl?: string;
  brandName?: string;
}

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export function MatPreview({
  color,
  edgeColor,
  showBadge,
  brandLogoUrl,
  brandName,
}: MatPreviewProps) {
  const light = isLight(color.hex);
  const cellWall = light ? "rgba(0,0,0,0.20)" : "rgba(255,255,255,0.08)";
  const cellFloor = light ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.35)";
  const cellHighlight = light ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.06)";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 600 450"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[560px] h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Honeycomb pattern with 3D depth */}
          <pattern id="honeycomb" x="0" y="0" width="24" height="27.7" patternUnits="userSpaceOnUse">
            {/* Cell floor (recessed darker area) */}
            <polygon
              points="12,2 22,7.9 22,19.8 12,25.7 2,19.8 2,7.9"
              fill={cellFloor}
            />
            {/* Cell wall highlight (top edge of each hex, catches light) */}
            <polygon
              points="12,0 24,6.925 22,7.9 12,2 2,7.9 0,6.925"
              fill={cellHighlight}
            />
            {/* Cell wall outline */}
            <polygon
              points="12,0 24,6.925 24,20.775 12,27.7 0,20.775 0,6.925"
              fill="none"
              stroke={cellWall}
              strokeWidth="0.7"
            />
          </pattern>

          {/* Overall mat shine gradient */}
          <linearGradient id="matShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </linearGradient>

          {/* Edge binding gradient (fabric look) */}
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={edgeColor.hex} stopOpacity="1" />
            <stop offset="50%" stopColor={edgeColor.hex} stopOpacity="0.95" />
            <stop offset="100%" stopColor={edgeColor.hex} stopOpacity="0.75" />
          </linearGradient>

          {/* Inner shadow (depth around edges) */}
          <filter id="innerShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feFlood floodColor="#000" floodOpacity="0.5" />
            <feComposite in2="offsetblur" operator="in" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="300" cy="425" rx="250" ry="10" fill="rgba(0,0,0,0.5)" />

        {/* Mat group */}
        <g>
          {/* Outer edge binding (the trim) */}
          <path
            d="M 40 50
               Q 40 30, 60 30
               L 540 30
               Q 560 30, 560 50
               L 560 400
               Q 560 420, 540 420
               L 60 420
               Q 40 420, 40 400
               Z"
            fill="url(#edgeGrad)"
          />

          {/* Stitching line — inner */}
          <path
            d="M 52 52
               Q 52 42, 62 42
               L 538 42
               Q 548 42, 548 52
               L 548 398
               Q 548 408, 538 408
               L 62 408
               Q 52 408, 52 398
               Z"
            fill="none"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="0.8"
            strokeDasharray="2.5 1.5"
          />

          {/* Inner mat surface (base color) */}
          <rect
            x="62"
            y="52"
            width="476"
            height="346"
            rx="6"
            fill={color.hex}
          />

          {/* Honeycomb texture overlay */}
          <rect
            x="62"
            y="52"
            width="476"
            height="346"
            rx="6"
            fill="url(#honeycomb)"
          />

          {/* Overall shine */}
          <rect
            x="62"
            y="52"
            width="476"
            height="346"
            rx="6"
            fill="url(#matShine)"
          />

          {/* Inner edge shadow (gives depth feel) */}
          <rect
            x="62"
            y="52"
            width="476"
            height="346"
            rx="6"
            fill="none"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1.5"
          />

          {/* Fixation hole (heel pad area) */}
          <circle cx="480" cy="340" r="8" fill="rgba(0,0,0,0.35)" />
          <circle cx="480" cy="340" r="4" fill={color.hex} opacity="0.4" />

          {/* Sewn brand tag (ELITECARMATS.US) — always present on every mat */}
          <g transform="translate(440, 395)">
            <rect
              x="-35"
              y="-9"
              width="70"
              height="18"
              rx="1"
              fill="rgba(0,0,0,0.5)"
              transform="translate(1, 1)"
            />
            <rect
              x="-35"
              y="-9"
              width="70"
              height="18"
              rx="1"
              fill="#0A0A0A"
              stroke="rgba(0,0,0,0.8)"
              strokeWidth="0.5"
            />
            <rect
              x="-33"
              y="-7"
              width="66"
              height="14"
              rx="0.5"
              fill="none"
              stroke="rgba(255,220,100,0.15)"
              strokeWidth="0.3"
              strokeDasharray="1.5 1"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fill="#F5D34E"
              fontSize="7.5"
              fontWeight="700"
              letterSpacing="0.8"
              fontFamily="Inter, sans-serif"
            >
              ELITECARMATS.US
            </text>
          </g>

          {/* Metal brand-logo medallion — driver-side top, only when the
              customer adds the optional badge AND supplier has one in stock. */}
          {showBadge && brandLogoUrl && (
            <g transform="translate(135, 115)">
              <defs>
                <radialGradient id="medallion-face" cx="0.35" cy="0.3" r="0.9">
                  <stop offset="0" stopColor="#5a5a5a" />
                  <stop offset="0.45" stopColor="#2a2a2a" />
                  <stop offset="1" stopColor="#0d0d0d" />
                </radialGradient>
                <linearGradient id="medallion-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#F5D680" />
                  <stop offset="0.5" stopColor="#B8912E" />
                  <stop offset="1" stopColor="#8C6E1C" />
                </linearGradient>
                <clipPath id="medallion-clip">
                  <circle cx="0" cy="0" r="22" />
                </clipPath>
              </defs>
              {/* drop shadow under medallion */}
              <circle cx="1.5" cy="2" r="27" fill="rgba(0,0,0,0.35)" filter="url(#innerShadow)" />
              {/* outer metallic ring */}
              <circle cx="0" cy="0" r="27" fill="url(#medallion-ring)" />
              {/* inner bevel ring */}
              <circle cx="0" cy="0" r="24" fill="#111" />
              {/* face */}
              <circle cx="0" cy="0" r="22" fill="url(#medallion-face)" />
              {/* logo */}
              <image
                href={brandLogoUrl}
                x="-18"
                y="-13"
                width="36"
                height="26"
                preserveAspectRatio="xMidYMid meet"
                clipPath="url(#medallion-clip)"
                aria-label={brandName}
              />
              {/* top highlight */}
              <ellipse
                cx="-4"
                cy="-15"
                rx="13"
                ry="5"
                fill="rgba(255,255,255,0.18)"
              />
            </g>
          )}
        </g>

        {/* Top ambient light reflection */}
        <ellipse
          cx="300"
          cy="80"
          rx="200"
          ry="20"
          fill="rgba(255,255,255,0.06)"
        />
      </svg>

      {/* Floating gold particles */}
      <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-gold/30 rounded-full blur-[1px]" />
      <div className="absolute bottom-12 left-12 w-1 h-1 bg-gold/20 rounded-full" />
    </div>
  );
}
