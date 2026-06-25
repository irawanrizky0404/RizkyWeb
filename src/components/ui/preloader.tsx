"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Only show preloader on first session visit
    if (sessionStorage.getItem("fac_preloader_seen")) {
      setLoading(false);
      return;
    }

    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          sessionStorage.setItem("fac_preloader_seen", "true");
        }, 600);
      }
      setProgress(p);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-black text-white p-5 md:p-8"
        >
          <div className="flex justify-between items-start relative z-20">
            <span className="lab text-signal">FAC.SYSTEM_INIT</span>
            <span className="lab text-white/50">v4.0.0</span>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 relative z-20">
            <div className="overflow-hidden mb-4">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[12vw] leading-none dis"
              >
                {progress}%
              </motion.div>
            </div>
            
            <div className="w-full max-w-md h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-signal"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          <div className="flex justify-between items-end relative z-20">
            <span className="lab text-white/50 uppercase">LOADING VISUAL ARCHIVE...</span>
            <span className="lab text-white/50 uppercase text-right max-w-[200px]">ESTABLISHING SECURE CONNECTION</span>
          </div>

          {/* Noise / Scanlines Overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
