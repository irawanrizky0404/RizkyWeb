"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
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
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const rawFilter = searchParams.get("category") ?? "All";
  const filter: Filter = (FILTERS as readonly string[]).includes(rawFilter) ? rawFilter as Filter : "All";

  function setFilter(f: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (f === "All") params.delete("category");
    else params.set("category", f);
    router.replace(`/personal-works${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const filtered = filter === "All" ? personalProjects : personalProjects.filter((p) => p.category === filter);

  useEffect(() => {
    const tick = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.07;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.07;
      if (previewRef.current) {
        previewRef.current.style.transform = `translate(${pos.current.x + 30}px, ${pos.current.y - 160}px)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  function onMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const activeProject = personalProjects.find((p) => p.slug === hoveredSlug);

  return (
    <div ref={containerRef} onMouseMove={onMove} className="relative">
      {/* ── FILTER BAR ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-5 py-3 md:px-12">
          <span className="fac text-white/40">Personal Works — {filtered.length}</span>
          <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="lab shrink-0 px-3 py-1 transition-all duration-200"
                style={{
                  fontSize: "0.52rem",
                  color: filter === f ? "#0a0a0a" : "rgba(255,255,255,0.35)",
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
      </div>

      {/* ── MASONRY GRID ───────────────────────────────────────────── */}
      <div className="px-5 py-8 md:px-12 md:py-12">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="dis text-white/20" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>
              No personal works in this category yet.
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
                className="break-inside-avoid"
              >
                <Link
                  href={`/personal-works/${p.slug}`}
                  onMouseEnter={() => setHoveredSlug(p.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  className="group relative block overflow-hidden"
                >
                  {/* Image with different styling */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: p.aspectRatio || "4/3" }}>
                    <Image
                      src={p.cover}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                      style={{
                        filter: "grayscale(0.3) contrast(1.05) brightness(0.9)",
                      }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Info on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="lab text-white/60" style={{ fontSize: "0.5rem" }}>{p.category} · {p.year}</span>
                      <h3 className="dis text-white mt-1" style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)", lineHeight: 1 }}>
                        {p.title}
                      </h3>
                    </div>

                    {/* Arrow indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <span className="lab text-white" style={{ fontSize: "0.7rem" }}>→</span>
                    </div>
                  </div>

                  {/* Thin white border instead of rule lines */}
                  <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── FLOATING PREVIEW ───────────────────────────────────────── */}
      <div
        ref={previewRef}
        className="pointer-events-none absolute left-0 top-0 z-20 hidden overflow-hidden"
        style={{
          width: "280px",
          height: "360px",
          opacity: hoveredSlug ? 1 : 0,
          transition: "opacity 0.25s ease",
          willChange: "transform",
        }}
      >
        <motion.div
          key={activeProject?.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="relative w-full h-full"
        >
          {activeProject && (
            <>
              <Image
                src={activeProject.cover}
                alt=""
                fill
                sizes="280px"
                className="object-cover"
                style={{ filter: "grayscale(0.2) contrast(1.1) brightness(0.85)" }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 60%)" }} />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="fac text-white/50" style={{ fontSize: "0.4rem" }}>{activeProject.category}</p>
                <p className="dis text-white mt-1" style={{ fontSize: "clamp(0.9rem, 2vw, 1.3rem)", lineHeight: 1 }}>
                  {activeProject.title}
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
