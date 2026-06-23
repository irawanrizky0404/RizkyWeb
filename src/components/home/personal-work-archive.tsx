"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";

interface PersonalWorkArchiveProps {
  projects: Project[];
}

export function PersonalWorkArchive({ projects }: PersonalWorkArchiveProps) {
  const personalProjects = projects.filter((p) => p.type === "personal" || p.tags.includes("Personal"));

  if (personalProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="dis text-white/10" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>
          No works in this category yet.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {personalProjects.map((project, i) => (
        <motion.section
          key={project.slug}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative border-t border-white/5"
        >
          <Link
            href={`/personal-works/${project.slug}`}
            className="group block"
          >
            <div className={`flex flex-col md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              {/* IMAGE */}
              <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden bg-black">
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  style={{
                    filter: "grayscale(0.3) contrast(1.05) brightness(0.9)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
              </div>

              {/* INFO */}
              <div className="relative w-full md:w-1/2 flex flex-col justify-center px-8 py-12 md:px-16 md:py-24 bg-[#080808]">
                {/* Number watermark */}
                <span 
                  className="absolute top-4 right-8 md:top-auto md:bottom-8 md:right-16 text-white/[0.03] dis select-none pointer-events-none" 
                  style={{ fontSize: "clamp(6rem, 20vw, 16rem)", lineHeight: 1 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="relative z-10">
                  <span className="lab text-white/30 block mb-4" style={{ fontSize: "0.55rem", letterSpacing: "0.2em" }}>
                    {project.category} — {project.year}
                  </span>
                  
                  <h2 
                    className="dis text-white group-hover:text-white/80 transition-colors duration-500" 
                    style={{ fontSize: "clamp(2rem, 6vw, 5rem)", lineHeight: 0.9, letterSpacing: "-0.02em" }}
                  >
                    {project.title}
                  </h2>
                  
                  <div className="flex items-center gap-3 mt-6">
                    <span className="w-8 h-[1px] bg-white/20" />
                    <span className="lab text-white/25" style={{ fontSize: "0.5rem", letterSpacing: "0.1em" }}>
                      {project.tags.slice(0, 2).join(" · ")}
                    </span>
                  </div>

                  <div className="mt-8 md:mt-10 flex items-center gap-2 text-white/40 group-hover:text-white transition-colors duration-300">
                    <span className="lab" style={{ fontSize: "0.6rem", letterSpacing: "0.1em" }}>VIEW PROJECT</span>
                    <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.section>
      ))}

      {/* FOOTER SPACE */}
      <div className="h-32 border-t border-white/5" />
    </div>
  );
}
