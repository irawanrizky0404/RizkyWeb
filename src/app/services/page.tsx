import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { services, siteConfig } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ColorBar } from "@/components/ui/color-bar";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/lib/category-colors";

export const metadata: Metadata = {
  title: "Services",
  description: "Services across 3D, animation, graphic design, and illustration.",
};

const serviceImages: Record<string, string> = {
  "3D": "/images/services/1.jpg",
  Animation: "/images/services/2.jpg",
  "Graphic Design": "/images/services/3.jpg",
  Illustration: "/images/services/4.jpg",
};

export default function ServicesPage() {
  return (
    <section className="px-6 pt-32 pb-16 md:px-10 md:pt-48 md:pb-24">
      <div className="mx-auto max-w-[1800px]">
        <SectionHeader
          label="Capabilities"
          title="Services"
          description="A multidisciplinary practice serving creative agencies, studios, labels, and publishers — from concept to final delivery."
        />

        <ColorBar className="my-16 md:my-24" />

        <div className="flex flex-col gap-14 md:gap-24">
          {services.map((service, i) => {
            const reversed = i % 2 === 1;
            return (
              <Reveal key={service.category} delay={i * 0.05}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center md:gap-10">
                  <div
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden bg-muted md:col-span-5",
                      reversed && "md:order-2"
                    )}
                  >
                    <Image
                      src={serviceImages[service.category] ?? "/images/services/1.jpg"}
                      alt={service.category}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-background/20" />
                  </div>

                  <div className={cn("md:col-span-7", reversed && "md:order-1")}>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0",
                          categoryColors[service.category] ?? "bg-bone"
                        )}
                      />
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-sodium">
                        {String(i + 1).padStart(2, "0")} — Discipline
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-[clamp(1.75rem,5vw,4rem)] font-bold leading-[0.85] tracking-tighter">
                      {service.category}
                    </h2>
                    <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                      {service.description}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5">
                      {service.items.map((item) => (
                        <li
                          key={item}
                          className="font-mono text-xs text-muted-foreground"
                        >
                          {item}
                          {item !== service.items[service.items.length - 1]
                            ? " ·"
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <ColorBar className="my-16 md:my-24" />

        <div>
          <Reveal>
            <p className="font-serif text-[clamp(1.25rem,4vw,3rem)] italic leading-snug tracking-tight text-bone">
              Have a project in mind?
            </p>
            <Link
              href="/contact"
              className="group mt-6 inline-flex items-baseline gap-2 font-display text-xl font-medium tracking-tight transition-colors hover:text-sodium md:text-4xl"
            >
              {siteConfig.email}
              <span className="text-sodium">→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
