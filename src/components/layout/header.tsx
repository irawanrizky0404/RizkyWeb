"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { navLinks, siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ColorCode } from "@/components/ui/color-code";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-[3px]">
        <ColorCode />
      </div>

      <header className="fixed inset-x-0 top-[3px] z-40">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-5 md:px-10 md:py-6">
          <Link
            href="/"
            className="font-display text-base font-medium tracking-tight"
          >
            {siteConfig.name.split(" ")[0]}
            <span className="text-sodium">.</span>
            <span className="font-serif italic text-muted-foreground">
              {siteConfig.name.split(" ")[1]}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks
              .filter((l) => l.href !== "/")
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-mono text-xs tracking-wide transition-colors duration-300",
                    pathname === link.href
                      ? "text-sodium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
          </nav>

          <button
            onClick={() => setIsOpen(true)}
            className="font-mono text-xs text-foreground md:hidden"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden"
          >
            <div className="h-[3px]">
              <ColorCode />
            </div>
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display text-base font-medium">
                {siteConfig.name}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="font-mono text-xs text-sodium"
              >
                Close
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      "font-display text-5xl font-medium tracking-tighter",
                      pathname === link.href ? "text-sodium" : "text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
