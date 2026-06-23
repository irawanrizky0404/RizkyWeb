import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { WorksCatalogue } from "@/components/home/works-catalogue";
import { FilmStrip } from "@/components/home/film-strip";
import { Capabilities } from "@/components/home/capabilities";
import { Clients } from "@/components/home/clients";
import { Recognition } from "@/components/home/recognition";
import { Cta } from "@/components/home/cta";
import { Reveal, RevealText } from "@/components/ui/reveal";
import { MaskReveal } from "@/components/ui/mask-reveal";
import { siteConfig } from "@/lib/data";
import { getWorks, getServices, getClients } from "@/lib/store";

export function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({
    title: "Visual Archive",
    description: siteConfig.description,
  });
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: siteConfig.name,
    description: siteConfig.description,
    url: "https://rizkyirawan.com",
    sameAs: Object.values(siteConfig.social),
    knowsAbout: ["3D Visualization", "Motion Design", "Illustration", "Graphic Design"],
    alumniOf: [],
    birthPlace: {
      "@type": "Place",
      name: "Indonesia",
    },
  },
};

export default function Home() {
  const works = getWorks();
  const services = getServices();
  const clients = getClients();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />

      {/* ── Statement ── FAC.02 ─────────────────────────────────── */}
      <section className="border-t-2 border-signal px-5 py-14 md:px-8 md:py-20">
        <div className="flex items-start gap-5 md:gap-8">
          <RevealText delay={0.05}>
            <span className="fac shrink-0 mt-2">FAC.02</span>
          </RevealText>
          <div className="flex-1">
            <MaskReveal delay={0.08}>
              <p className="dis text-white" style={{ fontSize: "clamp(2.4rem, 9vw, 13rem)", lineHeight: 0.85 }}>
                Working at the frequency between signal and silence.
              </p>
            </MaskReveal>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-rule pt-8 md:grid-cols-[auto_1fr_auto]">
          <RevealText delay={0.18}>
            <span className="lab text-signal/50 hidden md:block" style={{ fontSize: "0.52rem" }}>01</span>
          </RevealText>
          <RevealText delay={0.22}>
            <p className="text-sm leading-loose text-white/50 max-w-xl">
              5 years across 3D, motion, illustration, and identity.
              Every project begins with a feeling, not a brief.
              Aesthetic leads. Technique follows. Indonesia-based, globally distributed.
            </p>
          </RevealText>
          <RevealText delay={0.28}>
            <span className="lab text-white/15 hidden md:block" style={{ fontSize: "0.52rem" }}>Indonesia · Est. 2017</span>
          </RevealText>
        </div>
      </section>

      <FilmStrip projects={works} />
      <WorksCatalogue projects={works} />
      <Capabilities services={services} />
      <Clients clients={clients} />
      <Recognition />
      <Reveal><Cta /></Reveal>
    </>
  );
}
