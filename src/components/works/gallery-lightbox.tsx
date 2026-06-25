"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ImageFade } from "@/components/ui/image-fade";

interface GalleryLightboxProps {
  images: string[];
  projectTitle: string;
}

function LightboxModal({
  images,
  projectTitle,
  index,
  direction,
  onClose,
  onPrev,
  onNext,
  onGoto,
}: {
  images: string[];
  projectTitle: string;
  index: number;
  direction: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGoto: (i: number) => void;
}) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex flex-col bg-black/96"
      style={{ zIndex: 999990 }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 md:px-10 shrink-0"
        style={{ height: "56px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="lab text-white/40" style={{ fontSize: "0.55rem" }}>
          {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
        <button
          onClick={onClose}
          className="lab text-white/50 hover:text-white transition-colors px-3 py-2"
          style={{ fontSize: "0.65rem" }}
        >
          ✕ Close
        </button>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.22, ease: [0.25, 0, 0.35, 1] }}
            className="absolute inset-0 flex items-center justify-center p-8 md:p-14"
          >
            <div className="relative w-full h-full">
              <ImageFade
                src={images[index]}
                alt={`${projectTitle} — ${index + 1}`}
                fill
                sizes="(max-width: 768px) 95vw, 85vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        <button
          onClick={onPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 lab text-white/30 hover:text-white transition-colors p-4"
          style={{ zIndex: 10, fontSize: "1.2rem" }}
        >
          ←
        </button>
        <button
          onClick={onNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 lab text-white/30 hover:text-white transition-colors p-4"
          style={{ zIndex: 10, fontSize: "1.2rem" }}
        >
          →
        </button>
      </div>

      {/* Thumbnail strip */}
      <div
        className="shrink-0 flex items-center justify-center gap-1.5 px-5 overflow-x-auto"
        style={{ height: "56px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onGoto(i)}
            className="shrink-0 relative overflow-hidden transition-all"
            style={{
              width: i === index ? "44px" : "28px",
              height: "32px",
              opacity: i === index ? 1 : 0.35,
              border: i === index ? "1px solid var(--signal)" : "1px solid transparent",
            }}
          >
            <ImageFade src={img} alt="" fill sizes="44px" className="object-cover" />
          </button>
        ))}
      </div>
    </motion.div>,
    document.body
  );
}

export function GalleryLightbox({ images, projectTitle }: GalleryLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const openAt = (i: number) => { setIndex(i); setDirection(0); setOpen(true); };
  const close = () => setOpen(false);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goto = useCallback((i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, prev, next]);

  // Alternating layout: full → half-half → full → …
  const renderGallery = () => {
    const els: React.ReactNode[] = [];
    let i = 0;
    while (i < images.length) {
      const pos = i % 3;
      if (pos === 1 && images[i + 1]) {
        const leftIdx = i;
        const rightIdx = i + 1;
        els.push(
          <div key={i} className="grid grid-cols-2 border-b border-rule">
            {[leftIdx, rightIdx].map((idx, j) => (
              <button
                key={idx}
                onClick={() => openAt(idx)}
                className={`group relative aspect-[4/3] overflow-hidden bg-black${j === 0 ? " border-r border-rule" : ""}`}
              >
                <ImageFade
                  src={images[idx]}
                  alt={`${projectTitle} — ${idx + 1}`}
                  fill
                  sizes="50vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="lab text-white bg-black/50 px-3 py-1" style={{ fontSize: "0.5rem" }}>Expand ↗</span>
                </div>
              </button>
            ))}
          </div>
        );
        i += 2;
      } else {
        const idx = i;
        els.push(
          <button
            key={i}
            onClick={() => openAt(idx)}
            className="group relative aspect-[16/9] w-full overflow-hidden bg-black border-b border-rule block"
          >
            <ImageFade
              src={images[idx]}
              alt={`${projectTitle} — ${idx + 1}`}
              fill
              sizes="100vw"
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="lab text-white bg-black/50 px-3 py-1" style={{ fontSize: "0.5rem" }}>Expand ↗</span>
            </div>
          </button>
        );
        i += 1;
      }
    }
    return els;
  };

  return (
    <>
      {renderGallery()}
      {mounted && (
        <AnimatePresence>
          {open && (
            <LightboxModal
              images={images}
              projectTitle={projectTitle}
              index={index}
              direction={direction}
              onClose={close}
              onPrev={prev}
              onNext={next}
              onGoto={goto}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
