import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getLabs } from "@/lib/store";

const FluidSim = dynamic(() => import("@/components/labs/fluid-sim").then(m => m.FluidSim), { ssr: false });
const WireframeCube = dynamic(() => import("@/components/labs/wireframe-cube").then(m => m.WireframeCube), { ssr: false });

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const labs = await getLabs();
  const lab = labs.find((l) => l.slug === slug);
  if (!lab) return { title: "Not Found" };
  return {
    title: `${lab.title} — Labs`,
    description: lab.description,
  };
}

export default async function LabDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const labs = await getLabs();
  const lab = labs.find((l) => l.slug === slug);
  if (!lab) notFound();

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-5 md:p-8 pointer-events-none">
        <div className="pointer-events-auto max-w-sm">
          <Link href="/labs" className="lab text-white/40 hover:text-signal transition-colors flex items-center gap-2 mb-4" style={{ fontSize: "0.6rem" }}>
            <span>←</span> BACK TO LABS
          </Link>
          <span className="fac text-signal block mb-1">FAC.05 — {lab.slug.toUpperCase()}</span>
          <h1 className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 1 }}>{lab.title}</h1>
          <p className="lab text-white/50 mt-2" style={{ fontSize: "0.65rem" }}>{lab.description}</p>
        </div>
        <div className="pointer-events-auto">
          <span className="lab text-white/20" style={{ fontSize: "0.6rem" }}>{lab.year}</span>
        </div>
      </div>

      {/* ── CANVAS ──────────────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        {lab.componentName === "FluidSim" && <FluidSim />}
        {lab.componentName === "WireframeCube" && <WireframeCube />}
      </div>
    </div>
  );
}
