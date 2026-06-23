"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}

// Single element blur-in
export function Reveal({ children, delay = 0, className, duration = 0.6 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left";
}

// Single line/word blur-in reveal
export function RevealText({ children, className, delay = 0, direction = "up" }: RevealTextProps) {
  return (
    <div style={{ overflow: "hidden" }}>
      <motion.div
        initial={{ opacity: 0, y: direction === "up" ? 24 : 0, x: direction === "left" ? -16 : 0, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-4%" }}
        transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface RevealGroupProps {
  children: ReactNode[];
  className?: string;
  stagger?: number;
  delay?: number;
}

// Staggered group — each direct child animates in sequence with blur
export function RevealGroup({ children, className, stagger = 0.08, delay = 0 }: RevealGroupProps) {
  return (
    <div className={className}>
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-4%" }}
          transition={{ duration: 0.55, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
