"use client";

import { siteConfig } from "@/lib/data";
import { MagneticButton } from "@/components/ui/magnetic-button";

const WAVEFORM = [8, 14, 4, 22, 7, 18, 3, 12, 10, 26, 6, 16, 4, 11, 15, 30, 3, 10, 7, 16];

const META = [
  { label: "Status",   value: "Available" },
  { label: "Base",     value: "Indonesia" },
  { label: "Timezone", value: "UTC +7"    },
  { label: "Response", value: "< 24h"     },
];

export function Cta({ ctaText }: { ctaText?: string }) {
  return (
    <section className="relative overflow-hidden border-t-2 border-signal bg-black">

      {/* Ghost background word */}
      <span
        className="dis pointer-events-none absolute -bottom-4 -right-4 select-none leading-none text-white/[0.028]"
        style={{ fontSize: "38vw" }}
        aria-hidden
      >
        TX
      </span>

      {/* Top strip */}
      <div className="relative flex items-center justify-between border-b border-rule px-5 py-3 md:px-8">
        <span className="fac">FAC.08</span>
        <span className="lab text-white/25" style={{ fontSize: "0.6rem" }}>Indonesia · UTC +7</span>
      </div>

      {/* Waveform — absolute, top-right, desktop only */}
      <div className="desk-only absolute right-8 top-16 flex flex-col gap-[2.5px]" style={{ opacity: 0.15 }}>
        {WAVEFORM.map((w, i) => (
          <div key={i} className="bg-signal" style={{ height: "1px", width: `${w * 2}px` }} />
        ))}
      </div>

      {/* Body */}
      <div className="relative px-5 pt-10 pb-10 md:px-8 md:pt-14 md:pb-14">

        {/* Headline */}
        <p
          className="dis text-white"
          style={{ fontSize: "clamp(2.6rem, 8vw, 11rem)", lineHeight: 0.88, maxWidth: "14ch" }}
        >
          {ctaText || "Start a Project"}
        </p>

        {/* Meta grid */}
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-rule pt-8 md:grid-cols-4">
          {META.map(({ label, value }) => (
            <div key={label}>
              <p className="lab text-white/35 mb-[3px]" style={{ fontSize: "0.55rem" }}>{label}</p>
              <p className="lab text-white" style={{ fontSize: "0.72rem" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          {/* Button — magnetic + inverts on hover */}
          <MagneticButton
            href="/contact"
            className="group inline-flex items-center gap-5 border border-signal px-6 py-4 transition-colors duration-300 hover:bg-signal"
          >
            <span className="lab text-white transition-colors duration-300 group-hover:text-black">
              Open channel
            </span>
            <span className="lab text-signal inline-block transition-all duration-300 group-hover:translate-x-1 group-hover:text-black">
              →
            </span>
          </MagneticButton>

          {/* Email alternative */}
          <a
            href={`mailto:${siteConfig.email}`}
            className="lab text-white/30 transition-colors hover:text-white/70"
            style={{ fontSize: "0.62rem" }}
          >
            {siteConfig.email}
          </a>
        </div>
      </div>
    </section>
  );
}
