import { ImageResponse } from "next/og";

export const alt = "Elite Car Mats — Premium EVA car mats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #1a1a1a 0%, #0F0F0F 60%, #0A0A0A 100%)",
          color: "#F0ECE5",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            opacity: 0.12,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='139' viewBox='0 0 80 139' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0 L80 23 L80 69 L40 92 L0 69 L0 23 Z' stroke='%23D4A54A' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: "80px 139px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative" }}>
          <div
            style={{
              width: 88,
              height: 88,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #D4A54A, #B8912E)",
              borderRadius: 16,
              fontSize: 64,
              fontWeight: 800,
              color: "#0F0F0F",
              fontFamily: "Georgia, serif",
              boxShadow: "0 12px 40px rgba(212,165,74,0.3)",
            }}
          >
            E
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "0.12em", color: "#F0ECE5" }}>
              ELITE CAR MATS
            </div>
            <div style={{ fontSize: 18, color: "#D4A54A", letterSpacing: "0.25em", marginTop: 6 }}>
              PREMIUM EVA · USA
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative", gap: 8 }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Коврики,
          </div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
            достойные
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #E8C068, #D4A54A, #B8912E)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            вашего авто
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
          <div style={{ display: "flex", gap: 56 }}>
            {[
              { v: "800+", l: "PATTERNS" },
              { v: "5 лет", l: "СЛУЖАТ" },
              { v: "2 года", l: "ГАРАНТИЯ" },
            ].map((s) => (
              <div key={s.l} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: "#D4A54A" }}>{s.v}</div>
                <div style={{ fontSize: 14, color: "#A09888", letterSpacing: "0.2em", marginTop: 4 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 18, color: "#A09888", letterSpacing: "0.15em" }}>
            ELITECARMATS.US
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
