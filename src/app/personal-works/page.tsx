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
      <div className="border-t-2 border-white px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac text-white/40">FAC.05 — Personal</span>
        <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
          Personal
        </h1>
        <p className="lab text-white/30 mt-5 max-w-xl" style={{ fontSize: "0.7rem" }}>
          Personal projects and visual explorations — separate from client work, these pieces define the artistic practice.
        </p>
      </div>

      {/* ── PERSONAL ARCHIVE ─────────────────────────────────────────── */}
      <PersonalWorkArchive projects={works} />
    </>
  );
}
