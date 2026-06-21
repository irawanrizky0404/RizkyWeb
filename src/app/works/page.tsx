import type { Metadata } from "next";
import { projects } from "@/lib/data";
import { WorkGrid } from "@/components/home/work-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { ColorBar } from "@/components/ui/color-bar";

export const metadata: Metadata = {
  title: "Work",
  description:
    "A curated visual archive of works in 3D, animation, illustration, and graphic design.",
};

export default function WorksPage() {
  return (
    <section className="px-6 pt-32 pb-16 md:px-10 md:pt-48 md:pb-24">
      <div className="mx-auto max-w-[1800px]">
        <SectionHeader
          label="Archive"
          title="Work"
          description="A complete archive of visual works — illustrations, 3D visualizations, and animation. Each piece is part of a larger atmospheric practice."
        />

        <ColorBar className="my-16 md:my-24" />

        <WorkGrid projects={projects} compact />
      </div>
    </section>
  );
}
