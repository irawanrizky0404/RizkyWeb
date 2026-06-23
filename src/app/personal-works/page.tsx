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
      {/* PAGE HEADER */}
      <div className="border-t border-white/[0.05] px-8 pt-28 pb-20 md:px-16 md:pt-40 md:pb-28 bg-[#050508]">
        <div className="flex items-baseline gap-8">
          <span className="lab text-[#4a6a8a]" style={{ fontSize: "0.55rem", letterSpacing: "0.3em" }}>
            FAC.05 — PERSONAL
          </span>
          <span className="lab text-white/20" style={{ fontSize: "0.5rem", letterSpacing: "0.15em" }}>
            2017—PRESENT
          </span>
        </div>
        <h1 className="dis text-white mt-6" style={{ fontSize: "clamp(4rem, 15vw, 12rem)", lineHeight: 0.75, letterSpacing: "-0.04em", fontWeight: 300 }}>
          Personal
        </h1>
        <div className="flex items-center gap-6 mt-8">
          <span className="w-16 h-[1px] bg-[#3a5a7a]" />
          <p className="lab text-white/20" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", lineHeight: 1.8 }}>
            SEPARATE FROM CLIENT WORK
          </p>
        </div>
      </div>

      {/* ARCHIVE */}
      <PersonalWorkArchive projects={works} />
    </>
  );
}
