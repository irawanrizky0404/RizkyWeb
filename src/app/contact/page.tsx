import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name}.`,
};

export default function ContactPage() {
  return (
    <section className="px-6 pt-24 pb-16 md:px-10 md:pt-36 md:pb-24">
      <div className="mx-auto max-w-[1800px]">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
            [ Contact ]
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-12 md:mt-12 md:grid-cols-12 md:gap-16">
          {/* Left — heading */}
          <div className="md:col-span-7">
            <Reveal delay={0.1}>
              <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] font-bold leading-[0.82] tracking-tighter">
                Get in
                <br />
                <span className="font-serif font-normal italic text-bone">
                  touch
                </span>
                <span className="text-sodium">.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md font-serif text-lg italic leading-relaxed text-bone/80 md:text-xl">
                Whether you have a fully formed brief or just the seed of an
                idea, I&apos;m here to help it grow into something real.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-8 flex items-center gap-3">
                <span className="h-2.5 w-2.5 bg-sodium" />
                <span className="font-mono text-sm text-sodium">
                  Available for work — 2025
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right — contact list */}
          <div className="md:col-span-5">
            <Reveal delay={0.15}>
              <div className="border-t border-border">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="block border-b border-border py-5 transition-colors hover:text-sodium md:py-6"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1.5 break-all font-display text-base font-medium tracking-tight md:text-xl">
                    {siteConfig.email}
                  </p>
                </a>

                <a
                  href={siteConfig.social.instagram}
                  className="block border-b border-border py-5 transition-colors hover:text-sodium md:py-6"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Instagram
                  </p>
                  <p className="mt-1.5 font-display text-base font-medium tracking-tight md:text-xl">
                    @rizkyirawan
                  </p>
                </a>

                <a
                  href={siteConfig.social.behance}
                  className="block border-b border-border py-5 transition-colors hover:text-sodium md:py-6"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Behance
                  </p>
                  <p className="mt-1.5 font-display text-base font-medium tracking-tight md:text-xl">
                    /rizkyirawan
                  </p>
                </a>

                <a
                  href={siteConfig.social.linkedin}
                  className="block border-b border-border py-5 transition-colors hover:text-sodium md:py-6"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    LinkedIn
                  </p>
                  <p className="mt-1.5 font-display text-base font-medium tracking-tight md:text-xl">
                    /in/rizkyirawan
                  </p>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
