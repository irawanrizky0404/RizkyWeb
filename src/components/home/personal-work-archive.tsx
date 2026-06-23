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
  const [isLoaded, setIsLoaded] = useState(false);
  const filmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (personalProjects.length > 0) {
      setIsLoaded(true);
    }
  }, [personalProjects.length]);

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
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, personalProjects.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [personalProjects.length]);

  const goNext = () => setActiveIndex(i => Math.min(i + 1, personalProjects.length - 1));
  const goPrev = () => setActiveIndex(i => Math.max(i - 1, 0));

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

      {/* MAIN IMAGE */}
      <div className="absolute inset-0">
        <img
          key={active.slug}
          src={active.cover}
          alt={active.title}
          className="w-full h-full object-cover transition-opacity duration-500"
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

      {/* ARROW NAVIGATION - BOTTOM RIGHT */}
      <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20 flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={activeIndex === 0}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/60 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Previous"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={goNext}
          disabled={activeIndex === personalProjects.length - 1}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/60 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Next"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* NAVIGATION DOTS - BOTTOM CENTER */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex justify-center gap-3">
          {personalProjects.map((p, i) => (
            <button
              key={p.slug}
              onClick={() => setActiveIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? "24px" : "8px",
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

      {/* KEYBOARD HINT - HIDDEN ON MOBILE */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-3">
        <span className="lab text-white/15" style={{ fontSize: "0.4rem", letterSpacing: "0.15em" }}>
          ← → OR J K
        </span>
      </div>

      {/* BACK LINK - TOP LEFT CORNER */}
      <div className="absolute top-4 left-20 z-20">
        <Link href="/" className="lab text-white/20 hover:text-white/60 transition-colors" style={{ fontSize: "0.5rem", letterSpacing: "0.1em" }}>
          ← HOME
        </Link>
      </div>
    </div>
  );
}
