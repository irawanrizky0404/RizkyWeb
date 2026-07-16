"use client";

import { useRef, useState, useCallback } from "react";

interface VideoEmbedProps {
  src: string;
  className?: string;
}

export function VideoEmbed({ src, className }: VideoEmbedProps) {
  const [interactive, setInteractive] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = useCallback(() => {
    setInteractive(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setInteractive(false);
  }, []);

  const isYouTube = src.includes("youtube.com") || src.includes("youtu.be");
  const finalSrc = isYouTube && !src.includes("?")
    ? `${src}?rel=0&modestbranding=1`
    : src;

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className ?? ""}`}
      onMouseLeave={handleMouseLeave}
    >
      <iframe
        src={finalSrc}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{ display: "block" }}
      />
      {/* Overlay prevents scroll hijack and cursor loss until user clicks to interact */}
      {!interactive && (
        <div
          className="absolute inset-0 z-10"
          style={{ cursor: "none" }}
          onClick={handleOverlayClick}
        />
      )}
    </div>
  );
}
