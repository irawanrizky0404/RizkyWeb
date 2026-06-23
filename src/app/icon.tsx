import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#080808",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Signal bar — top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#ff3500" }} />
        {/* R lettermark */}
        <span
          style={{
            color: "#f0f0ee",
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "serif",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          R
        </span>
      </div>
    ),
    { ...size }
  );
}
