"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type SoundContextType = {
  playHover: () => void;
  playClick: () => void;
  muted: boolean;
  toggleMute: () => void;
};

const SoundContext = createContext<SoundContextType>({
  playHover: () => {},
  playClick: () => {},
  muted: true,
  toggleMute: () => {},
});

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(true); // Default muted to not annoy users
  const pathname = usePathname();

  useEffect(() => {
    // We only create the AudioContext on the first user interaction to comply with browser autoplay policies
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    // Read saved preference
    const saved = localStorage.getItem("fac_sound_muted");
    if (saved === "false") {
      setMuted(false);
    }

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      if (audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const playHover = () => {
    if (muted || !audioCtxRef.current) return;
    
    // Very subtle, short, high frequency click
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.02);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  const playClick = () => {
    if (muted || !audioCtxRef.current) return;
    
    // Deeper, slightly longer thud
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const toggleMute = () => {
    setMuted(m => {
      const next = !m;
      localStorage.setItem("fac_sound_muted", String(next));
      if (!next && audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return next;
    });
  };

  // Play click on page transition
  useEffect(() => {
    playClick();
  }, [pathname]);

  // Add global event listeners for links and buttons to play hover sounds
  useEffect(() => {
    if (muted) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button')) {
        playHover();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, [muted]);

  return (
    <SoundContext.Provider value={{ playHover, playClick, muted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}
