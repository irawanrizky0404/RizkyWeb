import type { Metadata } from "next";
import { MaskReveal } from "@/components/ui/mask-reveal";
import { LabsArchive } from "@/components/home/labs-archive";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Labs",
    description: "Experiments, generative art, motion tests and creative explorations.",
  };
}

export default function LabsPage() {
  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac">FAC.06 — Labs</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
            Labs
          </h1>
        </MaskReveal>
        <p className="lab text-white/40 mt-5 max-w-xl" style={{ fontSize: "0.7rem" }}>
          Experiments, generative art, motion tests and creative explorations — where ideas become reality.
        </p>
      </div>

      {/* ── ARCHIVE ─────────────────────────────────────────────────── */}
      <LabsArchive />
    </>
  );
}
