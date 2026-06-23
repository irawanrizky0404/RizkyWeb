"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";

interface FeaturedWorkProps {
  featured: Project;
  roster: Project[];
}

export function FeaturedWork({ featured, roster }: FeaturedWorkProps) {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      <FeaturedProject project={featured} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
        {roster.map((p, i) => (
          <RosterItem key={p.slug} project={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function FeaturedProject({ project }: { project: Project }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/works/${project.slug}`} className="group block">
        <figure className="relative aspect-[3/2] overflow-hidden bg-surface md:aspect-[2/1]">
          <Image
            src={project.cover}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover opacity-85 grayscale transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-background/15 transition-opacity duration-500 group-hover:opacity-0" />

          <div className="absolute left-4 top-4 flex items-center gap-2 md:left-6 md:top-6">
            <span className="postered bg-foreground px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-background">
              01 · Feature
            </span>
            <span className="border border-border bg-background/70 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-foreground backdrop-blur-sm">
              {project.category}
            </span>
          </div>
        </figure>

        <div className="mt-5 grid grid-cols-12 items-end gap-3 md:mt-7 md:gap-6">
          <div className="col-span-9 md:col-span-8">
            <h3 className="display text-[clamp(1.75rem,6vw,4.5rem)] text-foreground transition-colors duration-300 group-hover:text-accent">
              {project.title}
            </h3>
            <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              {project.summary}
            </p>
          </div>
          <div className="col-span-3 flex flex-col items-end gap-2 font-mono text-xs text-muted-foreground md:col-span-4">
            <span>{project.year}</span>
            <span className="display text-xl text-accent transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function RosterItem({ project, index }: { project: Project; index: number }) {
  const n = String(index + 2).padStart(2, "0");
  return (
    <motion.article
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/works/${project.slug}`} className="group block">
        <figure className="relative aspect-[4/3] overflow-hidden bg-surface sm:aspect-[4/5]">
          <Image
            src={project.cover}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 26vw"
            className="object-cover opacity-75 grayscale transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:opacity-100 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-background/15 transition-opacity duration-500 group-hover:opacity-0" />
          <span className="absolute left-3 top-3 bg-foreground px-2 py-1 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-background">
            {n}
          </span>
        </figure>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3 className="display text-[clamp(1.25rem,2.8vw,1.875rem)] leading-[0.95] text-foreground transition-colors duration-300 group-hover:text-accent">
            {project.title}
          </h3>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {project.year}
          </span>
        </div>
        <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">
          {project.category}
        </p>
      </Link>
    </motion.article>
  );
}