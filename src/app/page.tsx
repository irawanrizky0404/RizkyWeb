import { Hero } from "@/components/home/hero";
import { WorkGrid } from "@/components/home/work-grid";
import { Skills } from "@/components/home/skills";
import { Clients } from "@/components/home/clients";
import { SectionHeader } from "@/components/ui/section-header";
import { ColorBar } from "@/components/ui/color-bar";
import { Reveal } from "@/components/ui/reveal";
import Link from "next/link";
import { projects, awards } from "@/lib/data";

export default function Home() {
  const selected = projects.slice(0, 4);

  return (
    <>
      <Hero />

      <ColorBar />

      {/* Manifesto */}
      <section className="px-6 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1800px]">
          <SectionHeader label="Manifesto" />
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-4xl font-serif text-[clamp(1.5rem,4vw,3rem)] italic leading-[1.15] tracking-tight text-bone">
              I work in the space between{" "}
              <span className="text-sodium not-italic font-display font-bold">
                shadow
              </span>{" "}
              and structure — where silence carries more weight than noise, and
              every frame is a decision to show or to withhold.
            </p>
          </Reveal>
        </div>
      </section>

      <ColorBar />

      {/* Selected Work */}
      <section className="px-6 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-16 flex items-end justify-between md:mb-24">
            <SectionHeader label="Selected Work" title="Work" />
            <Reveal delay={0.1}>
              <Link
                href="/works"
                className="font-mono text-xs text-muted-foreground transition-colors hover:text-sodium"
              >
                View All →
              </Link>
            </Reveal>
          </div>

          <WorkGrid projects={selected} />
        </div>
      </section>

      <ColorBar />

      {/* Skills */}
      <Skills />

      <ColorBar />

      <Clients />

      <ColorBar />

      {/* Recognition */}
      <section className="px-6 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1800px]">
          <SectionHeader label="Recognition" title="Awards" />

          {awards.map((award) => (
            <Reveal key={award.title} delay={0.1}>
              <div className="mt-12 border border-border bg-muted md:mt-16">
                {/* Top bar — year + org */}
                <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between md:p-10">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 bg-sodium" />
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                      {award.year}
                    </span>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {award.organization}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10">
                  <h3 className="font-display text-[clamp(1.5rem,5vw,3.5rem)] font-bold leading-[0.9] tracking-tighter">
                    {award.title}
                  </h3>
                  <p className="mt-6 max-w-2xl font-serif text-base italic leading-relaxed text-bone md:mt-8 md:text-lg">
                    {award.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ColorBar />

      {/* Contact */}
      <section className="px-6 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1800px]">
          <SectionHeader label="Contact" />
          <Reveal delay={0.1}>
            <Link
              href="/contact"
              className="group mt-8 block font-display text-[clamp(2rem,8vw,7rem)] font-bold leading-[0.85] tracking-tighter"
            >
              Let&apos;s make
              <br />
              <span className="font-serif font-normal italic text-bone">
                something
              </span>
              <span className="text-sodium"> →</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
