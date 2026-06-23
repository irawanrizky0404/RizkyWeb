import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";
import { buildMetadata } from "@/lib/store";
import { ContactLinks } from "@/components/contact/contact-links";
import { MaskReveal } from "@/components/ui/mask-reveal";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Contact",
    description: `Get in touch with ${siteConfig.name}.`,
  });
}

export default function ContactPage() {
  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac">FAC.C — Contact</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
            Get in<br />touch.
          </h1>
        </MaskReveal>
        <div className="mt-5 flex items-center gap-3">
          <span className="h-2 w-2 bg-signal" style={{ animation: "pulse 2s ease-in-out infinite" }} />
          <span className="lab text-signal" style={{ fontSize: "0.7rem" }}>Available for work — 2025</span>
        </div>
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────── */}
      <ContactLinks email={siteConfig.email} social={siteConfig.social} />
    </>
  );
}
