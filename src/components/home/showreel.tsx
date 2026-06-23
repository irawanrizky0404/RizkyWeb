"use client";

import { Reveal } from "@/components/ui/reveal";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { Marquee } from "@/components/ui/marquee";

const MARQUEE_ITEMS = [
  "3D Visualisation",
  "Motion Design",
  "Illustration",
  "Brand Identity",
  "Art Direction",
  "Visual Effects",
];

export function Showreel() {
  return (
    <>
      <Marquee items={MARQUEE_ITEMS} speed={40} className="py-3" />

      <section id="showreel" className="border-t border-rule">
        <div className="px-5 py-4 md:px-8">
          <span className="fac">FAC.06</span>
        </div>

        <Reveal>
          <div className="px-5 md:px-8">
            <BeforeAfterSlider
              before={{
                src: "/images/works/phantom-in-the-ruins/01.jpg",
                alt: "Before processing",
                label: "RAW",
              }}
              after={{
                src: "/images/works/phantom-in-the-ruins/02.jpg",
                alt: "After processing",
                label: "FINAL",
              }}
            />
          </div>
        </Reveal>

        <div className="mt-6 px-5 pb-8 md:px-8 md:pb-12">
          <div className="grid grid-cols-1 gap-6 border-t border-rule pt-6 md:grid-cols-[auto_1fr_auto]">
            <Reveal>
              <span className="lab text-signal/50 hidden md:block" style={{ fontSize: "0.52rem" }}>02</span>
            </Reveal>
            <Reveal>
              <p className="text-sm leading-loose text-white/50 max-w-xl">
                Every frame is a process. From raw captures to final compositions —
                see how aesthetic vision transforms through each stage of production.
              </p>
            </Reveal>
            <Reveal>
              <span className="lab text-white/15 hidden md:block" style={{ fontSize: "0.52rem" }}>
                Drag to compare
              </span>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
