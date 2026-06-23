"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollSkew({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const lastY = useRef(0);
  const skew = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const tick = () => {
      const currentY = window.scrollY;
      const velocity = currentY - lastY.current;
      lastY.current = currentY;

      skew.current += (velocity * 0.045 - skew.current) * 0.12;
      const clamped = Math.max(-4, Math.min(4, skew.current));

      if (ref.current) {
        ref.current.style.transform = `skewY(${clamped}deg)`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [pathname]);

  return (
    <div ref={ref} style={{ transformOrigin: "left center", willChange: "transform" }}>
      {children}
    </div>
  );
}
