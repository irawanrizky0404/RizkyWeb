"use client";

import { useRef } from "react";

interface MarqueeProps {
  items?: string[];
  speed?: number;
  className?: string;
  children?: React.ReactNode;
}

export function Marquee({ items = [], speed = 30, className = "", children }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const content = children
    ? [children, children, children]
    : items.map((item, i) => (
        <span
          key={i}
          className="dis inline-flex items-center text-black"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.8rem)", padding: "0 2rem" }}
        >
          {item}
          <span className="mx-4 text-black/30" aria-hidden>·</span>
        </span>
      ));

  return (
    <div className={`relative overflow-hidden bg-signal ${className}`}>
      <div
        ref={trackRef}
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${speed}s linear infinite`,
        }}
      >
        {content}
      </div>
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
