"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Project } from "@/lib/types";

interface PersonalWorkArchiveProps {
  projects: Project[];
}

export function PersonalWorkArchive({ projects }: PersonalWorkArchiveProps) {
  const personalProjects = projects.filter((p) => p.type === "personal" || p.tags.includes("Personal"));
  const [activeIndex, setActiveIndex] = useState(0);
  const filmRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (filmRef.current) {
        filmRef.current.style.opacity = Math.random() > 0.97 ? String(Math.random() * 0.1) : "0.035";
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex(i => (i + 1) % personalProjects.length);
  }, [personalProjects.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(i => (i - 1 + personalProjects.length) % personalProjects.length);
  }, [personalProjects.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "l") goNext();
      else if (e.key === "ArrowLeft" || e.key === "h") goPrev();
      else if (e.key === " " || e.key === "Enter") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 50) {
        if (e.deltaY > 0) goNext();
        else goPrev();
      }
    };
    const el = containerRef.current;
    if (el) {
      el.addEventListener("wheel", handleWheel, { passive: true });
      return () => el.removeEventListener("wheel", handleWheel);
    }
  }, [goNext, goPrev]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext();
        else goPrev();
      }
    };
    const el = containerRef.current;
    if (el) {
      el.addEventListener("touchstart", handleTouchStart, { passive: true });
      el.addEventListener("touchend", handleTouchEnd, { passive: true });
      return () => {
        el.removeEventListener("touchstart", handleTouchStart);
        el.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [goNext, goPrev]);

  if (personalProjects.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <p className="dis text-white/20" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", letterSpacing: "0.3em" }}>
          NO WORKS
        </p>
      </div>
    );
  }

  const active = personalProjects[activeIndex];
  const prev = personalProjects[(activeIndex - 1 + personalProjects.length) % personalProjects.length];
  const next = personalProjects[(activeIndex + 1) % personalProjects.length];

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      {/* FILM GRAIN */}
      <div 
        ref={filmRef}
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: "overlay",
        }}
      />

      {/* CINEMASCOPE BARS */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent" style={{ height: "80px" }} />
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent" style={{ height: "80px" }} />

      {/* FILM PERFORATIONS - LEFT */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3" style={{ padding: "20px 0" }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-4 h-6 bg-black/60 border border-white/10" />
        ))}
      </div>

      {/* FILM PERFORATIONS - RIGHT */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3" style={{ padding: "20px 0" }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-4 h-6 bg-black/60 border border-white/10" />
        ))}
      </div>

      {/* MAIN IMAGE */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          key={active.slug}
          src={active.cover}
          alt={active.title}
          className="w-full h-full object-cover"
          style={{
            filter: "grayscale(1) contrast(1.4) brightness(0.55)",
          }}
        />
      </div>

      {/* VIGNETTE */}
      <div className="absolute inset-0 z-10 pointer-events-none" 
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)" }} 
      />

      {/* TITLE BLOCK - BOTTOM LEFT */}
      <div className="absolute bottom-8 left-8 md:left-12 z-20 max-w-lg">
        <div className="mb-2">
          <span className="dis text-white/15" style={{ fontSize: "0.65rem", letterSpacing: "0.15em" }}>
            {String(activeIndex + 1).padStart(2, "0")} — {active.category}
          </span>
        </div>
        <Link href={`/personal-works/${active.slug}`}>
          <h2 className="dis text-white hover:text-white/70 transition-colors" style={{ fontSize: "clamp(1.8rem, 6vw, 5rem)", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
            {active.title}
          </h2>
        </Link>
        <div className="flex items-center gap-4 mt-4">
          <span className="lab text-white/25" style={{ fontSize: "0.5rem", letterSpacing: "0.1em" }}>
            {active.year}
          </span>
          <span className="w-8 h-[1px] bg-white/20" />
          <span className="lab text-white/25" style={{ fontSize: "0.5rem", letterSpacing: "0.1em" }}>
            {active.tags.slice(0, 2).join(" · ")}
          </span>
        </div>
      </div>

      {/* FILM STRIP - BOTTOM */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-2">
        {[prev, active, next].map((p, i) => (
          <div 
            key={p.slug}
            onClick={() => setActiveIndex((activeIndex - 1 + i + personalProjects.length) % personalProjects.length)}
            className="relative overflow-hidden cursor-pointer transition-all duration-500"
            style={{ 
              width: i === 1 ? "80px" : "50px",
              height: i === 1 ? "60px" : "40px",
              opacity: i === 1 ? 1 : 0.4,
            }}
          >
            <img src={p.cover} alt="" className="w-full h-full object-cover" style={{ filter: "grayscale(1) contrast(1.2)" }} />
          </div>
        ))}
      </div>

      {/* HOME LINK - TOP LEFT */}
      <div className="absolute top-6 left-6 z-30">
        <Link href="/" className="lab text-white/30 hover:text-white/70 transition-colors" style={{ fontSize: "0.5rem", letterSpacing: "0.15em" }}>
          RIZKY IRAWAN
        </Link>
      </div>

      {/* WORKS LINK - TOP RIGHT */}
      <div className="absolute top-6 right-6 z-30">
        <Link href="/works" className="lab text-white/30 hover:text-white/70 transition-colors" style={{ fontSize: "0.5rem", letterSpacing: "0.15em" }}>
          WORKS →
        </Link>
      </div>

      {/* INSTRUCTIONS - BOTTOM RIGHT (subtle) */}
      <div className="absolute bottom-6 right-6 z-20 hidden md:block">
        <span className="lab text-white/10" style={{ fontSize: "0.4rem", letterSpacing: "0.12em" }}>
          SCROLL · KEYS · SWIPE
        </span>
      </div>
    </div>
  );
}
