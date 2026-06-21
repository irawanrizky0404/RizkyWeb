import Link from "next/link";
import { siteConfig } from "@/lib/data";
import { ColorCode } from "@/components/ui/color-code";

export function Footer() {
  return (
    <footer className="relative mt-32">
      <div className="h-[3px]">
        <ColorCode />
      </div>

      <div className="px-6 pb-10 pt-16 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1800px]">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-7">
              <p className="font-serif text-xl italic leading-snug text-bone md:text-3xl">
                &ldquo;Designing immersive digital experiences through 3D,
                motion, illustration, and graphic design.&rdquo;
              </p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-6 inline-block break-all font-display text-2xl font-medium tracking-tighter transition-colors hover:text-sodium md:mt-8 md:text-5xl md:break-normal"
              >
                {siteConfig.email}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-5 md:grid-cols-2 md:gap-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                  [ Index ]
                </p>
                <ul className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
                  <li><Link href="/works" className="transition-colors hover:text-sodium">Work</Link></li>
                  <li><Link href="/about" className="transition-colors hover:text-sodium">About</Link></li>
                  <li><Link href="/services" className="transition-colors hover:text-sodium">Services</Link></li>
                  <li><Link href="/contact" className="transition-colors hover:text-sodium">Contact</Link></li>
                </ul>
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                  [ Social ]
                </p>
                <ul className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
                  <li><a href={siteConfig.social.instagram} className="transition-colors hover:text-sodium">Instagram</a></li>
                  <li><a href={siteConfig.social.behance} className="transition-colors hover:text-sodium">Behance</a></li>
                  <li><a href={siteConfig.social.linkedin} className="transition-colors hover:text-sodium">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground md:mt-20 md:flex-row md:justify-between">
            <span>© {new Date().getFullYear()} {siteConfig.name}</span>
            <span>Visual Archive — Vol. 01</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
