"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

export function Recognition() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGlitching(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-black overflow-hidden">

      {/* Top rule + label */}
      <div className="flex items-center justify-between border-t-2 border-signal px-5 pt-4 pb-0 md:px-8">
        <span className="fac">FAC.07</span>
        <span className="lab text-white/25" style={{ fontSize: "0.6rem" }}>2024</span>
      </div>

      {/* WINNER */}
      <div className="overflow-hidden px-5 pt-4 md:px-8 md:pt-6">
        <p
          ref={textRef}
          className={`dis text-signal${glitching ? " glitch" : ""}`}
          style={{
            fontSize: "clamp(4rem, 22vw, 34rem)",
            lineHeight: 0.82,
            letterSpacing: "-0.02em",
          }}
        >
          Winner.
        </p>
      </div>

      {/* Award info */}
      <div className="border-t border-rule px-5 pt-6 pb-10 md:px-8 md:pt-8 md:pb-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

          <div className="max-w-lg">
            <p className="dis text-white" style={{ fontSize: "clamp(1.4rem, 3.5vw, 4.5rem)", lineHeight: 0.9 }}>
              NASA Space Tech Art Challenge — Imagine Tomorrow
            </p>
            <p className="mt-5 text-sm leading-relaxed text-white/55 max-w-md">
              Selected from a global field of entrants for an illustration series
              visualizing emerging space technologies through atmospheric, painterly technique.
            </p>
            <Link
              href="https://www.nasa.gov/image-article/winners-named-in-nasa-space-tech-art-challenge/"
              target="_blank"
              rel="noopener noreferrer"
              className="lab mt-6 inline-flex items-center gap-3 text-signal hover:text-white transition-colors"
            >
              nasa.gov ↗
            </Link>
          </div>

          <div className="flex flex-row gap-10 md:flex-col md:items-end md:gap-4 md:text-right">
            <div>
              <p className="lab text-white/35 mb-1" style={{ fontSize: "0.6rem" }}>Category</p>
              <p className="lab text-white/70">Illustration Series</p>
            </div>
            <div>
              <p className="lab text-white/35 mb-1" style={{ fontSize: "0.6rem" }}>Year</p>
              <p className="lab text-white/70">2024</p>
            </div>
            <div>
              <p className="lab text-white/35 mb-1" style={{ fontSize: "0.6rem" }}>Field</p>
              <p className="lab text-white/70">Global · Open</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
