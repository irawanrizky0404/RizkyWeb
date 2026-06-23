"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { Project } from "@/lib/types";

interface WorkArchiveProps {
  projects: Project[];
  typeFilter?: "client" | "personal";
}

const FILTERS = ["All", "3D", "Illustration", "Graphic Design", "Animation"] as const;
type Filter = typeof FILTERS[number];

export function WorkArchive({ projects, typeFilter }: WorkArchiveProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filteredProjects = typeFilter ? projects.filter((p) => p.type === typeFilter) : projects;
  const featured = filteredProjects.filter((p) => p.featured);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const rawFilter = searchParams.get("category") ?? "All";
  const filter: Filter = (FILTERS as readonly string[]).includes(rawFilter) ? rawFilter as Filter : "All";
  const [view, setView] = useState<"list" | "grid">("list");

  function setFilter(f: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (f === "All") params.delete("category");
    else params.set("category", f);
    const basePath = typeFilter === "personal" ? "/personal-works" : "/works";
    router.replace(`${basePath}${params.size ? `?${params}` : ""}`, { scroll: false });
  }
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const filtered = filter === "All" ? filteredProjects : filteredProjects.filter((p) => p.category === filter);

  useEffect(() => {
    const tick = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.08;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.08;
      if (previewRef.current) {
        previewRef.current.style.transform =
          `translate(${pos.current.x + 24}px, ${pos.current.y - 140}px)`;
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

  const activeProject = filteredProjects.find((p) => p.slug === activeSlug);

  return (
    <div>
      {/* ── FEATURED ──────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="border-t border-rule">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
            <span className="fac">Featured</span>
            <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{featured.length} selected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link
                  href={`/works/${p.slug}`}
                  className="group relative flex flex-col overflow-hidden border-b border-r border-rule"
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
                        filter: "grayscale(1) contrast(1.15) brightness(0.55)",
                        mixBlendMode: "screen",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="relative z-10 border-t border-rule px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="fac block mb-1" style={{ fontSize: "0.45rem" }}>{p.category} · {p.year}</span>
                        <h3
                          className="dis text-white transition-colors group-hover:text-signal"
                          style={{ fontSize: "clamp(1.1rem, 3vw, 2rem)", lineHeight: 0.9 }}
                        >
                          {p.title}
                        </h3>
                      </div>
                      <span className="lab text-white/20 transition-all group-hover:translate-x-1 group-hover:text-signal shrink-0 mt-1">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── INDEX ──────────────────────────────────────────────────── */}
      <div ref={containerRef} onMouseMove={onMove} className="relative border-t border-rule">

        {/* Header: filter + view toggle */}
        <div className="border-b border-rule px-5 md:px-12">
          <div className="flex items-center justify-between py-3">
            <span className="fac">All Works</span>
            <div className="flex items-center gap-4">
              <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{filtered.length} works</span>
              {/* View toggle */}
              <div className="flex items-center gap-1 border border-rule p-[2px]">
                {(["list", "grid"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="lab px-2 py-1 transition-colors"
                    style={{
                      fontSize: "0.5rem",
                      color: view === v ? "#080808" : "rgba(240,240,238,0.3)",
                      background: view === v ? "#ff3500" : "transparent",
                    }}
                  >
                    {v === "list" ? "≡ List" : "⊞ Grid"}
                  </button>
                ))}
              </div>
            </div>
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
                  color: filter === f ? "#080808" : "rgba(240,240,238,0.3)",
                  background: filter === f ? "#ff3500" : "transparent",
                  border: `1px solid ${filter === f ? "#ff3500" : "rgba(240,240,238,0.1)"}`,
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
            <p className="dis text-white/20" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>No works in this category yet.</p>
          </div>
        )}

        {/* LIST VIEW */}
        {view === "list" && (
          <>
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-2%" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/works/${p.slug}`}
                  onMouseEnter={() => setActiveSlug(p.slug)}
                  onMouseLeave={() => setActiveSlug(null)}
                  className="group flex items-center gap-4 border-b border-rule px-5 py-4 transition-colors hover:bg-white/[0.03] md:gap-8 md:px-12 md:py-5"
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
                  <span className="lab w-7 shrink-0 text-white/35 transition-colors group-hover:text-signal hidden md:block" style={{ fontSize: "0.58rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="dis flex-1 text-white group-hover:text-white/80 transition-colors" style={{ fontSize: "clamp(1rem, 4vw, 3.5rem)", lineHeight: 0.9 }}>
                    {p.title}
                  </span>
                  <span className="lab hidden shrink-0 text-white/25 md:block" style={{ fontSize: "0.6rem" }}>
                    {p.category}
                  </span>
                  <span className="lab shrink-0 text-white/30 tabular-nums" style={{ fontSize: "0.6rem" }}>
                    {p.year}
                  </span>
                  <span className="lab shrink-0 text-transparent transition-all duration-150 group-hover:translate-x-1 group-hover:text-signal">→</span>
                </Link>
              </motion.div>
            ))}

            {/* Cursor-following preview — desktop */}
            <div
              ref={previewRef}
              className="pointer-events-none absolute left-0 top-0 z-20 hidden overflow-hidden lg:block"
              style={{
                width: "300px",
                height: "380px",
                opacity: activeSlug ? 1 : 0,
                transition: "opacity 0.2s ease",
                willChange: "transform",
              }}
            >
              <AnimatePresence mode="wait">
                {activeProject && (
                  <motion.div
                    key={activeProject.slug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={activeProject.cover}
                      alt=""
                      fill
                      sizes="300px"
                      className="object-cover"
                      style={{ filter: "grayscale(1) contrast(1.15) brightness(0.6)", mixBlendMode: "screen" }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 55%)" }} />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="fac" style={{ fontSize: "0.42rem" }}>{activeProject.category}</p>
                      <p className="dis text-white mt-1" style={{ fontSize: "clamp(0.9rem, 2vw, 1.4rem)", lineHeight: 0.9 }}>
                        {activeProject.title}
                      </p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="lab text-white/30" style={{ fontSize: "0.4rem" }}>{activeProject.year}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* GRID VIEW */}
        {view === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3) }}
              >
                <Link
                  href={`/works/${p.slug}`}
                  className="group relative block aspect-square overflow-hidden border-b border-r border-rule bg-black"
                >
                  <Image
                    src={p.cover}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="img-distort object-cover"
                    style={{ filter: "grayscale(1) contrast(1.15) brightness(0.55)", mixBlendMode: "screen" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="fac" style={{ fontSize: "0.4rem" }}>{p.category}</p>
                    <p className="dis text-white mt-1" style={{ fontSize: "clamp(0.8rem, 2vw, 1.2rem)", lineHeight: 0.9 }}>{p.title}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
