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
        <div className="grid grid-cols-1 md:grid-cols-12 px-5 py-10 gap-8 md:px-12 md:py-14">
          <div className="md:col-span-3">
            <Reveal>
              <p className="lab text-signal/70" style={{ fontSize: "0.55rem" }}>[ 01 — Biography ]</p>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <Reveal delay={0.1}>
              <p className="text-white/70 mb-6" style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)", lineHeight: 1.7 }}>
                {about?.intro || "5 years across 3D, motion, illustration, and identity. Every project begins with a feeling, not a brief. Aesthetic leads. Technique follows."}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="text-sm leading-relaxed text-white/45 max-w-2xl">
                Based in Indonesia, working globally with creative agencies, architecture studios, product companies, music labels, and publishers — helping them translate ideas into visual experiences that are both precise and atmospheric.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Indonesia", "UTC +7", "Est. 2017", "Open to Collaborate"].map((tag) => (
                  <span key={tag} className="lab border border-rule px-3 py-1 text-white/40" style={{ fontSize: "0.55rem" }}>
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, transparent 40%, rgba(8,8,8,0.7) 100%)" }} />
        <div className="absolute bottom-6 left-5 md:left-12">
          <span className="fac" style={{ fontSize: "0.48rem" }}>{content?.homepage?.location || "Indonesia"} · Est. {content?.homepage?.established || "2017"}</span>
        </div>
      </div>

      {/* ── STORY SECTION ──────────────────────────────────────────── */}
      {about?.storyTitle && (
        <section className="border-t border-rule">
          <div className="border-b border-rule px-5 py-8 md:px-12">
            <Reveal>
              <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 02 — {about.storyTitle} ]</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-white/70 max-w-3xl" style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)", lineHeight: 1.7 }}>
                {about.story}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── APPROACH SECTION ─────────────────────────────────────────── */}
      {about?.approachTitle && (
        <section className="border-t border-rule">
          <div className="border-b border-rule px-5 py-8 md:px-12">
            <Reveal>
              <p className="lab text-signal/70 mb-4" style={{ fontSize: "0.55rem" }}>[ 03 — {about.approachTitle} ]</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-white/70 max-w-3xl" style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)", lineHeight: 1.7 }}>
                {about.approach}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── DISCIPLINES ─────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
          <span className="fac">Disciplines</span>
          <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{services.length} fields</span>
        </div>
        {services.map((s, i) => (
          <Reveal key={s.category} delay={i * 0.05}>
            <details className="group border-b border-rule">
              <summary className="flex cursor-pointer items-baseline gap-5 px-5 py-5 transition-colors hover:bg-white/[0.03] md:px-12 md:py-7 list-none">
                <span className="lab text-signal shrink-0 w-7">{String(i + 1).padStart(2, "0")}</span>
                <span className="dis flex-1 text-white" style={{ fontSize: "clamp(1.6rem, 7vw, 9rem)", lineHeight: 0.88 }}>
                  {s.category}
                </span>
                <span className="lab text-white/40 group-open:rotate-45 transition-transform duration-200 shrink-0">+</span>
              </summary>
              <div className="border-t border-rule/40 px-5 pb-8 pt-5 md:px-12 md:pl-[4.5rem]">
                <p className="text-sm leading-relaxed text-white/55 max-w-xl mb-5">{s.description}</p>
                <div className="flex flex-wrap gap-2">
                  {s.items.map((item) => (
                    <span key={item} className="lab text-white/50 border border-rule px-3 py-1 hover:border-signal/40 hover:text-signal transition-colors" style={{ fontSize: "0.58rem" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </details>
          </Reveal>
        ))}
      </section>

      {/* ── EXPERIENCE ──────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
          <span className="fac">Experience</span>
          <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{experiences.length} positions</span>
        </div>
        {experiences.map((exp, i) => (
          <Reveal key={exp.role} delay={i * 0.05}>
            <div className="border-b border-rule px-5 py-6 md:px-12 md:py-8">
              <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-8">
                <div>
                  <h3 className="dis text-white mb-1" style={{ fontSize: "clamp(1.2rem, 4vw, 2.5rem)", lineHeight: 0.9 }}>
                    {exp.role}
                  </h3>
                  <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{exp.organization}</span>
                </div>
                <span className="lab text-signal shrink-0" style={{ fontSize: "0.6rem" }}>{exp.period}</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">{exp.description}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── EDUCATION ───────────────────────────────────────────────── */}
      <section className="border-t border-rule">
        <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
          <span className="fac">Education</span>
          <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{education.length}</span>
        </div>
        {education.map((edu, i) => (
          <Reveal key={edu.degree} delay={i * 0.05}>
            <div className="border-b border-rule px-5 py-6 md:px-12 md:py-8">
              <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-8">
                <div>
                  <h3 className="dis text-white mb-1" style={{ fontSize: "clamp(1.2rem, 4vw, 2.5rem)", lineHeight: 0.9 }}>
                    {edu.degree}
                  </h3>
                  <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{edu.institution}</span>
                </div>
                <span className="lab text-signal shrink-0" style={{ fontSize: "0.6rem" }}>{edu.period}</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">{edu.description}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── RECOGNITION ─────────────────────────────────────────────── */}
      {awards.length > 0 && (
        <section className="border-t border-rule">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
            <span className="fac">Recognition</span>
          </div>
          {awards.map((award, i) => (
            <Reveal key={award.title} delay={i * 0.05}>
              <div className="border-b border-rule px-5 py-6 md:px-12 md:py-8">
                <div className="flex items-start gap-5 md:gap-8">
                  <span className="lab text-signal shrink-0 mt-1">{award.year}</span>
                  <div>
                    <h3 className="dis text-white mb-2" style={{ fontSize: "clamp(1rem, 3vw, 2rem)", lineHeight: 0.9 }}>
                      {award.title}
                    </h3>
                    <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{award.organization}</span>
                    <p className="mt-3 text-sm text-white/50 leading-relaxed">{award.description}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
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
