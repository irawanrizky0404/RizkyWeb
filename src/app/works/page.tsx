import type { Metadata } from "next";
import { Suspense } from "react";
import { getWorks } from "@/lib/store";
import { buildMetadata } from "@/lib/store";
import { WorkArchive } from "@/components/home/work-archive";
import { MaskReveal } from "@/components/ui/mask-reveal";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Work",
    description: "A curated visual archive of works in 3D, animation, illustration, and graphic design.",
  });
}

export default async function WorksPage() {
  const works = await getWorks();

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac">FAC.04 — Archive</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
            Work
          </h1>
        </MaskReveal>
        <p className="lab text-white/40 mt-5 max-w-xl" style={{ fontSize: "0.7rem" }}>
          A complete archive of visual works — illustrations, 3D visualizations, and animation. Each piece is part of a larger atmospheric practice.
        </p>
      </div>

      {/* ── ARCHIVE ─────────────────────────────────────────────────── */}
      <Suspense>
        <WorkArchive projects={works} typeFilter="client" />
      </Suspense>
    </>
  );
}
