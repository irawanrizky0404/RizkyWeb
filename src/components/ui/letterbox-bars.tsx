"use client";

import { motion, AnimatePresence } from "motion/react";

interface LetterboxBarsProps {
  active?: boolean;
  ratio?: "2.39:1" | "2.35:1" | "1.85:1" | "16:9";
  duration?: number;
}

const RATIO_MAP = {
  "2.39:1": 0.418,
  "2.35:1": 0.426,
  "1.85:1": 0.54,
  "16:9": 0.5625,
};

export function LetterboxBars({
  active = true,
  ratio = "2.39:1",
  duration = 0.6,
}: LetterboxBarsProps) {
  const barHeight = RATIO_MAP[ratio];

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Top bar */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${barHeight * 100}%` }}
            exit={{ height: 0 }}
            transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: "#000",
              zIndex: 9998,
              pointerEvents: "none",
            }}
          />
          {/* Bottom bar */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${barHeight * 100}%` }}
            exit={{ height: 0 }}
            transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#000",
              zIndex: 9998,
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

export function CinematicLetterbox({
  children,
  ratio = "2.39:1",
  className = "",
}: {
  children: React.ReactNode;
  ratio?: "2.39:1" | "2.35:1" | "1.85:1" | "16:9";
  className?: string;
}) {
  const barHeight = RATIO_MAP[ratio];

  return (
    <div
      className={className}
      style={{
        position: "relative",
        paddingTop: `${barHeight * 100}%`,
        paddingBottom: `${barHeight * 100}%`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
