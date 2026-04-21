import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F0F0F",
          borderRadius: "12px",
          fontSize: 44,
          fontWeight: 800,
          color: "#D4A54A",
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.04em",
        }}
      >
        E
      </div>
    ),
    { ...size },
  );
}
