import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getServices, buildMetadata, getContent } from "@/lib/store";
import { Reveal } from "@/components/ui/reveal";
import { MaskReveal } from "@/components/ui/mask-reveal";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Services",
    description: "Services across 3D, animation, graphic design, and illustration.",
  });
}

const serviceImages: Record<string, string> = {
  "3D":             "/images/services/1.jpg",
  "Animation":      "/images/services/2.jpg",
  "Graphic Design": "/images/services/3.jpg",
  "Illustration":   "/images/services/4.jpg",
};

export default async function ServicesPage() {
  const [services, content] = await Promise.all([
    getServices().catch(() => []),
    getContent().catch(() => null)
  ]);

  const servicesContent = content?.services;

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac">FAC.05 — Services</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
            Capabilities
          </h1>
        </MaskReveal>
        <p className="lab text-white/40 mt-5 max-w-xl" style={{ fontSize: "0.7rem" }}>
          {servicesContent?.intro || "A multidisciplinary practice serving creative agencies, studios, labels, and publishers — concept to final delivery."}
        </p>
      </div>

      {/* ── SERVICES ────────────────────────────────────────────────── */}
      {services.map((s, i) => (
        <Reveal key={s.category}>
          <section className="border-t border-rule">
            {/* Section row header */}
            <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
              <span className="lab text-white/25" style={{ fontSize: "0.58rem" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="fac">{s.category}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-black md:aspect-auto md:min-h-[360px]">
                <Image
                  src={serviceImages[s.category] ?? "/images/services/1.jpg"}
                  alt={s.category}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  style={{
                    filter: "grayscale(1) contrast(1.1) brightness(0.65)",
                    mixBlendMode: "screen",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, transparent 60%, #080808 100%)" }}
                />
              </div>

              {/* Content */}
              <div className="px-5 py-8 md:px-12 md:py-10 flex flex-col justify-center">
                <MaskReveal delay={0.1}>
                  <h2 className="dis text-white" style={{ fontSize: "clamp(2rem, 6vw, 7rem)", lineHeight: 0.88 }}>
                    {s.category}
                  </h2>
                </MaskReveal>
                <p className="mt-5 text-sm leading-loose text-white/55 max-w-md">{s.description}</p>
                <div className="mt-8 border-t border-rule pt-6">
                  <p className="lab text-white/25 mb-3" style={{ fontSize: "0.55rem" }}>Deliverables</p>
                  <div className="flex flex-col gap-0">
                    {s.items.map((item) => (
                      <div key={item} className="group flex items-center gap-3 border-b border-rule/40 py-2 hover:border-signal/20 transition-colors">
                        <span className="h-px w-4 shrink-0 bg-signal/40 transition-all duration-300 group-hover:w-6" />
                        <span className="lab text-white/45 transition-colors duration-200 group-hover:text-white/70" style={{ fontSize: "0.65rem" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      ))}

      {/* ── OUTRO ─────────────────────────────────────────────────── */}
      {servicesContent?.outro && (
        <section className="border-t border-rule px-5 py-10 md:px-12">
          <p className="text-white/50 max-w-2xl" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
            {servicesContent.outro}
          </p>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <Reveal>
        <section className="border-t-2 border-signal px-5 py-14 md:px-12 md:py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <MaskReveal delay={0.08}>
              <p className="dis text-white" style={{ fontSize: "clamp(2rem, 7vw, 10rem)", lineHeight: 0.88, maxWidth: "14ch" }}>
                Have a project in mind?
              </p>
            </MaskReveal>
            <div className="flex flex-col gap-4 self-start md:items-end">
              <Link
                href="/contact"
                className="group lab inline-flex items-center gap-4 border border-signal px-6 py-4 text-white transition-colors hover:bg-signal hover:text-black"
                style={{ fontSize: "0.62rem" }}
              >
                Start the transmission
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
              <span className="lab text-white/20" style={{ fontSize: "0.52rem" }}>Indonesia · Available now</span>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
