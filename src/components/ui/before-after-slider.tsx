"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  before: { src: string; alt: string; label: string };
  after: { src: string; alt: string; label: string };
}

export function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => handleMove(e.clientX),
    [handleMove]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handleMove(e.touches[0].clientX),
    [handleMove]
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-ew-resize select-none"
      style={{ aspectRatio: "16/9", maxHeight: "70vh" }}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* After (background) */}
      <div className="absolute inset-0">
        <Image src={after.src} alt={after.alt} fill className="object-cover" sizes="50vw" />
      </div>

      {/* Before (foreground, clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <Image src={before.src} alt={before.alt} fill className="object-cover" sizes="50vw" />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_8px_rgba(255,53,0,0.5)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <span className="text-black text-xs">⟷</span>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 lab text-black bg-white/80 px-2 py-1" style={{ fontSize: "0.55rem" }}>
        {before.label}
      </span>
      <span className="absolute bottom-3 right-3 lab text-black bg-white/80 px-2 py-1" style={{ fontSize: "0.55rem" }}>
        {after.label}
      </span>
    </div>
  );
}
