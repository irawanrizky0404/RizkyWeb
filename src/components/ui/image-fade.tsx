"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

export function ImageFade({ className = "", ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
      {/* Brutalist loading grid / shimmer */}
      {!loaded && (
        <div 
          className="absolute inset-0 z-0 opacity-50"
          style={{ 
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} 
        />
      )}
      
      <Image
        {...props}
        className={`transition-opacity duration-700 ease-out z-10 relative ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        onLoad={(e) => {
          setLoaded(true);
          if (props.onLoad) props.onLoad(e);
        }}
      />
    </div>
  );
}
