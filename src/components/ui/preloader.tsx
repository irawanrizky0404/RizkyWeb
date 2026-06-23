"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1400;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * 100));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, []);

  return (
    <span
      className="dis text-white/20 tabular-nums"
      style={{ fontSize: "clamp(6rem, 20vw, 22rem)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
    >
      {String(count).padStart(3, "0")}
    </span>
  );
}

export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("fac-loaded")) {
      setPhase("done");
      return;
    }

    // Loading → reveal after counter finishes
    const t1 = setTimeout(() => setPhase("reveal"), 1500);
    // Reveal → done (curtain lifts)
    const t2 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("fac-loaded", "1");
    }, 2600);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[99999] flex flex-col bg-black overflow-hidden"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        >
          {/* Signal line at bottom — lifts with curtain */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-signal" />

          {/* Top meta */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-6 md:px-12 md:pt-8">
            <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.001</span>
            <span className="lab text-white/20" style={{ fontSize: "0.52rem" }}>Visual Archive · Indonesia</span>
          </div>

          {/* Center content */}
          <div className="flex flex-1 flex-col items-start justify-end px-5 pb-10 md:px-12 md:pb-14">

            {/* Counter — phase: loading */}
            <AnimatePresence mode="wait">
              {phase === "loading" && (
                <motion.div
                  key="counter"
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Counter />
                </motion.div>
              )}

              {/* Name reveal — phase: reveal */}
              {phase === "reveal" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 1 }}
                  className="overflow-hidden"
                >
                  <motion.h1
                    className="dis text-white"
                    style={{ fontSize: "clamp(3.5rem, 14vw, 18rem)", lineHeight: 0.88 }}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  >
                    Rizky
                  </motion.h1>
                  <div className="overflow-hidden">
                    <motion.h1
                      className="dis text-signal"
                      style={{ fontSize: "clamp(3.5rem, 14vw, 18rem)", lineHeight: 0.88 }}
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    >
                      Irawan
                    </motion.h1>
                  </div>
                  <motion.p
                    className="lab text-white/30 mt-4"
                    style={{ fontSize: "0.6rem" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    Multidisciplinary Visual Artist
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom strip */}
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-5 md:px-12">
            <span className="lab text-white/15" style={{ fontSize: "0.48rem" }}>Est. 2017</span>
            <span className="lab text-white/15" style={{ fontSize: "0.48rem" }}>Loading…</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
