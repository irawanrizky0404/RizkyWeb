"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";

interface PersonalWorkArchiveProps {
  projects: Project[];
}

export function PersonalWorkArchive({ projects }: PersonalWorkArchiveProps) {
  const personalProjects = projects.filter((p) => p.type === "personal" || p.tags.includes("Personal"));
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (filmRef.current) {
        filmRef.current.style.opacity = Math.random() > 0.97 ? String(Math.random() * 0.1) : "0.035";
      }
    }, 80);
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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="dis text-white/10" style={{ fontSize: "clamp(1rem, 3vw, 2rem)", letterSpacing: "0.4em" }}>
          NO WORKS
        </p>
      </div>
    );
  }

  const active = personalProjects[activeIndex];

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black overflow-hidden">
      {/* ── FILM GRAIN ──────────────────────────────────────────────── */}
      <div 
        ref={filmRef}
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── CINEMASCOPE BARS ────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black h-3" />
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black h-3" />

      {/* ── MAIN IMAGE ──────────────────────────────────────────────── */}
      <motion.div
        key={active.slug}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <Image
          src={active.cover}
          alt={active.title}
          fill
          sizes="100vw"
          className="object-cover"
          style={{
            filter: "grayscale(1) contrast(1.4) brightness(0.6)",
            mixBlendMode: "multiply",
          }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </motion.div>

      {/* ── TITLE BLOCK ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-12">
        <motion.div
          key={active.slug + "-info"}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="lab text-white/30 tracking-[0.3em]" style={{ fontSize: "0.5rem" }}>
            {active.category} — {active.year}
          </span>
          <Link href={`/personal-works/${active.slug}`}>
            <h2 className="dis text-white mt-3 cursor-pointer hover:text-white/70 transition-colors" style={{ fontSize: "clamp(2rem, 8vw, 7rem)", lineHeight: 0.85, letterSpacing: "-0.02em" }}>
              {active.title}
            </h2>
          </Link>
          <p className="lab text-white/20 mt-4 max-w-md" style={{ fontSize: "0.6rem", letterSpacing: "0.08em", lineHeight: 1.6 }}>
            {active.tags.slice(0, 3).join(" · ")}
          </p>
        </motion.div>
      </div>

      {/* ── NAVIGATION ─────────────────────────────────────────────── */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-4">
        {personalProjects.map((p, i) => (
          <button
            key={p.slug}
            onClick={() => setActiveIndex(i)}
            className="w-2 h-8 transition-all duration-500 relative overflow-hidden"
            aria-label={`Go to ${p.title}`}
          >
            <div 
              className="absolute inset-0 transition-all duration-500"
              style={{ 
                background: i === activeIndex ? "#ffffff" : "rgba(255,255,255,0.15)",
                width: i === activeIndex ? "100%" : "50%",
                left: i === activeIndex ? "0" : "50%",
              }} 
            />
          </button>
        ))}
      </div>

      {/* ── MOBILE: HORIZONTAL SWIPE ───────────────────────────────── */}
      <div className="md:hidden absolute bottom-4 left-0 right-0 z-40">
        <div className="flex justify-center gap-3">
          {personalProjects.map((p, i) => (
            <button
              key={p.slug}
              onClick={() => setActiveIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? "24px" : "6px",
                height: "6px",
                background: i === activeIndex ? "#ffffff" : "rgba(255,255,255,0.3)",
              }}
              aria-label={`Go to ${p.title}`}
            />
          ))}
        </div>
      </div>

      {/* ── KEYBOARD HINT ───────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-40 hidden md:block">
        <span className="lab text-white/10" style={{ fontSize: "0.45rem", letterSpacing: "0.15em" }}>
          ↑↓ NAVIGATE
        </span>
      </div>

      {/* ── COUNTER ─────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-40">
        <span className="dis text-white/10" style={{ fontSize: "clamp(0.6rem, 2vw, 0.8rem)", letterSpacing: "0.1em" }}>
          {String(activeIndex + 1).padStart(2, "0")} / {String(personalProjects.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
