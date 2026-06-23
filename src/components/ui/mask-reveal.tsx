"use client";

import { useEffect, useRef, useState } from "react";

interface MaskRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  duration?: number;
}

export function MaskReveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  duration = 0.9,
}: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <Tag
        className={className}
        style={{
          transform: visible ? "scale(1)" : "scale(0.96)",
          opacity: visible ? 1 : 0,
          filter: visible ? "blur(0px)" : "blur(12px)",
          transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity ${duration * 0.8}s ease ${delay}s, filter ${duration}s ease ${delay}s`,
          willChange: "transform, opacity, filter",
          display: "block",
        }}
      >
        {children}
      </Tag>
    </div>
  );
}

export function MaskRevealLines({
  text,
  className,
  baseDelay = 0,
  stagger = 0.1,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  stagger?: number;
}) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <MaskReveal key={i} delay={baseDelay + i * stagger}>
          <span className={className}>{line}</span>
        </MaskReveal>
      ))}
    </>
  );
}
