"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

interface FilmBurnProps {
  duration?: number;
}

export function FilmBurn({ duration = 800 }: FilmBurnProps) {
  const pathname = usePathname();
  const [showBurn, setShowBurn] = useState(false);

  useEffect(() => {
    setShowBurn(true);

    const timer = setTimeout(() => {
      setShowBurn(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [pathname, duration]);

  return (
    <AnimatePresence>
      {showBurn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9997,
            pointerEvents: "none",
            background: "#000",
          }}
        >
          {/* Light leak effect - left side */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.3, 0] }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "30%",
              height: "100%",
              background: "linear-gradient(to right, rgba(255,100,50,0.15), transparent)",
              transformOrigin: "left center",
            }}
          />
          {/* Light leak effect - right side */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.25, 0] }}
            transition={{
              duration: duration / 1000,
              delay: 0.05,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "30%",
              height: "100%",
              background: "linear-gradient(to left, rgba(255,150,50,0.12), transparent)",
              transformOrigin: "right center",
            }}
          />
          {/* Film burn line - top */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(to right, transparent, rgba(255,200,100,0.5), transparent)",
              transformOrigin: "top center",
            }}
          />
          {/* Film burn line - bottom */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, opacity: [0, 0.35, 0] }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(to right, transparent, rgba(255,180,80,0.4), transparent)",
              transformOrigin: "bottom center",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LightLeakFlashProps {
  trigger?: boolean;
}

export function LightLeakFlash({ trigger = false }: LightLeakFlashProps) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9991,
            pointerEvents: "none",
            background: "radial-gradient(ellipse at 30% 50%, rgba(255,150,50,0.3), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(255,100,50,0.2), transparent 60%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
