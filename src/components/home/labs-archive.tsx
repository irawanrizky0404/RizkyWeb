"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const ParticleStorm = dynamic(
  () => import("@/components/three/particle-storm").then((mod) => mod.ParticleStorm),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#080808]" /> }
);

const NoiseTerrain = dynamic(
  () => import("@/components/three/noise-terrain").then((mod) => mod.NoiseTerrain),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#080808]" /> }
);

const ShaderPlayground = dynamic(
  () => import("@/components/three/shader-playground").then((mod) => mod.ShaderPlayground),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#080808]" /> }
);

const experiments = [
  {
    id: "particle-storm",
    title: "Particle Storm",
    description: "Dense orange particle field with flowing wave motion and industrial bass drone.",
    type: "Three.js",
    year: "2025",
    component: ParticleStorm,
  },
  {
    id: "noise-terrain",
    title: "Noise Terrain",
    description: "Animated landscape with procedural noise patterns and wireframe overlay.",
    type: "Three.js",
    year: "2025",
    component: NoiseTerrain,
  },
  {
    id: "shader-playground",
    title: "Shader Playground",
    description: "GLSL fragment shader with layered noise, fractal patterns, and mouse interaction.",
    type: "GLSL",
    year: "2025",
    component: ShaderPlayground,
  },
];

export function LabsArchive() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#080808]">
      {experiments.map((experiment, i) => (
        <section key={experiment.id} id={experiment.id} className="relative border-t border-white/[0.03]">
          {/* Three.js Canvas */}
          <div 
            className="w-full bg-black relative"
            style={{ height: "80vh", minHeight: "500px" }}
          >
            <experiment.component />
            
            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-[2px] bg-signal" />
                <span className="lab text-white/50" style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}>
                  {experiment.type}
                </span>
              </div>
              <h2 
                className="dis text-white" 
                style={{ fontSize: "clamp(2rem, 6vw, 5rem)", lineHeight: 0.9, letterSpacing: "-0.02em", fontWeight: 400 }}
              >
                {experiment.title}
              </h2>
              <p className="lab text-white/40 mt-4 max-w-xl" style={{ fontSize: "0.7rem", lineHeight: 1.6 }}>
                {experiment.description}
              </p>
            </div>

            {/* Frame counter */}
            <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
              <span className="dis text-white/30" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="w-6 h-[1px] bg-white/20" />
              <span className="lab text-white/25" style={{ fontSize: "0.5rem" }}>
                LAB
              </span>
            </div>

            {/* Signal line accent */}
            <div className="absolute top-0 left-0 w-px h-20 bg-gradient-to-b from-signal to-transparent" />
          </div>
        </section>
      ))}

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
