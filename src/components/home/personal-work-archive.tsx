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
  const filmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (filmRef.current) {
        filmRef.current.style.opacity = Math.random() > 0.97 ? String(Math.random() * 0.06 + 0.02) : "0.04";
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  if (personalProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <p className="dis text-white/10" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", letterSpacing: "0.3em" }}>
          NO WORKS
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050508]">
      {/* FILM GRAIN */}
      <div
        ref={filmRef}
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
          mixBlendMode: "overlay",
        }}
      />

      {/* VIGNETTE */}
      <div className="pointer-events-none absolute inset-0 z-30" 
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)" }} 
      />

      {personalProjects.map((project, i) => (
        <motion.section
          key={project.slug}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="relative border-t border-white/[0.03]"
        >
          <Link
            href={`/personal-works/${project.slug}`}
            className="group block"
          >
            <div className={`flex flex-col md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''} relative`}>
              {/* IMAGE - LARGE */}
              <div className="relative w-full md:w-3/5 aspect-[16/10] md:aspect-[21/9] overflow-hidden bg-black">
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                  style={{
                    filter: "grayscale(1) contrast(1.1) brightness(1.1)",
                  }}
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
              </div>

              {/* INFO - DARK SIDE */}
              <div className="relative w-full md:w-2/5 flex flex-col justify-center px-10 py-16 md:px-16 md:py-0 bg-[#050508]">
                {/* Large number */}
                <span 
                  className="absolute top-8 right-8 md:top-auto md:bottom-4 md:right-6 text-white/[0.05] dis select-none pointer-events-none" 
                  style={{ fontSize: "clamp(8rem, 25vw, 20rem)", lineHeight: 1, fontWeight: 300 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="relative z-10 max-w-md">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="w-6 h-[1px] bg-[#3a5a7a]" />
                    <span className="lab text-[#4a6a8a]" style={{ fontSize: "0.5rem", letterSpacing: "0.25em" }}>
                      {project.category.toUpperCase()}
                    </span>
                  </div>
                  
                  <h2 
                    className="dis text-white" 
                    style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 0.85, letterSpacing: "-0.03em", fontWeight: 300 }}
                  >
                    {project.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 mt-8">
                    <span className="dis text-white/30" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", fontWeight: 300 }}>
                      {project.year}
                    </span>
                    <span className="w-12 h-[1px] bg-white/10" />
                  </div>

                  <div className="mt-10 flex items-center gap-3">
                    <span className="lab text-white/30" style={{ fontSize: "0.55rem", letterSpacing: "0.2em" }}>
                      ENTER
                    </span>
                    <span className="text-lg text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.section>
      ))}

      {/* FOOTER */}
      <div className="relative z-10 h-32 border-t border-white/[0.03] flex items-center justify-between px-10 md:px-16">
        <span className="lab text-white/10" style={{ fontSize: "0.5rem", letterSpacing: "0.2em" }}>
          PERSONAL ARCHIVE — RIZKY IRAWAN
        </span>
        <Link href="/works" className="lab text-white/20 hover:text-white/50 transition-colors" style={{ fontSize: "0.5rem", letterSpacing: "0.15em" }}>
          WORKS →
        </Link>
      </div>
    </div>
  );
}
