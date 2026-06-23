import type { Metadata } from "next";
import { getWorks } from "@/lib/store";
import { buildMetadata } from "@/lib/store";
import { PersonalWorkArchive } from "@/components/home/personal-work-archive";
import { MaskReveal } from "@/components/ui/mask-reveal";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Personal Work",
    description: "A collection of personal visual works exploring atmospheric, cinematic, and surreal aesthetics.",
  });
}

export default async function PersonalWorksPage() {
  const works = await getWorks();

  return (
    <>
      {/* PAGE HEADER */}
      <div className="border-t-2 border-white/10 px-6 pt-24 pb-16 md:px-12 md:pt-36 md:pb-20">
        <span className="fac text-white/20">FAC.05 — Personal</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(4rem, 14vw, 14rem)", lineHeight: 0.8, letterSpacing: "-0.03em" }}>
            Personal
          </h1>
        </MaskReveal>
        <p className="lab text-white/25 mt-6 max-w-lg" style={{ fontSize: "0.65rem", letterSpacing: "0.05em", lineHeight: 1.8 }}>
          PERSONAL PRACTICE — SEPARATE FROM CLIENT WORK
        </p>
      </div>

      {/* ARCHIVE */}
      <PersonalWorkArchive projects={works} />
    </>
  );
}
