"use client";

import { useEffect, useRef, memo } from "react";

interface FilmGrainProps {
  opacity?: number;
  animated?: boolean;
  className?: string;
}

function FilmGrainComponent({
  opacity = 0.04,
  animated = true,
  className = "",
}: FilmGrainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let animationId: number;

    const render = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      if (animated) {
        animationId = requestAnimationFrame(render);
      }
    };

    if (animated) {
      render();
    } else {
      render();
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [animated]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
      }}
      aria-hidden="true"
    />
  );
}

export const FilmGrain = memo(FilmGrainComponent);

interface StaticGrainProps {
  opacity?: number;
  className?: string;
}

export function StaticGrain({
  opacity = 0.035,
  className = "",
}: StaticGrainProps) {
  return (
    <div
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        pointerEvents: "none",
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
        animation: "grain-shift 0.5s steps(1) infinite",
      }}
      aria-hidden="true"
    />
  );
}
