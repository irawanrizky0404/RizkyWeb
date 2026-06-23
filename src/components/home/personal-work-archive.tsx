"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { Project } from "@/lib/types";

interface PersonalWorkArchiveProps {
  projects: Project[];
}

const FILTERS = ["All", "3D", "Illustration", "Graphic Design", "Animation"] as const;
type Filter = typeof FILTERS[number];

export function PersonalWorkArchive({ projects }: PersonalWorkArchiveProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personalProjects = projects.filter((p) => p.type === "personal" || p.tags.includes("Personal"));
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const filmRef = useRef<HTMLDivElement>(null);

  const filtered = activeFilter === "All" ? personalProjects : personalProjects.filter((p) => p.category === activeFilter);

  function setFilter(f: Filter) {
    setActiveFilter(f);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (filmRef.current) {
        filmRef.current.style.opacity = Math.random() > 0.95 ? String(Math.random() * 0.08) : "0.04";
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-black min-h-screen">
      {/* ── FILM GRAIN OVERLAY ─────────────────────────────────────── */}
      <div 
        ref={filmRef}
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── CINEMASCAPE BAR ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/90 h-2" />
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 h-2" />

      {/* ── FILTER NAV ──────────────────────────────────────────────── */}
      <div className="sticky top-2 z-30 bg-black/95 backdrop-blur-sm border-y border-white/10">
        <div className="flex items-center justify-between px-6 py-4 md:px-12">
          <div className="flex items-center gap-6">
            <span className="fac text-white/20 tracking-[0.3em]" style={{ fontSize: "0.55rem" }}>
              {filtered.length} WORKS
            </span>
            <div className="flex items-center gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="lab px-3 py-1 transition-all duration-300"
                  style={{
                    fontSize: "0.5rem",
                    letterSpacing: "0.1em",
                    color: activeFilter === f ? "#ffffff" : "rgba(255,255,255,0.25)",
                    background: activeFilter === f ? "rgba(255,255,255,0.1)" : "transparent",
                    borderBottom: activeFilter === f ? "1px solid #ffffff" : "1px solid transparent",
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <span className="fac text-white/15 hidden md:block" style={{ fontSize: "0.5rem", letterSpacing: "0.2em" }}>
            PERSONAL / 2017—PRESENT
          </span>
        </div>
      </div>

      {/* ── MAIN GRID ──────────────────────────────────────────────── */}
      <div className="pt-16 pb-8 px-6 md:px-12 md:pt-20">
        {filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="dis text-white/10" style={{ fontSize: "clamp(1rem, 3vw, 2rem)", letterSpacing: "0.3em" }}>
              NO WORKS FOUND
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="relative group"
              >
                <Link
                  href={`/personal-works/${p.slug}`}
                  onMouseEnter={() => setHoveredSlug(p.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  className="block relative"
                  style={{ minHeight: "70vh" }}
                >
                  {/* Image */}
                  <div className="relative w-full h-full" style={{ minHeight: "70vh" }}>
                    <Image
                      src={p.cover}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      style={{
                        filter: "grayscale(0.8) contrast(1.3) brightness(0.7)",
                        mixBlendMode: "luminosity",
                      }}
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    
                    {/* Secondary overlay on hover */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    />

                    {/* Number */}
                    <div className="absolute top-6 left-6 md:top-8 md:left-8">
                      <span className="dis text-white/10 group-hover:text-white/30 transition-colors duration-500" style={{ fontSize: "clamp(4rem, 15vw, 12rem)", lineHeight: 0.7 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="lab text-white/40 tracking-[0.2em]" style={{ fontSize: "0.5rem" }}>
                          {p.category} — {p.year}
                        </span>
                        <h2 className="dis text-white mt-2" style={{ fontSize: "clamp(1.8rem, 5vw, 4rem)", lineHeight: 0.85, letterSpacing: "-0.02em" }}>
                          {p.title}
                        </h2>
                      </div>
                    </div>

                    {/* Hover line */}
                    <div className="absolute bottom-0 left-0 h-[1px] bg-white/0 group-hover:bg-white/50 transition-all duration-700" style={{ width: "0%" }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER LINE ─────────────────────────────────────────────── */}
      <div className="px-6 py-12 md:px-12 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="fac text-white/10" style={{ fontSize: "0.5rem", letterSpacing: "0.2em" }}>
            PERSONAL ARCHIVE — RIZKY IRAWAN
          </span>
          <span className="fac text-white/10" style={{ fontSize: "0.5rem", letterSpacing: "0.2em" }}>
            {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* ── HOVER PREVIEW ───────────────────────────────────────────── */}
      <AnimatePresence>
        {hoveredSlug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 right-8 -translate-y-1/2 z-40 hidden lg:block overflow-hidden"
            style={{
              width: "320px",
              height: "420px",
              boxShadow: "0 0 60px rgba(0,0,0,0.8)",
            }}
          >
            {personalProjects.find(p => p.slug === hoveredSlug) && (
              <Image
                src={personalProjects.find(p => p.slug === hoveredSlug)!.cover}
                alt=""
                fill
                sizes="320px"
                className="object-cover"
                style={{
                  filter: "grayscale(0.6) contrast(1.2) brightness(0.8)",
                  mixBlendMode: "luminosity",
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
