"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navLinks, siteConfig } from "@/lib/data";
import { useDesign } from "@/lib/design-context";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/ui/magnetic";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—";

function useScramble(text: string) {
  const [display, setDisplay] = useState(text);
  const rafId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scramble = useCallback(() => {
    let iteration = 0;
    const run = () => {
      setDisplay(
        text.split("").map((char, i) => {
          if (char === " ") return " ";
          if (i < iteration) return text[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      iteration += 0.6;
      if (iteration < text.length + 1) {
        rafId.current = setTimeout(run, 28);
      } else {
        setDisplay(text);
      }
    };
    if (rafId.current) clearTimeout(rafId.current);
    iteration = 0;
    run();
  }, [text]);

  const reset = useCallback(() => {
    if (rafId.current) clearTimeout(rafId.current);
    setDisplay(text);
  }, [text]);

  return { display, scramble, reset };
}

const navItems = navLinks.filter((l) => l.href !== "/");

function ScrambleLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const { display, scramble, reset } = useScramble(label);
  return (
    <Link
      href={href}
      onMouseEnter={scramble}
      onMouseLeave={reset}
      className={cn(
        "lab transition-colors",
        active ? "text-signal" : "text-white/35 hover:text-white"
      )}
    >
      {display}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const design = useDesign();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const siteName = design?.site?.name || siteConfig.name || "Rizky Irawan";
  const email = design?.site?.email || siteConfig.email;
  const socials = [
    { label: "Instagram", href: design?.social?.instagram || siteConfig.social.instagram },
    { label: "Behance", href: design?.social?.behance || siteConfig.social.behance },
    { label: "LinkedIn", href: design?.social?.linkedin || siteConfig.social.linkedin },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(deltaX) > 80 && deltaY < 60) {
      if (deltaX > 0) setOpen(false);
    }
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black/95 backdrop-blur-sm border-b border-rule"
            : "bg-transparent"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">

          <Magnetic strength={0.3}>
            <Link href="/" className="group">
              <span
                className="lab text-white transition-colors group-hover:text-signal"
                style={{ letterSpacing: "0.15em", fontSize: "0.85rem" }}
              >
                {siteName}
              </span>
            </Link>
          </Magnetic>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((link) => (
              <ScrambleLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href || pathname.startsWith(link.href + "/")}
              />
            ))}
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="lab text-white/40 hover:text-white transition-colors md:hidden"
            aria-label="Open menu"
            style={{ fontSize: "0.85rem" }}
          >
            Menu
          </button>
        </div>

        {/* Signal underline only when scrolled */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-signal/20" />
        )}
      </header>

      {/* Mobile fullscreen overlay - cinematic */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col bg-black"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Scanlines overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
              }}
            />

            {/* Vignette */}
            <div
              className="pointer-events-none absolute inset-0 z-[11]"
              style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, color-mix(in srgb, var(--black) 70%, transparent) 100%)" }}
            />

            {/* Orange accent line top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-signal z-20" />

            {/* Header */}
            <div className="relative z-20 flex items-center justify-between px-5 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] border-b border-white/5">
              <span className="lab text-signal" style={{ letterSpacing: "0.2em", fontSize: "0.65rem" }}>
                FAC.001
              </span>
              <button
                onClick={() => setOpen(false)}
                className="lab text-white/60 hover:text-signal transition-colors tracking-widest"
                aria-label="Close menu"
                style={{ fontSize: "0.7rem" }}
              >
                CLOSE ×
              </button>
            </div>

            {/* Nav Links */}
            <nav className="relative z-20 flex-1 flex flex-col justify-center px-5 py-6">
              {/* Decorative side line */}
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-signal/30 to-transparent" />

              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-6 py-5 border-b border-white/5 hover:border-signal/20 transition-colors"
                  >
                    <span
                      className="lab text-signal/40 group-hover:text-signal transition-colors"
                      style={{ fontSize: "0.5rem", letterSpacing: "0.1em" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "dis tracking-wide transition-colors",
                        pathname === link.href
                          ? "text-signal"
                          : "text-white/90 group-hover:text-signal"
                      )}
                      style={{ fontSize: "clamp(2rem, 9vw, 4rem)", lineHeight: 1 }}
                    >
                      {link.label}
                    </span>
                    <span className="ml-auto text-signal/0 group-hover:text-signal/30 transition-colors" style={{ fontSize: "1.5rem" }}>→</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Footer */}
            <div className="relative z-20 border-t border-white/5 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <a
                href={`mailto:${email}`}
                className="lab text-white/40 hover:text-signal transition-colors block mb-3"
                style={{ fontSize: "0.6rem" }}
              >
                {email}
              </a>
              <div className="flex items-center gap-5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lab text-white/30 hover:text-signal transition-colors"
                    style={{ fontSize: "0.55rem" }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal/50 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
