import type { Metadata } from "next";
import { siteConfig, services, awards } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ColorBar } from "@/components/ui/color-bar";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name} — multidisciplinary visual artist.`,
};

export default function AboutPage() {
  return (
    <section className="px-6 pt-32 pb-16 md:px-10 md:pt-48 md:pb-24">
      <div className="mx-auto max-w-[1800px]">
        <SectionHeader
          label="Profile"
          title="About"
          description={`${siteConfig.role} based between disciplines, materials, and screens.`}
        />

        <ColorBar className="my-12 md:my-24" />

        {/* Biography */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                [ Biography ]
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <Reveal delay={0.1}>
              <p className="max-w-2xl font-serif text-[clamp(1.15rem,2.5vw,2rem)] italic leading-relaxed text-bone">
                I&apos;m {siteConfig.name}, a visual artist and designer working
                across 3D, animation, illustration, and graphic design. My
                practice exists at the intersection of industrial restraint and
                creative expression.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 max-w-2xl space-y-4 text-pretty text-sm leading-relaxed text-muted-foreground md:mt-10 md:space-y-6 md:text-base">
                <p>
                  My work is informed by post-punk aesthetics, Swiss editorial
                  discipline, and the atmospheric weight of brutalist
                  architecture. I believe in the power of negative space, the
                  discipline of the grid, and the emotional impact of a single,
                  well-composed frame.
                </p>
                <p>
                  I work with creative agencies, architecture studios, product
                  companies, music labels, and publishers — helping them
                  translate ideas into visual experiences that are both precise
                  and atmospheric.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <ColorBar className="my-12 md:my-24" />

        {/* Disciplines */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                [ Disciplines ]
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <div className="border-t border-border">
              {services.map((service, i) => (
                <Reveal key={service.category} delay={i * 0.05}>
                  <div className="flex flex-col gap-2 border-b border-border py-5 md:flex-row md:items-baseline md:gap-8 md:py-8">
                    <h3 className="font-display text-lg font-medium tracking-tight md:text-xl md:w-48 md:shrink-0">
                      {service.category}
                    </h3>
                    <p className="max-w-md text-pretty text-sm text-muted-foreground md:text-base">
                      {service.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <ColorBar className="my-12 md:my-24" />

        {/* Recognition */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                [ Recognition ]
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <div className="border-t border-border">
              {awards.map((award) => (
                <Reveal key={award.title}>
                  <div className="flex flex-col gap-2 border-b border-border py-5 md:flex-row md:items-baseline md:gap-8 md:py-8">
                    <span className="font-mono text-xs text-sodium md:w-20 md:shrink-0">
                      {award.year}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-base font-medium tracking-tight md:text-lg">
                        {award.title}
                      </h3>
                      <p className="mt-1 max-w-md text-pretty text-sm text-muted-foreground">
                        {award.description}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {award.organization}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
