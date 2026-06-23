"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function Cursor() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse   = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const rafId   = useRef<number>(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let isVisible = false;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) {
        isVisible = true;
        setVisible(true);
      }
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovered(!!el.closest("a, button, [role='button'], label, input, textarea, select"));
    };

    const tick = () => {
      const { x: mx, y: my } = mouse.current;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
      }

      ringPos.current.x += (mx - ringPos.current.x) * 0.1;
      ringPos.current.y += (my - ringPos.current.y) * 0.1;
      const size = hovered ? 44 : 22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;
        ringRef.current.style.width  = `${size}px`;
        ringRef.current.style.height = `${size}px`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(rafId.current);
    };
  }, [hovered]);

  if (pathname.startsWith("/admin") || !visible) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 h-[6px] w-[6px] rounded-full bg-signal"
        style={{ willChange: "transform", zIndex: 9999999 }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 rounded-full"
        style={{
          border: "2px solid #ff3500",
          willChange: "transform, width, height",
          transition: "width 0.2s ease, height 0.2s ease",
          zIndex: 9999998,
        }}
      />
    </>
  );
}
