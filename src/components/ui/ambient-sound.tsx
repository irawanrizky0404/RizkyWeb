"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function AmbientSound() {
  const pathname = usePathname();
  const [playing, setPlaying] = useState(false);
  const [, setReady] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  function buildGraph(ctx: AudioContext) {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.connect(ctx.destination);
    gainRef.current = master;

    // Low industrial drone — two detuned oscillators
    const freqs = [40, 40.4, 80, 120];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      g.gain.value = freq < 50 ? 0.18 : 0.06;
      osc.connect(g);
      g.connect(master);
      osc.start();
      nodesRef.current.push(osc, g);
    });

    // White noise layer — tape hiss
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.012;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    nodesRef.current.push(noise, noiseGain, filter);
  }

  function toggle() {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      buildGraph(ctx);
      setReady(true);
    }

    const master = gainRef.current;
    const ctx = ctxRef.current;
    if (!master || !ctx) return;

    if (!playing) {
      if (ctx.state === "suspended") ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
      setPlaying(true);
    } else {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setPlaying(false);
    }
  }

  useEffect(() => {
    return () => { ctxRef.current?.close(); };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <button
      onClick={toggle}
      title={playing ? "Mute ambient" : "Play ambient"}
      aria-label={playing ? "Mute ambient sound" : "Play ambient sound"}
      className="group flex items-center gap-2 transition-opacity"
      style={{ opacity: 0.4 }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
    >
      {/* Waveform bars */}
      <div className="flex items-end gap-[2px]" style={{ height: "14px" }}>
        {[4, 8, 12, 6, 10, 14, 7].map((h, i) => (
          <div
            key={i}
            style={{
              width: "2px",
              height: playing ? `${h}px` : "3px",
              background: playing ? "var(--signal)" : "var(--grey)",
              borderRadius: "1px",
              transition: `height ${0.15 + i * 0.04}s ease, background 0.3s ease`,
              animation: playing ? `wave-bar ${0.6 + i * 0.1}s ease-in-out infinite alternate` : "none",
            }}
          />
        ))}
      </div>
      <span
        className="lab"
        style={{
          fontSize: "0.5rem",
          color: playing ? "var(--signal)" : "var(--grey)",
          transition: "color 0.3s ease",
          letterSpacing: "0.18em",
        }}
      >
        {playing ? "SND·ON" : "SND·OFF"}
      </span>

      <style>{`
        @keyframes wave-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </button>
  );
}
