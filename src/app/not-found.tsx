import Link from "next/link";
import { MaskReveal } from "@/components/ui/mask-reveal";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-black px-5 md:px-12">

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.10) 2px, rgba(0,0,0,0.10) 4px)" }}
      />

      {/* Ghost 404 — glitched */}
      <span
        className="dis glitch pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center leading-none text-white/[0.03] z-0"
        style={{ fontSize: "clamp(12rem, 40vw, 40rem)" }}
        aria-hidden
      >
        404
      </span>

      {/* Signal bleed lines */}
      <div className="pointer-events-none absolute left-0 top-[38%] right-0 h-px bg-signal/20 z-[1]" />
      <div className="pointer-events-none absolute left-0 top-[62%] right-0 h-px bg-signal/10 z-[1]" />

      {/* Top meta */}
      <div className="relative z-10 pt-28 md:pt-36 flex items-center justify-between">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.404</span>
          <div className="mt-1 h-px w-5 bg-signal/40" />
        </div>
        <span className="lab text-white/15" style={{ fontSize: "0.52rem" }}>Signal lost</span>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <MaskReveal delay={0.05}>
          <p className="lab text-white/30 mb-4" style={{ fontSize: "0.58rem" }}>
            Page not found · Transmission failed
          </p>
        </MaskReveal>

        <MaskReveal delay={0.12}>
          <h1
            className="dis text-white"
            style={{ fontSize: "clamp(3rem, 14vw, 18rem)", lineHeight: 0.88 }}
          >
            Dead
          </h1>
        </MaskReveal>
        <MaskReveal delay={0.22}>
          <h1
            className="dis text-signal"
            style={{ fontSize: "clamp(3rem, 14vw, 18rem)", lineHeight: 0.88 }}
          >
            Frequency.
          </h1>
        </MaskReveal>

        <MaskReveal delay={0.35}>
          <p className="mt-8 max-w-sm text-sm leading-loose text-white/35">
            The page you&apos;re looking for doesn&apos;t exist or has been removed from the archive.
          </p>
        </MaskReveal>

        <div className="mt-10 flex items-center gap-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-5 border border-signal px-6 py-4 transition-colors duration-300 hover:bg-signal"
          >
            <span className="lab text-white transition-colors duration-300 group-hover:text-black" style={{ fontSize: "0.6rem" }}>
              ← Return to archive
            </span>
          </Link>
          <Link
            href="/works"
            className="lab text-white/30 hover:text-white transition-colors"
            style={{ fontSize: "0.6rem" }}
          >
            Browse works →
          </Link>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="relative z-10 border-t border-rule py-4 flex items-center justify-between">
        <span className="lab text-white/15" style={{ fontSize: "0.52rem" }}>Rizky Irawan · Visual Archive</span>
        <span className="lab text-white/15" style={{ fontSize: "0.52rem" }}>Indonesia · Est. 2017</span>
      </div>
    </section>
  );
}
