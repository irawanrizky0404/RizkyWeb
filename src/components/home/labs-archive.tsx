"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

const ParticleStorm = dynamic(
  () => import("@/components/three/particle-storm").then((mod) => mod.ParticleStorm),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#080808]" /> }
);

interface Lab {
  id: string;
  title: string;
  description: string;
  type: string;
  year: string;
  image: string;
  link: string;
  tags: string[];
  isThree?: boolean;
}

const EXPERIMENTS: Lab[] = [
  {
    id: "particle-storm",
    title: "Particle Storm",
    description: "Three.js particle system with custom shaders. Floating particles in dark space with additive blending and subtle color variations.",
    type: "Three.js",
    year: "2025",
    image: "/images/works/phantom-in-the-ruins/01.jpg",
    link: "#particle-storm",
    tags: ["WebGL", "GLSL", "Particles"],
    isThree: true,
  },
  {
    id: "generative-01",
    title: "Grain Studies",
    description: "Explorations of film grain textures and noise patterns",
    type: "Generative",
    year: "2025",
    image: "/images/works/phantom-in-the-ruins/02.jpg",
    link: "#",
    tags: ["Canvas", "Noise"],
  },
  {
    id: "shader-01",
    title: "Light Leaks",
    description: "Organic light bleed effects inspired by analog photography",
    type: "Shader",
    year: "2025",
    image: "/images/works/phantom-in-the-ruins/03.jpg",
    link: "#",
    tags: ["GLSL", "WebGL"],
  },
  {
    id: "motion-01",
    title: "Type Motion",
    description: "Kinetic typography and animated text experiments",
    type: "Motion",
    year: "2024",
    image: "/images/works/phantom-in-the-ruins/04.jpg",
    link: "#",
    tags: ["After Effects"],
  },
];

export function LabsArchive() {
  const [activeLab, setActiveLab] = useState<string | null>(null);

  if (EXPERIMENTS.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <p className="dis text-white/10" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>
          NO EXPERIMENTS YET
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#080808]">
      {EXPERIMENTS.map((experiment, i) => (
        <section
          key={experiment.id}
          id={experiment.id}
          className="relative border-t border-white/[0.03]"
        >
          {/* Three.js Experiment */}
          {experiment.isThree && (
            <div 
              className="w-full bg-black relative"
              style={{ height: "70vh", minHeight: "400px" }}
            >
              <ParticleStorm />
              
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
                  style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9, letterSpacing: "-0.02em", fontWeight: 400 }}
                >
                  {experiment.title}
                </h2>
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
            </div>
          )}

          {/* Image-based Experiments */}
          {!experiment.isThree && (
            <motion.a
              href={experiment.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className={`flex flex-col md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''} relative`}>
                {/* IMAGE */}
                <div className="relative w-full md:w-3/5 aspect-[16/10] md:aspect-[21/9] overflow-hidden bg-black">
                  {/* Frame lines - signal accent */}
                  <div className="absolute inset-0 border border-signal/30 z-20 pointer-events-none" />
                  <div className="absolute inset-4 border border-white/10 z-20 pointer-events-none hidden md:block" />
                  
                  <Image
                    src={experiment.image}
                    alt={experiment.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
                    style={{
                      filter: "grayscale(1) contrast(1.1) brightness(1.1)",
                    }}
                  />
                  
                  {/* Frame counter */}
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                    <span className="dis text-white/40" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="w-6 h-[1px] bg-white/30" />
                    <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>
                      LAB
                    </span>
                  </div>
                </div>

                {/* INFO */}
                <div className="relative w-full md:w-2/5 flex flex-col justify-center px-10 py-16 md:px-16 md:py-0">
                  {/* Large faded number */}
                  <span 
                    className="absolute top-1/2 -translate-y-1/2 right-8 text-white/[0.03] dis select-none pointer-events-none hidden md:block" 
                    style={{ fontSize: "clamp(10rem, 30vw, 24rem)", lineHeight: 1, fontWeight: 400 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="relative z-10 max-w-md">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-10 h-[2px] bg-signal" />
                      <span className="lab text-white/50" style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}>
                        {experiment.type}
                      </span>
                    </div>
                    
                    <h2 
                      className="dis text-white" 
                      style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.9, letterSpacing: "-0.02em", fontWeight: 400 }}
                    >
                      {experiment.title}
                    </h2>

                    <p className="lab text-white/30 mt-4" style={{ fontSize: "0.7rem", lineHeight: 1.6 }}>
                      {experiment.description}
                    </p>

                    <div className="flex items-center gap-6 mt-6">
                      <span className="dis text-white/40" style={{ fontSize: "clamp(1rem, 3vw, 2rem)", fontWeight: 300 }}>
                        {experiment.year}
                      </span>
                      <span className="w-12 h-[1px] bg-white/20" />
                      <div className="flex items-center gap-3">
                        {experiment.tags.slice(0, 2).map((tag, ti) => (
                          <span key={ti} className="lab text-white/25" style={{ fontSize: "0.55rem", letterSpacing: "0.1em" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-10 flex items-center gap-4">
                      <span className="lab text-white/40" style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}>
                        VIEW EXPERIMENT
                      </span>
                      <span className="text-lg text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-500">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.a>
          )}
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
