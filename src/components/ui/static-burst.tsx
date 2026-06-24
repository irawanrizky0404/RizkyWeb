"use client";

import { useEffect, useState } from "react";

export function StaticBurst() {
  const [phase, setPhase] = useState<"burst" | "fade" | "done">("burst");

  useEffect(() => {
    // Already played this session — skip
    if (sessionStorage.getItem("static-played")) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem("static-played", "1");

    const fadeTimer = setTimeout(() => setPhase("fade"), 380);
    const doneTimer = setTimeout(() => setPhase("done"), 700);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        pointerEvents: "none",
        opacity: phase === "fade" ? 0 : 1,
        transition: phase === "fade" ? "opacity 0.32s ease-out" : "none",
        background: "var(--black)",
      }}
    >
      {/* Noise layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.92,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          mixBlendMode: "screen",
        }}
      />
      {/* Scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.55) 2px, rgba(0,0,0,0.55) 4px)",
        }}
      />
      {/* Signal flicker — tiny FAC stamp */}
      <div style={{
        position: "absolute",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.2em",
        color: "color-mix(in srgb, var(--signal) 60%, transparent)",
        textTransform: "uppercase",
      }}>
        FAC.001 — Initialising
      </div>
    </div>
  );
}
