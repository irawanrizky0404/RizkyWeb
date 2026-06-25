import type { Metadata } from "next";
import Link from "next/link";
import { getLabs } from "@/lib/store";
import { MaskReveal } from "@/components/ui/mask-reveal";
import { Reveal } from "@/components/ui/reveal";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Labs",
    description: "Experimental WebGL, shaders, and interactive code sketches.",
  };
}

export default async function LabsIndexPage() {
  const labs = await getLabs();

  return (
    <div className="min-h-screen">
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac">FAC.05 — Labs</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
            Labs
          </h1>
        </MaskReveal>
        <p className="lab text-white/40 mt-5 max-w-xl" style={{ fontSize: "0.7rem" }}>
          Experimental WebGL, shaders, and interactive code sketches. A space for creative testing without the pressure of client expectations.
        </p>
      </div>

      <div className="border-t border-rule">
        {labs.map((lab, i) => (
          <Reveal key={lab.slug} delay={i * 0.1}>
            <Link
              href={`/labs/${lab.slug}`}
              className="group flex items-center justify-between border-b border-rule px-5 py-6 md:px-12 md:py-10 transition-colors hover:bg-white/[0.02]"
            >
              <div>
                <span className="fac block mb-2 text-white/40 group-hover:text-signal transition-colors">{lab.year}</span>
                <h2 className="dis text-white group-hover:text-white/80 transition-colors" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9 }}>
                  {lab.title}
                </h2>
                <p className="lab text-white/40 mt-3 max-w-md" style={{ fontSize: "0.65rem" }}>
                  {lab.description}
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-full border border-rule group-hover:border-signal/50 group-hover:bg-signal/5 transition-all">
                <span className="lab text-white/40 group-hover:text-signal transition-colors">ENTER</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
