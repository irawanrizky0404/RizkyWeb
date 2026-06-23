"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
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
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const rawFilter = searchParams.get("category") ?? "All";
  const filter: Filter = (FILTERS as readonly string[]).includes(rawFilter) ? rawFilter as Filter : "All";

  function setFilter(f: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (f === "All") params.delete("category");
    else params.set("category", f);
    router.replace(`/personal-works${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  const filtered = filter === "All" ? personalProjects : personalProjects.filter((p) => p.category === filter);
  const featured = filtered.filter((p) => p.featured);

  return (
    <div>
      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="border-t border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 md:px-12">
            <span className="fac">Featured</span>
            <span className="lab text-white/20" style={{ fontSize: "0.6rem" }}>Personal Selections</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link
                  href={`/personal-works/${p.slug}`}
                  className="group relative flex flex-col overflow-hidden border-b border-r border-white/5"
                  style={{ minHeight: "360px" }}
                >
                  {/* Image */}
                  <div className="relative flex-1 overflow-hidden bg-black" style={{ minHeight: "260px" }}>
                    <Image
                      src={p.cover}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="img-distort object-cover"
                      style={{
                        filter: "grayscale(0.5) contrast(1.1) brightness(0.75)",
                        mixBlendMode: "normal",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="relative z-10 border-t border-white/10 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="fac block mb-1 text-white/30" style={{ fontSize: "0.45rem" }}>{p.category} · {p.year}</span>
                        <h3
                          className="dis text-white group-hover:text-white/80 transition-colors"
                          style={{ fontSize: "clamp(1.1rem, 3vw, 2rem)", lineHeight: 0.9 }}
                        >
                          {p.title}
                        </h3>
                      </div>
                      <span className="lab text-white/20 transition-all group-hover:translate-x-1 group-hover:text-white shrink-0 mt-1">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* INDEX */}
      <div className="relative border-t border-white/10">

        {/* Header: filter */}
        <div className="border-b border-white/5 px-5 md:px-12">
          <div className="flex items-center justify-between py-3">
            <span className="fac">All Personal Works</span>
            <span className="lab text-white/20" style={{ fontSize: "0.6rem" }}>{filtered.length} works</span>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="lab shrink-0 px-3 py-1 transition-colors"
                style={{
                  fontSize: "0.55rem",
                  color: filter === f ? "#080808" : "rgba(255,255,255,0.3)",
                  background: filter === f ? "#ffffff" : "transparent",
                  border: `1px solid ${filter === f ? "#ffffff" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "2px",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="px-5 py-16 md:px-12 text-center">
            <p className="dis text-white/10" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>No works in this category yet.</p>
          </div>
        )}

        {/* LIST */}
        {filtered.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-2%" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/personal-works/${p.slug}`}
              onMouseEnter={() => setActiveSlug(p.slug)}
              onMouseLeave={() => setActiveSlug(null)}
              className="group flex items-center gap-4 border-b border-white/5 px-5 py-4 transition-colors hover:bg-white/[0.02] md:gap-8 md:px-12 md:py-5"
            >
              {/* Mobile thumbnail */}
              <div className="relative shrink-0 overflow-hidden md:hidden" style={{ width: 40, height: 40 }}>
                <Image
                  src={p.cover}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <span className="lab w-7 shrink-0 text-white/25 transition-colors group-hover:text-white hidden md:block" style={{ fontSize: "0.58rem" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="dis flex-1 text-white/70 group-hover:text-white transition-colors" style={{ fontSize: "clamp(1rem, 4vw, 3.5rem)", lineHeight: 0.9 }}>
                {p.title}
              </span>
              <span className="lab hidden shrink-0 text-white/15 md:block" style={{ fontSize: "0.6rem" }}>
                {p.category}
              </span>
              <span className="lab shrink-0 text-white/20" style={{ fontSize: "0.6rem" }}>
                {p.year}
              </span>
              <span className="lab shrink-0 text-transparent transition-all duration-150 group-hover:translate-x-1 group-hover:text-white">→</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
