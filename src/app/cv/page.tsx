import type { Metadata } from "next";
import {
  siteConfig,
  experiences,
  skillGroups,
  tools,
  awards,
  clientList,
} from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ColorBar } from "@/components/ui/color-bar";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "CV",
  description: `Curriculum vitae of ${siteConfig.name} — multidisciplinary visual artist.`,
};

export default function CVPage() {
  return (
    <section className="px-6 pt-32 pb-16 md:px-10 md:pt-48 md:pb-24">
      <div className="mx-auto max-w-[1800px]">
        <SectionHeader
          label="Curriculum Vitae"
          title="CV"
          description={`${siteConfig.role} based in Indonesia. Working across 3D, animation, illustration, and graphic design.`}
        />

        <ColorBar className="my-12 md:my-24" />

        {/* Experience */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                [ Experience ]
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <div className="border-t border-border">
              {experiences.map((exp, i) => (
                <Reveal key={exp.role} delay={i * 0.05}>
                  <div className="border-b border-border py-6 md:py-10">
                    <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-8">
                      <h3 className="font-display text-lg font-medium tracking-tight md:text-2xl">
                        {exp.role}
                      </h3>
                      <span className="font-mono text-xs text-sodium">
                        {exp.period}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {exp.organization}
                    </p>
                    <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:mt-4 md:text-base">
                      {exp.description}
                    </p>
                    <ul className="mt-3 space-y-1.5 md:mt-4">
                      {exp.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex gap-3 text-sm text-muted-foreground"
                        >
                          <span className="mt-2 h-1 w-1 shrink-0 bg-sodium" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <ColorBar className="my-12 md:my-24" />

        {/* Skills */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                [ Skills ]
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <div className="border-t border-border">
              {skillGroups.map((group, i) => (
                <Reveal key={group.category} delay={i * 0.05}>
                  <div className="flex flex-col gap-3 border-b border-border py-5 md:flex-row md:items-baseline md:gap-8 md:py-8">
                    <h3 className="font-display text-base font-medium tracking-tight md:text-lg md:w-48 md:shrink-0">
                      {group.category}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="font-mono text-xs text-muted-foreground"
                        >
                          {item}
                          {item !== group.items[group.items.length - 1] ? " ·" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <ColorBar className="my-12 md:my-24" />

        {/* Tools */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                [ Tools ]
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <div className="border-t border-border">
              {tools.map((group, i) => (
                <Reveal key={group.category} delay={i * 0.05}>
                  <div className="flex flex-col gap-3 border-b border-border py-5 md:flex-row md:items-baseline md:gap-8 md:py-8">
                    <h3 className="font-display text-base font-medium tracking-tight md:text-lg md:w-48 md:shrink-0">
                      {group.category}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="font-mono text-xs text-muted-foreground"
                        >
                          {item}
                          {item !== group.items[group.items.length - 1] ? " ·" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <ColorBar className="my-12 md:my-24" />

        {/* Awards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                [ Awards ]
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

        <ColorBar className="my-12 md:my-24" />

        {/* Clients */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                [ Clients ]
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {clientList.map((client) => (
                  <span
                    key={client}
                    className="font-mono text-sm text-muted-foreground"
                  >
                    {client}
                    {client !== clientList[clientList.length - 1] ? " ·" : ""}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        <ColorBar className="my-12 md:my-24" />

        {/* Contact */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                [ Contact ]
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <Reveal delay={0.1}>
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-display text-lg font-medium tracking-tight transition-colors hover:text-sodium md:text-2xl"
              >
                {siteConfig.email}
              </a>
              <div className="mt-4 flex flex-wrap gap-6 font-mono text-xs text-muted-foreground">
                <a href={siteConfig.social.instagram} className="transition-colors hover:text-sodium">Instagram</a>
                <a href={siteConfig.social.behance} className="transition-colors hover:text-sodium">Behance</a>
                <a href={siteConfig.social.linkedin} className="transition-colors hover:text-sodium">LinkedIn</a>
              </div>
              <p className="mt-4 font-mono text-xs text-sodium">
                ● Available — 2025
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
