import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/data";
import { buildMetadata, getCV, getClients } from "@/lib/store";
import { Reveal } from "@/components/ui/reveal";
import { MaskReveal } from "@/components/ui/mask-reveal";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "CV",
    description: `Curriculum vitae of ${siteConfig.name} — multidisciplinary visual artist.`,
  });
}

export default async function CVPage() {
  const [cv, clientList] = await Promise.all([
    getCV().catch(() => null),
    getClients().catch(() => [])
  ]);

  if (!cv) {
    return <div className="p-6 text-white/50">Loading...</div>;
  }

  const { experiences = [], skillGroups = [], tools = [], awards = [] } = cv;
  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac">FAC.CV — Curriculum Vitae</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
            CV
          </h1>
        </MaskReveal>
        <div className="mt-5 flex items-center gap-6 flex-wrap">
          <p className="lab text-white/40" style={{ fontSize: "0.7rem" }}>
            {siteConfig.role} · Indonesia · Est. 2017
          </p>
          <a
            href="/api/cv/download"
            className="group inline-flex items-center gap-3 border border-signal px-4 py-2 transition-colors hover:bg-signal"
          >
            <span className="lab text-white transition-colors group-hover:text-black" style={{ fontSize: "0.6rem" }}>Download PDF</span>
            <span className="lab text-signal transition-colors group-hover:text-black">↓</span>
          </a>
        </div>
      </div>

      {/* ── EXPERIENCE ──────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
          <span className="fac">Experience</span>
          <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{experiences.length} positions</span>
        </div>
        {experiences.map((exp, i) => (
          <Reveal key={exp.role} delay={i * 0.04}>
            <div className="border-b border-rule px-5 py-8 md:px-12 md:py-10">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-8">
                <div className="flex-1">
                  <h2 className="dis text-white mb-1" style={{ fontSize: "clamp(1.4rem, 5vw, 4rem)", lineHeight: 0.9 }}>
                    {exp.role}
                  </h2>
                  <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{exp.organization}</span>
                </div>
                <span className="lab text-signal shrink-0" style={{ fontSize: "0.6rem" }}>{exp.period}</span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50">{exp.description}</p>
              {exp.highlights.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3">
                      <span className="h-px w-4 bg-signal/60 shrink-0 mt-2" />
                      <span className="lab text-white/50" style={{ fontSize: "0.65rem" }}>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── SKILLS + TOOLS (side by side on desktop) ────────────────── */}
      <section className="border-t border-rule">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-rule">
          {/* Skills */}
          <div>
            <div className="border-b border-rule px-5 py-3 md:px-12">
              <span className="fac">Skills</span>
            </div>
            {skillGroups.map((group, i) => (
              <Reveal key={group.category} delay={i * 0.04}>
                <div className="border-b border-rule px-5 py-5 md:px-12 md:py-6">
                  <h3 className="lab text-white/50 mb-3" style={{ fontSize: "0.6rem" }}>{group.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="lab text-white/60 border border-rule px-2 py-1 hover:border-signal/40 hover:text-signal transition-colors" style={{ fontSize: "0.55rem" }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Tools */}
          <div>
            <div className="border-b border-rule px-5 py-3 md:px-12">
              <span className="fac">Tools</span>
            </div>
            {tools.map((group, i) => (
              <Reveal key={group.category} delay={i * 0.04}>
                <div className="border-b border-rule px-5 py-5 md:px-12 md:py-6">
                  <h3 className="lab text-white/50 mb-3" style={{ fontSize: "0.6rem" }}>{group.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="lab text-white/60 border border-rule px-2 py-1 hover:border-signal/40 hover:text-signal transition-colors" style={{ fontSize: "0.55rem" }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AWARDS ──────────────────────────────────────────────────── */}
      {awards.length > 0 && (
        <section className="border-t border-rule">
          <div className="border-b border-rule px-5 py-3 md:px-12">
            <span className="fac">Recognition</span>
          </div>
          {awards.map((award, i) => (
            <Reveal key={award.title} delay={i * 0.04}>
              <div className="border-b border-rule px-5 py-6 md:px-12 md:py-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-8">
                  <span className="lab text-signal shrink-0" style={{ fontSize: "0.6rem" }}>{award.year}</span>
                  <div className="flex-1">
                    <h3 className="dis text-white mb-1" style={{ fontSize: "clamp(1rem, 3vw, 2.2rem)", lineHeight: 0.9 }}>
                      {award.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed mt-2">{award.description}</p>
                  </div>
                  <span className="lab text-white/30 shrink-0" style={{ fontSize: "0.58rem" }}>{award.organization}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </section>
      )}

      {/* ── CLIENTS ─────────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
          <span className="fac">Clients</span>
          <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{clientList.length} worked with</span>
        </div>
        <Reveal>
          <div className="px-5 py-8 md:px-12">
            <div className="flex flex-wrap gap-2">
              {clientList.map((client) => (
                <span key={client} className="lab text-white/50 border border-rule px-3 py-1 hover:border-signal/30 hover:text-white/70 transition-colors" style={{ fontSize: "0.6rem" }}>
                  {client}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <Reveal>
        <section className="border-t-2 border-signal px-5 py-12 md:px-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="dis text-white" style={{ fontSize: "clamp(2rem, 6vw, 8rem)", lineHeight: 0.88, maxWidth: "16ch" }}>
              Let&apos;s work together.
            </p>
            <Link href="/contact" className="lab self-start border-b-2 border-signal pb-1 text-white hover:text-signal transition-colors">
              Start the transmission →
            </Link>
          </div>
        </section>
      </Reveal>
    </>
  );
}
