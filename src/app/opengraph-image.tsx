import { ImageResponse } from "next/og";
import { getWorks } from "@/lib/store";

export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const works = getWorks();
  const project = works.find((p) => p.slug === slug);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#080808", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", fontFamily: "monospace" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#ff3500" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#ff3500", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase" }}>FAC.W</span>
          <div style={{ width: "24px", height: "1px", background: "rgba(255,53,0,0.4)" }} />
          <span style={{ color: "rgba(240,240,238,0.3)", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {project?.category ?? "Work"} · {project?.year ?? ""}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "rgba(240,240,238,0.3)", fontSize: "16px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            {project?.client ?? "Personal Work"}
          </span>
          <span style={{ color: "#f0f0ee", fontSize: "96px", fontWeight: 700, lineHeight: 0.88, letterSpacing: "0.02em", textTransform: "uppercase" }}>
            {project?.title ?? slug}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "rgba(240,240,238,0.25)", fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Rizky Irawan — Visual Archive
          </span>
          <span style={{ color: "#ff3500", fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            rizkyirawan.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
