"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { useDesign } from "@/lib/design-context";

interface FilmStripProps {
  projects: Project[];
  typeFilter?: "client" | "personal";
}

export function FilmStrip({ projects, typeFilter }: FilmStripProps) {
  const design = useDesign();
  const getBrightness = (hex: string) => {
    if (!hex) return 0;
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
    if (hex.length !== 6) return 0;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };
  const isLight = getBrightness(design?.colors?.black || "#080808") > 128;

  const filteredProjects = typeFilter === "personal" ? projects.filter((p) => p.type === "personal") :
                           typeFilter === "client" ? projects.filter((p) => p.type === "client" || !p.type) :
                           projects;
  const featured = filteredProjects.filter((p) => p.featured);
  const rest = filteredProjects.filter((p) => !p.featured);
  const FRAMES = [...featured, ...rest].slice(0, 6);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Wheel-hijack: horizontal scroll on vertical wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Only hijack when section is mostly in view
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.3;
      if (!inView) return;
      const track = trackRef.current;
      if (!track) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const atStart = track.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = track.scrollLeft >= maxScroll - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY * 1.2;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Mouse drag scroll (desktop)
  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = trackRef.current?.scrollLeft ?? 0;
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !trackRef.current) return;
    trackRef.current.scrollLeft = scrollStart.current - (e.clientX - startX.current);
  }
  function onMouseUp() { isDragging.current = false; }

  // Touch scroll (mobile) — native horizontal scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTouchStart = (e: TouchEvent) => {
      track.dataset.touching = "true";
    };

    const onTouchEnd = () => {
      delete track.dataset.touching;
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Track active frame
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const frameCount = FRAMES.length;
    const onScroll = () => {
      const frameWidth = track.scrollWidth / frameCount;
      setActiveIndex(Math.round(track.scrollLeft / frameWidth));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative border-t border-rule overflow-hidden bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 md:px-12 border-b border-rule">
        <div className="flex items-center gap-4">
          <span className="fac">{typeFilter === "personal" ? "FAC.03 — Personal" : "FAC.04 — Works"}</span>
          <span className="lab text-white/20 desk-only" style={{ fontSize: "0.52rem" }}>Drag or scroll to advance</span>
        </div>
        {/* Frame counter */}
        <div className="flex items-center gap-1">
          {FRAMES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === activeIndex ? "16px" : "4px",
                height: "2px",
                background: i === activeIndex ? "var(--signal)" : "color-mix(in srgb, var(--white) 20%, transparent)",
                transition: "width 0.3s ease, background 0.3s ease",
                borderRadius: "1px",
              }}
            />
          ))}
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="flex overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          cursor: "grab",
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x",
          overscrollBehaviorX: "contain",
        }}
      >
        {/* Sprocket holes — top */}
        <div className="pointer-events-none absolute top-[52px] left-0 right-0 h-5 flex items-center" style={{ zIndex: 2 }}>
          <div className="flex gap-[18px] px-2">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="shrink-0 rounded-[1px] bg-black border border-white/10" style={{ width: "10px", height: "7px" }} />
            ))}
          </div>
        </div>

        {FRAMES.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/works/${p.slug}`}
            draggable={false}
            className="group relative shrink-0 overflow-hidden"
            style={{
              width: "clamp(240px, 38vw, 560px)",
              height: "clamp(300px, 55vw, 680px)",
              marginLeft: i === 0 ? "clamp(1.25rem, 3rem, 3rem)" : 0,
              marginRight: "3px",
            }}
            onClick={(e) => { if (Math.abs(startX.current - e.clientX) > 5) e.preventDefault(); }}
          >
            {/* Frame border */}
            <div className="absolute inset-0 z-10 border border-white/[0.06] pointer-events-none" />

            <Image
              src={p.cover}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 240px, 560px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              style={{
                filter: "grayscale(1) contrast(1.15) brightness(0.55)",
                mixBlendMode: isLight ? "multiply" : "screen",
              }}
              draggable={false}
            />

            {/* Bottom info */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 p-4"
              style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--black) 90%, transparent) 0%, transparent 100%)" }}
            >
              <p className="fac mb-1" style={{ fontSize: "0.5rem" }}>{String(i + 1).padStart(2, "0")} / {String(FRAMES.length).padStart(2, "0")}</p>
              <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "clamp(1rem, 3vw, 2.2rem)", lineHeight: 0.9 }}>
                {p.title}
              </p>
              <p className="lab text-white/30 mt-1" style={{ fontSize: "0.5rem" }}>{p.category} · {p.year}</p>
            </div>

            {/* Frame number — top right */}
            <div className="absolute top-3 right-3 z-20">
              <span className="lab text-white/20" style={{ fontSize: "0.44rem" }}>F{String(i + 1).padStart(3, "0")}</span>
            </div>
          </Link>
        ))}

        {/* End padding */}
        <div className="shrink-0" style={{ width: "clamp(1.25rem, 3rem, 3rem)" }} />
      </div>

      <style>{`
        div[style*="overflow-x: auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
