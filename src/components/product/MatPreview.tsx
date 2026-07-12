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
  /** Render the aluminum heel pad (top-left driver area) when true. */
  showHeelPad?: boolean;
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
  showHeelPad,
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

          {/* Aluminum heel pad — brushed plate with rows of black
              rubber pill slots, matching the real part (see the add-ons
              photo). Sits under the pedals on the driver's side. */}
          {showHeelPad && (
            <g transform="translate(150, 160)">
              <defs>
                <linearGradient id="heelpad-grad" x1="0" y1="0" x2="0.2" y2="1">
                  <stop offset="0" stopColor="#E3E4E6" />
                  <stop offset="0.35" stopColor="#B9BBBE" />
                  <stop offset="0.65" stopColor="#CFD1D4" />
                  <stop offset="1" stopColor="#9EA0A4" />
                </linearGradient>
                <linearGradient id="heelpad-shine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(255,255,255,0.65)" />
                  <stop offset="1" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                {/* offset rows of rubber pills, like the real plate */}
                <pattern
                  id="heelpad-pills"
                  width="22"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <rect x="1" y="2" width="9" height="4.5" rx="2.25" fill="#1C1D1F" />
                  <rect x="13" y="2" width="6" height="4.5" rx="2.25" fill="#1C1D1F" />
                  <rect x="7" y="10" width="8" height="4.5" rx="2.25" fill="#1C1D1F" />
                  <rect x="18" y="10" width="4" height="4.5" rx="2.25" fill="#1C1D1F" />
                </pattern>
              </defs>
              {/* drop shadow */}
              <path
                d="M -52 -34 H 20 Q 26 -34 26 -28 L 26 -8 Q 26 -2 32 -2 H 46
                   Q 52 -2 52 4 L 52 28 Q 52 34 46 34 H -46 Q -52 34 -52 28 Z"
                fill="rgba(0,0,0,0.45)"
                transform="translate(2.5, 3.5)"
              />
              {/* base plate — notched dog-bone outline like the real part */}
              <path
                d="M -52 -34 H 20 Q 26 -34 26 -28 L 26 -8 Q 26 -2 32 -2 H 46
                   Q 52 -2 52 4 L 52 28 Q 52 34 46 34 H -46 Q -52 34 -52 28 Z"
                fill="url(#heelpad-grad)"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="0.8"
              />
              {/* pill slots, clipped a bit inside the plate */}
              <path
                d="M -47 -29 H 16 Q 21 -29 21 -24 L 21 -6 Q 21 2 29 2 H 42
                   Q 47 2 47 7 L 47 24 Q 47 29 42 29 H -42 Q -47 29 -47 24 Z"
                fill="url(#heelpad-pills)"
              />
              {/* brushed highlight */}
              <path
                d="M -52 -34 H 20 Q 26 -34 26 -28 L 26 -22 H -52 Z"
                fill="url(#heelpad-shine)"
                opacity="0.7"
              />
            </g>
          )}

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

          {/* Metal brand-logo plate — small enamel plate sewn next to the
              edge binding at the bottom of the mat, matching where the
              real plate sits on the product photos. */}
          {showBadge && brandLogoUrl && (
            <g transform="translate(160, 372)">
              <defs>
                <linearGradient id="plate-enamel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFFFFF" />
                  <stop offset="0.6" stopColor="#F2F3F4" />
                  <stop offset="1" stopColor="#DDDFE2" />
                </linearGradient>
                <linearGradient id="plate-rim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#E8E9EB" />
                  <stop offset="0.5" stopColor="#9A9CA0" />
                  <stop offset="1" stopColor="#C7C9CC" />
                </linearGradient>
              </defs>
              {/* drop shadow */}
              <rect
                x="-31"
                y="-8"
                width="62"
                height="16"
                rx="7"
                fill="rgba(0,0,0,0.5)"
                transform="translate(1.2, 1.8)"
              />
              {/* metal rim */}
              <rect
                x="-31"
                y="-8"
                width="62"
                height="16"
                rx="7"
                fill="url(#plate-rim)"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="0.4"
              />
              {/* white enamel face */}
              <rect
                x="-29.4"
                y="-6.4"
                width="58.8"
                height="12.8"
                rx="5.8"
                fill="url(#plate-enamel)"
              />
              {/* logo, centered, constrained */}
              <image
                href={brandLogoUrl}
                x="-24"
                y="-4.6"
                width="48"
                height="9.2"
                preserveAspectRatio="xMidYMid meet"
                aria-label={brandName}
              />
              {/* glossy streak across the top */}
              <rect
                x="-28"
                y="-6"
                width="56"
                height="4.5"
                rx="2.2"
                fill="rgba(255,255,255,0.5)"
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
