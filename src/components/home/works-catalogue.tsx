"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import type { Project } from "@/lib/types";

interface WorksCatalogueProps {
  projects: Project[];
  typeFilter?: "client" | "personal";
}

export function WorksCatalogue({ projects, typeFilter }: WorksCatalogueProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const catalogueWorks = typeFilter === "personal" ? projects.filter((p) => p.type === "personal") :
                          typeFilter === "client" ? projects.filter((p) => p.type === "client" || !p.type) :
                          projects;
  const active = catalogueWorks.find((p) => p.slug === hovered);

  return (
    <section className="relative border-t border-rule">

      {/* Ghost background image */}
      {active && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            key={active.slug}
            src={active.cover}
            alt=""
            fill
            className="object-cover opacity-[0.09] grayscale"
            sizes="100vw"
          />
        </div>
      )}

      {/* Header — two short pieces, never wraps */}
      <div className="relative flex items-center justify-between border-b border-rule px-5 py-3 md:px-8">
        <span className="fac">{typeFilter === "personal" ? "FAC.03 — Personal" : "FAC.04"}</span>
        <Link href={typeFilter === "personal" ? "/personal-works" : "/works"} className="lab text-white/50 transition-colors hover:text-white" style={{ fontSize: "0.62rem" }}>
          All ({catalogueWorks.length}) ↗
        </Link>
      </div>

      {catalogueWorks.map((p, i) => (
        <Link
          key={p.slug}
          href={`/${typeFilter === "personal" ? "personal-works" : "works"}/${p.slug}`}
          className="group relative flex items-center gap-3 border-b border-rule px-5 py-3 transition-colors duration-75 hover:bg-white/[0.04] md:gap-8 md:px-8 md:py-5"
          onMouseEnter={() => setHovered(p.slug)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Thumbnail — mobile only */}
          <div className="mob-only relative shrink-0 overflow-hidden" style={{ width: 44, height: 44 }}>
            <Image
              src={p.cover}
              alt=""
              fill
              className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
              sizes="44px"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300" />
          </div>

          <span className="lab w-6 shrink-0 text-white/35 transition-colors group-hover:text-signal" style={{ fontSize: "0.58rem" }}>
            {String(i + 1).padStart(2, "0")}
          </span>

          <span
            className="dis flex-1 text-white truncate transition-colors duration-200 group-hover:text-signal/90"
            style={{ fontSize: "clamp(0.9rem, 4.2vw, 3.5rem)" }}
          >
            {p.title}
          </span>

          <span className="lab hidden shrink-0 text-white/20 md:block" style={{ fontSize: "0.55rem" }}>
            {p.category}
          </span>
          <span className="lab shrink-0 text-white/30 tabular-nums" style={{ fontSize: "0.58rem" }}>
            {p.year}
          </span>
          <span className="lab shrink-0 text-transparent transition-all duration-150 group-hover:translate-x-1 group-hover:text-signal" style={{ fontSize: "0.7rem" }}>
            →
          </span>
        </Link>
      ))}

      <Link
        href={typeFilter === "personal" ? "/personal-works" : "/works"}
        className="group relative flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.04] md:px-8"
      >
        <span className="lab text-white/40 group-hover:text-white" style={{ fontSize: "0.62rem" }}>Full archive {typeFilter === "personal" ? "" : "+ client work"}</span>
        <span className="lab text-white/40 group-hover:text-signal">→</span>
      </Link>
    </section>
  );
}
