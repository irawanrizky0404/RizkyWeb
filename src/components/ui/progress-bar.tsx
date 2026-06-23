"use client";

import { useEffect, useState } from "react";

export function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const onScroll = () => {
      setIsScrolling(true);
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? scrolled / total : 0);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "3px",
          width: `${progress * 100}%`,
          background: "#ff3500",
          zIndex: 99997,
          willChange: "width",
          pointerEvents: "none",
          transition: "opacity 0.3s",
          opacity: isScrolling ? 1 : 0.6,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "2px",
          height: "100vh",
          zIndex: 99996,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: `${progress * 100}%`,
            background: "rgba(255,53,0,0.15)",
            transition: "height 0.1s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: `${progress * 100}%`,
            right: 0,
            width: "8px",
            height: "8px",
            background: "#ff3500",
            borderRadius: "50%",
            transform: "translate(50%, -50%)",
            boxShadow: "0 0 12px rgba(255,53,0,0.6)",
            transition: "opacity 0.3s",
            opacity: isScrolling ? 1 : 0.6,
          }}
        />
      </div>
    </>
  );
}
