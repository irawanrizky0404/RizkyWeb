"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function Cursor() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const mouse   = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const state   = useRef({ hovered: false, magneticEl: null as HTMLElement | null, text: "" });
  const rafId   = useRef<number>(0);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    
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
      
      const magneticEl = el.closest("[data-magnetic]") as HTMLElement | null;
      state.current.magneticEl = magneticEl;
      
      const textEl = el.closest("[data-cursor-text]") as HTMLElement | null;
      state.current.text = textEl ? (textEl.getAttribute("data-cursor-text") || "") : "";

      state.current.hovered = !!el.closest("a, button, [role='button'], label, input, textarea, select");
    };

    const tick = () => {
      const { x: mx, y: my } = mouse.current;
      const { hovered, magneticEl, text } = state.current;

      if (dotRef.current) {
        if (text) {
          dotRef.current.style.transform = `translate(${mx - 32}px, ${my - 32}px)`;
          dotRef.current.style.width = "64px";
          dotRef.current.style.height = "64px";
          dotRef.current.style.mixBlendMode = "normal";
          if (textRef.current) {
            textRef.current.innerText = text;
            textRef.current.style.opacity = "1";
          }
        } else {
          dotRef.current.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
          dotRef.current.style.width = "6px";
          dotRef.current.style.height = "6px";
          dotRef.current.style.mixBlendMode = "difference";
          if (textRef.current) {
            textRef.current.style.opacity = "0";
          }
        }
      }

      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        ringPos.current.x += (rect.left + rect.width / 2 - ringPos.current.x) * 0.2;
        ringPos.current.y += (rect.top + rect.height / 2 - ringPos.current.y) * 0.2;
        
        if (ringRef.current) {
          ringRef.current.style.transform = `translate(${ringPos.current.x - rect.width / 2 - 4}px, ${ringPos.current.y - rect.height / 2 - 4}px)`;
          ringRef.current.style.width  = `${rect.width + 8}px`;
          ringRef.current.style.height = `${rect.height + 8}px`;
          ringRef.current.style.borderRadius = "8px"; 
          ringRef.current.style.opacity = "0.4";
        }
      } else {
        ringPos.current.x += (mx - ringPos.current.x) * 0.15;
        ringPos.current.y += (my - ringPos.current.y) * 0.15;
        
        if (ringRef.current) {
          if (text) {
            ringRef.current.style.opacity = "0";
          } else {
            const size = hovered ? 44 : 22;
            ringRef.current.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;
            ringRef.current.style.width  = `${size}px`;
            ringRef.current.style.height = `${size}px`;
            ringRef.current.style.borderRadius = "50%";
            ringRef.current.style.opacity = "1";
          }
        }
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
  }, [pathname]);

  if (pathname.startsWith("/admin") || !visible) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 rounded-full bg-signal flex items-center justify-center overflow-hidden"
        style={{ 
          willChange: "transform, width, height", 
          zIndex: 9999999,
          transition: "width 0.2s cubic-bezier(0.22, 1, 0.36, 1), height 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
          width: 6, height: 6
        }}
      >
        <span 
          ref={textRef}
          className="text-black font-medium tracking-widest text-[10px] opacity-0 transition-opacity duration-200"
        ></span>
      </div>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0"
        style={{
          border: "2px solid var(--signal)",
          willChange: "transform, width, height, border-radius, opacity",
          transition: "width 0.2s cubic-bezier(0.22, 1, 0.36, 1), height 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.2s ease, opacity 0.2s ease",
          zIndex: 9999998,
        }}
      />
    </>
  );
}
