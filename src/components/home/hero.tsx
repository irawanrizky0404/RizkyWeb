"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { MaskReveal } from "@/components/ui/mask-reveal";

export function Hero() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrollProgress(Math.min(window.scrollY / window.innerHeight, 1));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  }, []);
  const onLeave = useCallback(() => setMouse({ x: 0, y: 0 }), []);

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-black select-none"
    >
      {/* LETTERBOX BARS */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black h-6 md:h-16" />
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-black h-6 md:h-16" />

      {/* ── IMAGE ──────────────────────────────────────────────────── */}
      <div
        className="absolute inset-[-4%]"
        style={{
          transform: `translate(${mouse.x * -12}px, ${mouse.y * -12}px)`,
          transition: "transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      >
        <Image
          src="/images/works/phantom-in-the-ruins/01.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          style={{
            objectPosition: "50% 36%",
            filter: `grayscale(1) contrast(${1.2 + scrollProgress * 0.3}) brightness(${0.62 - scrollProgress * 0.3}) blur(${scrollProgress * 6}px)`,
            mixBlendMode: "screen",
            transform: `scale(${1 + scrollProgress * 0.06})`,
          }}
          sizes="100vw"
        />
      </div>

      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 z-[1]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />

      {/* Noise - stronger film grain */}
      <div className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          opacity: 0.08,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }} />

      {/* Vignette - darker cinematic */}
      <div className="pointer-events-none absolute inset-0 z-[2]"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 20%, rgba(0,0,0,0.7) 70%, #000 100%)" }} />

      {/* Top burn */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-36 bg-gradient-to-b from-black via-black/60 to-transparent" />

      {/* Bottom burn */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-48 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* ── TOP LEFT: catalogue ────────────────────────────────────── */}
      <div className="absolute left-5 top-0 z-10 flex flex-col pt-[4.5rem] md:left-12 md:pt-20">
        <span className="lab text-signal" style={{ fontSize: "0.58rem" }}>FAC.001</span>
        <div className="my-[4px] h-px w-5 bg-signal/40" />
        <span className="lab text-white/55" style={{ fontSize: "0.58rem" }}>Indonesia · Est. 2017</span>
        <span className="desk-only lab text-white/25" style={{ fontSize: "0.56rem" }}>Multidisciplinary Visual Artist</span>
      </div>

      {/* ── TOP RIGHT: status — mobile only ───────────────────────── */}
      <div className="mob-only absolute right-5 top-0 z-10 flex flex-col items-end pt-[4.5rem]">
        <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>Available</span>
        <div className="mt-[4px] h-px w-6 bg-signal/30" />
        <span className="lab text-white/30 mt-[4px]" style={{ fontSize: "0.52rem" }}>For Work</span>
      </div>

      {/* ── TOP RIGHT: disciplines — desktop only ──────────────────── */}
      <div className="desk-only absolute right-5 top-0 z-10 flex flex-col items-end pt-20 md:right-12">
        {["3D Visualisation", "Motion Design", "Illustration", "Graphic Design"].map((d) => (
          <span key={d} className="lab text-white/22 leading-[2]" style={{ fontSize: "0.56rem" }}>{d}</span>
        ))}
        <div className="my-2 h-px w-5 bg-white/10 self-end" />
        <span className="lab text-signal/55" style={{ fontSize: "0.56rem" }}>Available for work</span>
      </div>


      {/* ── MID LEFT: vertical label — desktop only ────────────────── */}
      <div className="desk-only absolute left-3 top-1/2 z-10 -translate-y-1/2 overflow-hidden">
        <span className="lab vert text-white/18" style={{ fontSize: "0.46rem", letterSpacing: "0.26em" }}>
          Multidisciplinary Visual Artist · Visual Series · 2017–2026
        </span>
      </div>

      {/* ── CENTER: catalogue card — mobile only ──────────────────── */}
      <div className="mob-only absolute inset-x-5 top-1/2 z-10 -translate-y-1/2">
        {/* Top rule */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-4 bg-signal/60 shrink-0" />
          <span className="lab text-white/30" style={{ fontSize: "0.48rem", letterSpacing: "0.2em" }}>Visual Series</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Series title */}
        <p className="dis text-white/50" style={{ fontSize: "clamp(0.9rem, 5vw, 1.4rem)", lineHeight: 0.9, letterSpacing: "0.04em" }}>
          Phantom<br />in the Ruins
        </p>

        {/* Data row */}
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2">
          <span className="lab text-white/22" style={{ fontSize: "0.46rem" }}>Personal Series</span>
          <span className="lab text-white/22" style={{ fontSize: "0.46rem" }}>2024</span>
        </div>
      </div>

      {/* ── BOTTOM: name block ─────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-6 md:px-12 md:pb-10">

        {/* Rule + label above name — desktop only */}
        <div className="desk-only mb-2 flex items-center gap-3">
          <div className="h-px w-5 shrink-0 bg-signal/50" />
          <span className="lab text-white/20" style={{ fontSize: "0.52rem" }}>Visual Artist · Portfolio 2025</span>
          <div className="h-px flex-1 bg-white/[0.04]" />
        </div>

        {/* Name row */}
        <div className="flex items-end justify-between gap-4">
          <h1 className="leading-none min-w-0">
            <MaskReveal delay={0.1}>
              <span
                className="dis text-white"
                style={{ fontSize: "clamp(2.8rem, 14vw, 20rem)", lineHeight: 0.82 }}
              >
                Rizky
              </span>
            </MaskReveal>
            <MaskReveal delay={0.22}>
              <span
                className="dis text-signal"
                style={{ fontSize: "clamp(2.8rem, 14vw, 20rem)", lineHeight: 0.82 }}
              >
                Irawan
              </span>
            </MaskReveal>
          </h1>

          {/* Right meta — desktop only */}
          <div className="desk-only shrink-0 flex flex-col items-end gap-[5px] pb-[3px]">
            <span className="lab text-white/28" style={{ fontSize: "0.56rem" }}>Phantom in the Ruins</span>
            <span className="lab text-white/16" style={{ fontSize: "0.54rem" }}>Personal Series · 2024</span>
            <div className="my-2 h-px w-7 bg-signal/40" />
            <span className="lab text-signal" style={{ fontSize: "0.58rem" }}>↓ Scroll</span>
          </div>

          {/* Right meta — mobile only */}
          <div className="mob-only shrink-0 flex flex-col items-end gap-[4px] pb-[2px]">
            <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>3D · Motion</span>
            <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>Illustration</span>
            <div className="mt-1 h-px w-5 bg-signal/40" />
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 md:mt-4 md:pt-3">
          <span className="lab text-white/45" style={{ fontSize: "0.6rem" }}>Multidisciplinary Visual Artist</span>
          <span className="lab text-white/30 flex items-center gap-2" style={{ fontSize: "0.6rem" }}>
            <span
              className="inline-block h-[6px] w-[6px] rounded-full bg-signal"
              style={{ animation: "pulse-dot 1.6s ease-in-out infinite" }}
            />
            Scroll
          </span>
        </div>
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.6); }
          }
        `}</style>
      </div>
    </section>
  );
}
