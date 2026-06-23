"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface ParallaxHeroProps {
  src: string;
  alt: string;
}

export function ParallaxHero({ src, alt }: ParallaxHeroProps) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    function tick() {
      if (imgRef.current) {
        const y = window.scrollY * 0.38;
        imgRef.current.style.transform = `translateY(${y}px)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={imgRef}
      className="absolute inset-0"
      style={{ willChange: "transform", top: "-15%", bottom: "-15%", height: "130%" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{
          filter: "grayscale(1) contrast(1.2) brightness(0.55)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
