import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/data";
import { buildMetadata, getCV, getServices, getContent } from "@/lib/store";
import { Reveal } from "@/components/ui/reveal";
import { MaskReveal } from "@/components/ui/mask-reveal";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "About",
    description: `About ${siteConfig.name} — multidisciplinary visual artist working across 3D, animation, illustration, and identity.`,
  });
}

export default async function AboutPage() {
  const [cv, services, content] = await Promise.all([
    getCV(),
    getServices().catch(() => []),
    getContent().catch(() => null)
  ]);

  const { experiences = [], awards = [], education = [] } = cv;
  const about = content?.about;

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac">FAC.03 — Profile</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
            About
          </h1>
        </MaskReveal>
        <p className="lab text-white/40 mt-5 max-w-xl" style={{ fontSize: "0.7rem" }}>
          {siteConfig.role} based between disciplines, materials, and screens.
        </p>
      </div>

      {/* ── BIOGRAPHY ───────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        {/* Pull quote */}
        <div className="border-b border-rule px-5 py-10 md:px-12 md:py-16">
          <MaskReveal delay={0.1}>
            <p className="dis text-white" style={{ fontSize: "clamp(2rem, 6vw, 8rem)", lineHeight: 0.88, maxWidth: "20ch" }}>
              {about?.storyTitle || "Every project begins with a feeling, not a brief."}
            </p>
          </MaskReveal>
          <div className="mt-6 h-px w-12 bg-signal/40" />
        </div>

        {/* Body copy */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
          <div className="border-b border-rule md:border-b-0 md:border-r border-rule p-5 md:p-12 sticky top-16 h-fit z-10 bg-black/80 backdrop-blur">
            <Reveal>
              <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 01 — Biography ]</p>
              <h2 className="dis text-white" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9 }}>Profile</h2>
            </Reveal>
          </div>
          <div className="p-5 py-8 md:p-12 md:py-16">
            <Reveal delay={0.1}>
              <p className="text-white/70 mb-6 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)" }}>
                {about?.intro || "5 years across 3D, motion, illustration, and identity. Every project begins with a feeling, not a brief. Aesthetic leads. Technique follows."}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="text-sm md:text-base leading-relaxed text-white/45 max-w-2xl">
                Based in Indonesia, working globally with creative agencies, architecture studios, product companies, music labels, and publishers — helping them translate ideas into visual experiences that are both precise and atmospheric.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="mt-12 flex flex-wrap gap-3">
                {["Indonesia", "UTC +7", "Est. 2017", "Open to Collaborate"].map((tag) => (
                  <span key={tag} className="lab border border-rule px-4 py-2 text-white/40" style={{ fontSize: "0.55rem" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ATMOSPHERIC IMAGE BREAK ──────────────────────────────────── */}
      <div className="relative h-[50svh] min-h-[320px] overflow-hidden border-t border-rule bg-black">
        <Image
          src="/images/hero/hero-a.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            filter: "grayscale(1) contrast(1.2) brightness(0.55)",
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--black) 50%, transparent) 0%, transparent 40%, color-mix(in srgb, var(--black) 70%, transparent) 100%)" }} />
        <div className="absolute bottom-6 left-5 md:left-12">
          <span className="fac" style={{ fontSize: "0.48rem" }}>{content?.homepage?.location || "Indonesia"} · Est. {content?.homepage?.established || "2017"}</span>
        </div>
      </div>

      {/* ── STORY SECTION ──────────────────────────────────────────── */}
      {about?.storyTitle && (
        <section className="border-t border-rule">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
            <div className="border-b border-rule md:border-b-0 md:border-r border-rule p-5 md:p-12 sticky top-16 h-fit z-10 bg-black/80 backdrop-blur">
              <Reveal>
                <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 02 — Story ]</p>
                <h2 className="dis text-white" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9 }}>{about.storyTitle}</h2>
              </Reveal>
            </div>
            <div className="p-5 py-8 md:p-12 md:py-16">
              <Reveal delay={0.1}>
                <p className="text-white/70 max-w-3xl leading-relaxed" style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)" }}>
                  {about.story}
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ── APPROACH SECTION ─────────────────────────────────────────── */}
      {about?.approachTitle && (
        <section className="border-t border-rule">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
            <div className="border-b border-rule md:border-b-0 md:border-r border-rule p-5 md:p-12 sticky top-16 h-fit z-10 bg-black/80 backdrop-blur">
              <Reveal>
                <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 03 — Approach ]</p>
                <h2 className="dis text-white" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9 }}>{about.approachTitle}</h2>
              </Reveal>
            </div>
            <div className="p-5 py-8 md:p-12 md:py-16">
              <Reveal delay={0.1}>
                <p className="text-white/70 max-w-3xl leading-relaxed" style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)" }}>
                  {about.approach}
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ── DISCIPLINES ─────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
          <div className="border-b border-rule md:border-b-0 md:border-r border-rule p-5 md:p-12 sticky top-16 h-fit z-10 bg-black/80 backdrop-blur">
            <Reveal>
              <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 04 — Disciplines ]</p>
              <h2 className="dis text-white" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9 }}>Capabilities</h2>
              <p className="lab text-white/30 mt-4" style={{ fontSize: "0.6rem" }}>{services.length} fields of expertise</p>
            </Reveal>
          </div>
          <div className="flex flex-col">
            {services.map((s, i) => (
              <Reveal key={s.category} delay={i * 0.05}>
                <details className="group border-b border-rule last:border-b-0">
                  <summary className="flex cursor-pointer items-baseline gap-5 px-5 py-8 transition-colors hover:bg-white/[0.03] md:px-12 md:py-10 list-none">
                    <span className="lab text-signal shrink-0 w-7">{String(i + 1).padStart(2, "0")}</span>
                    <span className="dis flex-1 text-white" style={{ fontSize: "clamp(2rem, 6vw, 6rem)", lineHeight: 0.88 }}>
                      {s.category}
                    </span>
                    <span className="lab text-white/40 group-open:rotate-45 transition-transform duration-200 shrink-0">+</span>
                  </summary>
                  <div className="border-t border-rule/40 px-5 pb-12 pt-8 md:px-12 md:pl-[4.5rem]">
                    <p className="text-sm md:text-base leading-relaxed text-white/55 max-w-xl mb-8">{s.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {s.items.map((item) => (
                        <span key={item} className="lab text-white/50 border border-rule px-4 py-2 hover:border-signal/40 hover:text-signal transition-colors" style={{ fontSize: "0.58rem" }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ──────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
          <div className="border-b border-rule md:border-b-0 md:border-r border-rule p-5 md:p-12 sticky top-16 h-fit z-10 bg-black/80 backdrop-blur">
            <Reveal>
              <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 05 — Experience ]</p>
              <h2 className="dis text-white" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9 }}>Timeline</h2>
              <p className="lab text-white/30 mt-4" style={{ fontSize: "0.6rem" }}>{experiences.length} positions</p>
            </Reveal>
          </div>
          <div className="flex flex-col">
            {experiences.map((exp, i) => (
              <Reveal key={exp.role} delay={i * 0.05}>
                <div className="border-b border-rule last:border-b-0 px-5 py-8 md:px-12 md:py-12 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-8">
                    <div>
                      <h3 className="dis text-white mb-2" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", lineHeight: 0.9 }}>
                        {exp.role}
                      </h3>
                      <span className="lab text-white/40" style={{ fontSize: "0.65rem" }}>{exp.organization}</span>
                    </div>
                    <span className="lab text-signal border border-signal/30 px-3 py-1 rounded-full shrink-0" style={{ fontSize: "0.55rem" }}>{exp.period}</span>
                  </div>
                  <p className="mt-6 max-w-2xl text-sm md:text-base leading-relaxed text-white/50">{exp.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ───────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
          <div className="border-b border-rule md:border-b-0 md:border-r border-rule p-5 md:p-12 sticky top-16 h-fit z-10 bg-black/80 backdrop-blur">
            <Reveal>
              <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 06 — Education ]</p>
              <h2 className="dis text-white" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9 }}>Academic</h2>
              <p className="lab text-white/30 mt-4" style={{ fontSize: "0.6rem" }}>{education.length} degrees</p>
            </Reveal>
          </div>
          <div className="flex flex-col">
            {education.map((edu, i) => (
              <Reveal key={edu.degree} delay={i * 0.05}>
                <div className="border-b border-rule last:border-b-0 px-5 py-8 md:px-12 md:py-12 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-8">
                    <div>
                      <h3 className="dis text-white mb-2" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", lineHeight: 0.9 }}>
                        {edu.degree}
                      </h3>
                      <span className="lab text-white/40" style={{ fontSize: "0.65rem" }}>{edu.institution}</span>
                    </div>
                    <span className="lab text-signal border border-signal/30 px-3 py-1 rounded-full shrink-0" style={{ fontSize: "0.55rem" }}>{edu.period}</span>
                  </div>
                  {edu.description && (
                    <p className="mt-6 max-w-2xl text-sm md:text-base leading-relaxed text-white/50">{edu.description}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECOGNITION ─────────────────────────────────────────────── */}
      {awards.length > 0 && (
        <section className="border-t border-rule">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
            <div className="border-b border-rule md:border-b-0 md:border-r border-rule p-5 md:p-12 sticky top-16 h-fit z-10 bg-black/80 backdrop-blur">
              <Reveal>
                <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 07 — Recognition ]</p>
                <h2 className="dis text-white" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9 }}>Awards</h2>
                <p className="lab text-white/30 mt-4" style={{ fontSize: "0.6rem" }}>{awards.length} selected</p>
              </Reveal>
            </div>
            <div className="flex flex-col">
              {awards.map((award, i) => (
                <Reveal key={award.title} delay={i * 0.05}>
                  <div className="border-b border-rule last:border-b-0 px-5 py-8 md:px-12 md:py-12 hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-12">
                      <span className="lab text-signal border border-signal/30 px-3 py-1 rounded-full shrink-0 md:mt-2" style={{ fontSize: "0.55rem" }}>{award.year}</span>
                      <div>
                        <h3 className="dis text-white mb-2" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", lineHeight: 0.9 }}>
                          {award.title}
                        </h3>
                        <span className="lab text-white/40" style={{ fontSize: "0.65rem" }}>{award.organization}</span>
                        {award.description && (
                          <p className="mt-4 text-sm md:text-base text-white/50 leading-relaxed max-w-2xl">{award.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <Reveal>
        <section className="border-t-2 border-signal px-5 py-12 md:px-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="dis text-white" style={{ fontSize: "clamp(2rem, 6vw, 8rem)", lineHeight: 0.88, maxWidth: "16ch" }}>
              Available for projects.
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
