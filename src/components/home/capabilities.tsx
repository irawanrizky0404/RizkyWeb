"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Service } from "@/lib/types";

interface CapabilitiesProps {
  services: Service[];
}

export function Capabilities({ services }: CapabilitiesProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="border-t border-rule">
      <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-8">
        <span className="fac">FAC.05</span>
        <span className="lab text-white/45">{services.length} fields</span>
      </div>

      {services.map((s, i) => (
        <motion.div
          key={s.category}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-4%" }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="group cursor-pointer border-b border-rule"
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="flex items-center gap-5 px-5 py-5 transition-colors hover:bg-white/[0.03] md:px-8 md:py-7">
            <span className="lab w-7 shrink-0 text-signal">{String(i + 1).padStart(2, "0")}</span>
            <span
              className="dis flex-1 text-white"
              style={{ fontSize: "clamp(1.6rem, 9vw, 11rem)", lineHeight: 0.88 }}
            >
              {s.category}
            </span>
            <span className="lab text-white/45 transition-colors group-hover:text-white/40">
              {open === i ? "−" : "+"}
            </span>
          </div>

          {open === i && (
            <div className="border-t border-rule/40 px-5 pb-8 pt-6 md:px-8">
              <p className="max-w-xl text-base leading-relaxed text-white/60">{s.description}</p>
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {s.items.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-px w-5 shrink-0 bg-signal/60" />
                    <span className="text-sm text-white/60" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.7rem" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </section>
  );
}
