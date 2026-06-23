import type { Metadata } from "next";
import { getWorks } from "@/lib/store";
import { buildMetadata } from "@/lib/store";
import { PersonalWorkArchive } from "@/components/home/personal-work-archive";

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
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-t-2 border-white/20 px-6 pt-28 pb-16 md:px-12 md:pt-36 md:pb-20 bg-black">
        <div className="max-w-3xl">
          <span className="fac text-white/20 tracking-[0.4em] mb-6 block" style={{ fontSize: "0.55rem" }}>
            FAC.05 — PERSONAL ARCHIVE
          </span>
          <h1 className="dis text-white" style={{ fontSize: "clamp(4rem, 14vw, 14rem)", lineHeight: 0.8, letterSpacing: "-0.03em" }}>
            Personal
          </h1>
          <p className="lab text-white/30 mt-8 max-w-lg" style={{ fontSize: "0.65rem", letterSpacing: "0.05em", lineHeight: 1.8 }}>
            SEPARATE FROM CLIENT WORK — VISUAL EXPLORATIONS AND PERSONAL PRACTICE SINCE 2017
          </p>
        </div>
      </div>

      {/* ── PERSONAL ARCHIVE ─────────────────────────────────────────── */}
      <PersonalWorkArchive projects={works} />
    </>
  );
}
