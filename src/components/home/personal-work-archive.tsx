"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/types";

interface PersonalWorkArchiveProps {
  projects: Project[];
}

export function PersonalWorkArchive({ projects }: PersonalWorkArchiveProps) {
  const personalProjects = projects.filter((p) => p.type === "personal" || p.tags.includes("Personal"));

  if (personalProjects.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#333]">NO WORKS</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* HEADER */}
      <header className="border-b border-[#1a1a1a] px-6 py-8 md:px-12">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[#333] text-[0.6rem] tracking-[0.3em]">FAC.05 — PERSONAL ARCHIVE</span>
            <h1 className="text-white text-[clamp(3rem,12vw,10rem)] leading-[0.85] tracking-[-0.03em] mt-2">
              Personal
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[#333] text-[0.5rem] tracking-[0.2em]">{personalProjects.length} WORKS</span>
          </div>
        </div>
      </header>

      {/* GRID LIST */}
      <div className="px-6 py-12 md:px-12">
        {personalProjects.map((project, i) => (
          <article key={project.slug} className="group border-b border-[#1a1a1a] last:border-b-0">
            <Link 
              href={`/personal-works/${project.slug}`}
              className="flex items-stretch gap-0"
            >
              {/* NUMBER */}
              <div className="flex items-center justify-center w-12 md:w-20 shrink-0 border-r border-[#1a1a1a] py-6">
                <span className="text-[#2a2a2a] group-hover:text-[#444] text-[0.6rem] md:text-[0.7rem] transition-colors duration-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* IMAGE */}
              <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 relative overflow-hidden ml-6 md:ml-8 my-4">
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  sizes="128px"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  style={{ filter: "grayscale(1) contrast(1.1)" }}
                />
              </div>

              {/* INFO */}
              <div className="flex-1 flex items-center justify-between border-l border-[#1a1a1a] pl-6 md:pl-10 pr-4 md:pr-8 py-4 md:py-0">
                <div>
                  <h2 className="text-white text-[clamp(1.2rem,4vw,2.5rem)] leading-[0.9] tracking-[-0.02em] group-hover:text-[#888] transition-colors duration-300">
                    {project.title}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 md:mt-3">
                    <span className="text-[#333] text-[0.5rem] tracking-[0.15em]">{project.category}</span>
                    <span className="text-[#222] text-[0.5rem]">—</span>
                    <span className="text-[#333] text-[0.5rem] tracking-[0.1em]">{project.year}</span>
                  </div>
                </div>
                <span className="text-[#222] group-hover:text-[#555] text-[0.7rem] md:text-[0.8rem] transition-colors duration-300 translate-x-0 group-hover:translate-x-2">
                  →
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#1a1a1a] px-6 py-8 md:px-12">
        <div className="flex items-center justify-between">
          <span className="text-[#222] text-[0.5rem] tracking-[0.15em]">RIZKY IRAWAN — PERSONAL WORKS</span>
          <Link href="/works" className="text-[#333] hover:text-white text-[0.5rem] tracking-[0.15em] transition-colors">
            WORKS →
          </Link>
        </div>
      </footer>
    </div>
  );
}
