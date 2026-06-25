import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#080808",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Signal bar — top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "#ff3500" }} />
        {/* R lettermark */}
        <span
          style={{
            color: "#f0f0ee",
            fontSize: 120,
            fontWeight: 700,
            fontFamily: "serif",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginTop: 10, // Slight optical alignment
          }}
        >
          R
        </span>
      </div>
    ),
    { ...size }
  );
}
