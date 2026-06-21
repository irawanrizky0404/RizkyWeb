"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

const roles = ["3D", "Motion", "Illustration", "Design"];

export function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden px-6 pb-8 pt-24 md:px-10 md:pb-12 md:pt-32">
      <div className="absolute inset-0">
        <Image
          src="/images/hero/hero-silent-recital.jpg"
          alt="The Silent Recital"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
      </div>

      {/* Top */}
      <div className="relative z-10 mx-auto w-full max-w-[1800px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-start justify-between gap-4"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-sodium md:tracking-[0.25em]">
            [ Visual Archive — Vol. 01 ]
          </p>
          <p className="hidden font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground md:block">
            2024 — Present
          </p>
        </motion.div>
      </div>

      {/* Middle */}
      <div className="relative z-10 mx-auto w-full max-w-[1800px] my-auto py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-4"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground md:tracking-[0.25em]">
            I am a
          </span>
          <motion.span
            key={roleIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(1.5rem,4vw,3rem)] font-bold leading-none tracking-tighter text-sodium"
          >
            {roles[roleIndex]}
          </motion.span>
          <span className="font-serif text-[clamp(1.25rem,3.5vw,2.5rem)] italic leading-none text-bone">
            artist
          </span>
        </motion.div>

        <h1 className="mt-3 font-display text-[clamp(2.5rem,13vw,13rem)] font-bold leading-[0.82] tracking-tighter md:mt-4">
          <motion.span
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            Rizky
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="block text-stroke"
          >
            Irawan
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 max-w-md md:mt-10"
        >
          <p className="font-serif text-base italic leading-relaxed text-bone/80 md:text-xl">
            Making the invisible visible — one frame, one shadow, one decision at
            a time.
          </p>
        </motion.div>
      </div>

      {/* Bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="relative z-10 mx-auto w-full max-w-[1800px]"
      >
        <div className="flex flex-col gap-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <span>3D · Motion · Illustration · Design</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <span>Based in Indonesia</span>
            <span className="text-sodium">Available — 2025</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
