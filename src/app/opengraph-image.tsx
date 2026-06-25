import { ImageResponse } from "next/og";
import { getDesign, getSEO } from "@/lib/store";

export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const design = await getDesign();
  const seo = await getSEO();
  const title = seo.siteName || "Rizky Irawan";
  const role = design.site.role || "Multidisciplinary Visual Artist";
  
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#080808", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", fontFamily: "monospace" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#ff3500" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#ff3500", fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase" }}>FAC.00</span>
          <div style={{ width: "32px", height: "1px", background: "rgba(255,53,0,0.4)" }} />
          <span style={{ color: "rgba(240,240,238,0.4)", fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Visual Archive
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "#ff3500", fontSize: "16px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            {role}
          </span>
          <span style={{ color: "#f0f0ee", fontSize: "110px", fontWeight: 700, lineHeight: 0.88, letterSpacing: "0.02em", textTransform: "uppercase", whiteSpace: "pre-wrap" }}>
            {title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "rgba(240,240,238,0.3)", fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {design.site.location} — {design.site.timezone}
          </span>
          <span style={{ color: "rgba(240,240,238,0.5)", fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            rizkyirawan.xyz
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
