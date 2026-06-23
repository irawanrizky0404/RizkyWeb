"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/lib/category-colors";

interface WorkGridProps {
  projects: Project[];
  compact?: boolean;
}

export function WorkGrid({ projects, compact = false }: WorkGridProps) {
  return (
    <div className={cn("flex flex-col", compact ? "gap-12 md:gap-16" : "gap-16 md:gap-24")}>
      {projects.map((project, i) => (
        <WorkRow
          key={project.slug}
          project={project}
          index={i}
          compact={compact}
        />
      ))}
    </div>
  );
}

function WorkRow({
  project,
  index,
  compact,
}: {
  project: Project;
  index: number;
  compact: boolean;
}) {
  const reversed = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      <Link
        href={`/works/${project.slug}`}
        className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center md:gap-12"
      >
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-muted aspect-[16/10]",
            compact && "md:aspect-[16/10]",
            !compact && "md:aspect-[16/9]",
            reversed ? "md:order-2 md:col-span-7" : "md:col-span-7"
          )}
        >
          <Image
            src={project.cover}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-background/5 transition-opacity duration-500 group-hover:bg-transparent" />
        </div>

        {/* Text */}
        <div
          className={cn(
            "md:col-span-5",
            reversed && "md:order-1 md:text-right md:items-end md:flex md:flex-col"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              reversed && "md:flex-row-reverse"
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0",
                categoryColors[project.category] ?? "bg-bone"
              )}
            />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-sodium">
              {project.category}
            </span>
          </div>

          <h3
            className={cn(
              "mt-4 font-display font-bold leading-[0.85] tracking-tighter transition-colors duration-300 group-hover:text-sodium",
              compact ? "text-3xl md:text-5xl" : "text-3xl md:text-6xl"
            )}
          >
            {project.title}
          </h3>

          {!compact && (
            <p className="mt-5 max-w-sm font-serif text-base italic leading-relaxed text-bone md:text-lg md:max-w-md">
              {project.summary}
            </p>
          )}

          <div
            className={cn(
              "mt-6 flex items-center gap-4 font-mono text-xs text-muted-foreground",
              reversed && "md:flex-row-reverse"
            )}
          >
            <span>{project.year}</span>
            <span className="h-px w-6 bg-border" />
            <span className="transition-colors group-hover:text-sodium">
              View project →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
