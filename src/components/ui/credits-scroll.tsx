"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";

interface CreditsScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function CreditsScroll({ children, className = "" }: CreditsScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={containerRef} className={className}>
      <motion.div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4rem",
        }}
      >
        {typeof children === "string"
          ? children.split("\n").map((line, i) => (
              <CreditsLine key={i} scrollYProgress={scrollYProgress} index={i}>
                {line}
              </CreditsLine>
            ))
          : children}
      </motion.div>
    </div>
  );
}

interface CreditsLineProps {
  children: React.ReactNode;
  scrollYProgress: MotionValue<number>;
  index: number;
  totalLines?: number;
}

function CreditsLine({
  children,
  scrollYProgress,
}: CreditsLineProps) {
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.8, 1],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.1, 0.8, 1],
    [60, 0, 0, -60]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.1, 0.8, 1],
    [0.9, 1, 1, 0.9]
  );

  return (
    <motion.div style={{ opacity, y, scale }} className="text-center">
      {children}
    </motion.div>
  );
}

interface RollingCreditsProps {
  items: Array<{
    role: string;
    name: string;
    detail?: string;
  }>;
  title?: string;
  className?: string;
}

export function RollingCredits({ items, title, className = "" }: RollingCreditsProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        style={{
          animation: "roll-credits 30s linear infinite",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingBottom: "2rem",
          }}
        >
          {title && (
            <p
              className="text-center"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(0.6rem, 2vw, 0.8rem)",
                letterSpacing: "0.4em",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {title}
            </p>
          )}
          {items.map((item, i) => (
            <div
              key={i}
              className="text-center"
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1rem, 4vw, 2rem)",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.8)",
                  display: "block",
                }}
              >
                {item.name}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(0.5rem, 1.5vw, 0.65rem)",
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                }}
              >
                {item.role}
                {item.detail && ` · ${item.detail}`}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Fade edges */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6rem",
          background: "linear-gradient(to bottom, var(--bg-color, #000), transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "6rem",
          background: "linear-gradient(to top, var(--bg-color, #000), transparent)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
