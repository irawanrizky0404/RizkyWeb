"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";

const ParticleStorm = dynamic(
  () => import("@/components/three/particle-storm").then((mod) => mod.ParticleStorm),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#080808]" /> }
);

export function LabsArchive() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#080808]">
      {/* Three.js Experiment */}
      <section className="relative border-t border-white/[0.03]">
        {/* Three.js Canvas */}
        <div 
          className="w-full bg-black relative"
          style={{ height: "80vh", minHeight: "500px" }}
        >
          <ParticleStorm />
          
          {/* Overlay info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[2px] bg-signal" />
              <span className="lab text-white/50" style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}>
                THREE.JS
              </span>
            </div>
            <h2 
              className="dis text-white" 
              style={{ fontSize: "clamp(2rem, 6vw, 5rem)", lineHeight: 0.9, letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              Particle Storm
            </h2>
          </div>

          {/* Frame counter */}
          <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
            <span className="dis text-white/30" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
              01
            </span>
            <span className="w-6 h-[1px] bg-white/20" />
            <span className="lab text-white/25" style={{ fontSize: "0.5rem" }}>
              LAB
            </span>
          </div>

          {/* Signal line accent */}
          <div className="absolute top-0 left-0 w-px h-20 bg-gradient-to-b from-signal to-transparent" />
        </div>

        {/* Description */}
        <div className="relative w-full px-8 py-12 md:px-12 md:py-16 bg-[#080808]">
          <div className="max-w-2xl">
            <p className="lab text-white/40 mb-6" style={{ fontSize: "0.7rem", lineHeight: 1.8 }}>
              Three.js particle system with custom GLSL shaders. Waveform patterns emerge from a grid of particles, 
              creating an audio-reactive visualization aesthetic.
            </p>
            <div className="flex items-center gap-4">
              <span className="lab text-white/30" style={{ fontSize: "0.55rem", letterSpacing: "0.15em" }}>
                WebGL
              </span>
              <span className="w-6 h-[1px] bg-white/10" />
              <span className="lab text-white/30" style={{ fontSize: "0.55rem", letterSpacing: "0.15em" }}>
                GLSL
              </span>
              <span className="w-6 h-[1px] bg-white/10" />
              <span className="lab text-white/30" style={{ fontSize: "0.55rem", letterSpacing: "0.15em" }}>
                2025
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Coming soon section */}
      <section className="relative border-t border-white/[0.03] px-8 py-24 md:px-12 md:py-32">
        <div className="text-center max-w-xl mx-auto">
          <span className="dis text-white/5" style={{ fontSize: "clamp(3rem, 10vw, 8rem)", lineHeight: 1 }}>
            MORE
          </span>
          <p className="lab text-white/20 mt-6" style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}>
            MORE EXPERIMENTS COMING SOON
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <div className="relative z-10 h-32 border-t border-white/[0.03] flex items-center justify-between px-10 md:px-16">
        <span className="lab text-white/10" style={{ fontSize: "0.5rem", letterSpacing: "0.2em" }}>
          EXPERIMENTAL ARCHIVE — RIZKY IRAWAN
        </span>
        <Link href="/works" className="lab text-white/20 hover:text-white/50 transition-colors" style={{ fontSize: "0.5rem", letterSpacing: "0.15em" }}>
          WORKS →
        </Link>
      </div>
    </div>
  );
}
