"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { Project } from "@/lib/types";

interface PersonalWorkArchiveProps {
  projects: Project[];
}

export function PersonalWorkArchive({ projects }: PersonalWorkArchiveProps) {
  const personalProjects = projects.filter((p) => p.type === "personal" || p.tags.includes("Personal"));
  const [activeIndex, setActiveIndex] = useState(0);
  const filmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (filmRef.current && Math.random() > 0.97) {
        filmRef.current.style.opacity = String(Math.random() * 0.08 + 0.02);
      } else if (filmRef.current) {
        filmRef.current.style.opacity = "0.03";
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        setActiveIndex(i => Math.min(i + 1, personalProjects.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        setActiveIndex(i => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [personalProjects.length]);

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

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* FILM GRAIN */}
      <div 
        ref={filmRef}
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
      />

      {/* MAIN IMAGE - using standard img tag instead of Next Image for reliability */}
      <div className="absolute inset-0">
        <img
          key={active.slug}
          src={active.cover}
          alt={active.title}
          className="w-full h-full object-cover"
          style={{
            filter: "grayscale(1) contrast(1.3) brightness(0.65)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      {/* TITLE BLOCK */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-12">
        <span className="lab text-white/30 tracking-[0.3em]" style={{ fontSize: "0.5rem" }}>
          {active.category} — {active.year}
        </span>
        <Link href={`/personal-works/${active.slug}`}>
          <h2 className="dis text-white mt-3 cursor-pointer hover:text-white/70 transition-colors" style={{ fontSize: "clamp(2rem, 8vw, 6rem)", lineHeight: 0.85 }}>
            {active.title}
          </h2>
        </Link>
        <p className="lab text-white/20 mt-3 max-w-md" style={{ fontSize: "0.55rem", letterSpacing: "0.05em" }}>
          {active.tags.slice(0, 3).join(" · ")}
        </p>
      </div>

      {/* NAVIGATION - RIGHT SIDE */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {personalProjects.map((p, i) => (
          <button
            key={p.slug}
            onClick={() => setActiveIndex(i)}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              background: i === activeIndex ? "#ffffff" : "rgba(255,255,255,0.2)",
              transform: i === activeIndex ? "scale(1.3)" : "scale(1)",
            }}
            aria-label={`Go to ${p.title}`}
          />
        ))}
      </div>

      {/* MOBILE NAV - BOTTOM DOTS */}
      <div className="md:hidden absolute bottom-6 left-0 right-0 z-20">
        <div className="flex justify-center gap-4">
          {personalProjects.map((p, i) => (
            <button
              key={p.slug}
              onClick={() => setActiveIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? "20px" : "8px",
                height: "8px",
                background: i === activeIndex ? "#ffffff" : "rgba(255,255,255,0.25)",
              }}
              aria-label={`Go to ${p.title}`}
            />
          ))}
        </div>
      </div>

      {/* COUNTER - TOP LEFT */}
      <div className="absolute top-4 left-4 z-20">
        <span className="dis text-white/25" style={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}>
          {String(activeIndex + 1).padStart(2, "0")} / {String(personalProjects.length).padStart(2, "0")}
        </span>
      </div>

      {/* KEYBOARD HINT - TOP RIGHT */}
      <div className="absolute top-4 right-4 z-20 hidden md:block">
        <span className="lab text-white/15" style={{ fontSize: "0.4rem", letterSpacing: "0.15em" }}>
          ↑↓ NAVIGATE
        </span>
      </div>
    </div>
  );
}
