"use client";

import { useState, useEffect, useTransition } from "react";
import { updateDesign } from "@/app/admin/actions";
import type { DesignConfig } from "@/lib/store";

const PRESET_ACCENTS = [
  { name: "Signal Red", value: "#ff3500" },
  { name: "Electric Blue", value: "#0066ff" },
  { name: "Acid Green", value: "#39ff14" },
  { name: "Pale Gold", value: "#d4af37" },
  { name: "Cold White", value: "#e8e8e8" },
  { name: "Deep Purple", value: "#7c3aed" },
  { name: "Coral", value: "#ff6b6b" },
];

const DEFAULT: DesignConfig = {
  colors: { signal: "#ff3500", black: "#080808", white: "#f0f0ee", grey: "#7a7a76" },
  hero: { statement: "Working at the frequency between signal and silence.", bio: "5 years across 3D, motion, illustration, and identity.", availableText: "Available for Work" },
  site: { name: "Rizky Irawan", role: "Multidisciplinary Visual Artist", tagline: "Visual Archive", email: "rizkyirawan0404@gmail.com", location: "Indonesia", timezone: "UTC +7", established: "2017" },
  social: { instagram: "", behance: "", linkedin: "" },
};

export default function AdminDesign() {
  const [config, setConfig] = useState<DesignConfig>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setConfig(DEFAULT);
    fetch("/api/admin/design")
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((d) => { setConfig(d || DEFAULT); setLoaded(true); })
      .catch(() => { setConfig(DEFAULT); setLoaded(true); });
  }, []);

  function setColor(key: keyof DesignConfig["colors"], value: string) {
    setConfig((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  }
  function setHero(key: keyof DesignConfig["hero"], value: string) {
    setConfig((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  }
  function setSite(key: keyof DesignConfig["site"], value: string) {
    setConfig((prev) => ({ ...prev, site: { ...prev.site, [key]: value } }));
  }
  function setSocial(key: keyof DesignConfig["social"], value: string) {
    setConfig((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  function save() {
    startTransition(async () => {
      await updateDesign(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  if (!loaded) return <div className="p-8"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  const inputCls = "w-full bg-transparent border-b border-rule py-2 lab text-white placeholder:text-white/15 focus:outline-none focus:border-signal transition-colors";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 border-b border-rule pb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Design</span>
          <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Design</h1>
          <p className="lab text-white/30 mt-2" style={{ fontSize: "0.55rem" }}>Changes apply to the live website after saving.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>Saved ✓</span>}
          <button onClick={save} disabled={isPending}
            className="group inline-flex items-center gap-3 border border-signal px-5 py-3 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white group-hover:text-black transition-colors" style={fs}>
              {isPending ? "Saving…" : "Save & Publish"}
            </span>
          </button>
        </div>
      </div>

      {/* ── COLORS ─────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="lab text-white/60 mb-5 border-b border-rule pb-2" style={{ fontSize: "0.62rem" }}>Colors</h2>

        {/* Accent color presets */}
        <div className="mb-5">
          <label className={labelCls} style={fs}>Accent Color (Signal)</label>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {PRESET_ACCENTS.map((p) => (
              <button key={p.value} onClick={() => setColor("signal", p.value)} title={p.name}
                className="flex items-center gap-2 border px-3 py-2 transition-colors lab"
                style={{
                  fontSize: "0.5rem",
                  borderColor: config.colors.signal === p.value ? p.value : "rgba(240,240,238,0.1)",
                  color: config.colors.signal === p.value ? p.value : "rgba(240,240,238,0.4)",
                }}>
                <span className="h-3 w-3 rounded-full shrink-0" style={{ background: p.value }} />
                {p.name}
              </button>
            ))}
            {/* Custom color picker */}
            <label className="flex items-center gap-2 border border-rule px-3 py-2 cursor-pointer lab transition-colors hover:border-signal"
              style={{ fontSize: "0.5rem", color: "rgba(240,240,238,0.4)" }}>
              <input type="color" value={config.colors.signal} onChange={(e) => setColor("signal", e.target.value)}
                className="h-3 w-3 border-0 bg-transparent p-0 cursor-pointer" style={{ opacity: 0, position: "absolute" }} />
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: config.colors.signal }} />
              Custom
            </label>
          </div>
        </div>

        {/* Color inputs */}
        <div className="grid grid-cols-2 gap-4">
          {([
            ["signal", "Accent / Signal"],
            ["black", "Background"],
            ["white", "Foreground / Text"],
            ["grey", "Muted / Secondary"],
          ] as [keyof DesignConfig["colors"], string][]).map(([key, label]) => (
            <div key={key}>
              <label className={labelCls} style={fs}>{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.colors[key]} onChange={(e) => setColor(key, e.target.value)}
                  className="h-7 w-10 border border-rule bg-transparent cursor-pointer p-0" />
                <input value={config.colors[key]} onChange={(e) => setColor(key, e.target.value)}
                  className="flex-1 bg-transparent border-b border-rule py-1 lab text-white focus:outline-none focus:border-signal"
                  style={{ fontSize: "0.58rem" }} placeholder="#000000" />
              </div>
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div className="mt-4 border border-rule p-4" style={{ background: config.colors.black }}>
          <p className="lab mb-1" style={{ fontSize: "0.5rem", color: config.colors.signal, opacity: 0.7 }}>FAC.001 — Preview</p>
          <p style={{ color: config.colors.white, fontFamily: "var(--font-display)", fontSize: "2.5rem", lineHeight: 0.88, textTransform: "uppercase" }}>
            Rizky <span style={{ color: config.colors.signal }}>Irawan</span>
          </p>
          <p style={{ color: config.colors.grey, fontSize: "0.65rem", marginTop: "8px", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Multidisciplinary Visual Artist
          </p>
        </div>
      </section>

      {/* ── HERO TEXT ──────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="lab text-white/60 mb-5 border-b border-rule pb-2" style={{ fontSize: "0.62rem" }}>Hero & Statement</h2>
        <div className="flex flex-col gap-5">
          <div>
            <label className={labelCls} style={fs}>Statement (displayed on homepage)</label>
            <textarea rows={2} value={config.hero.statement} onChange={(e) => setHero("statement", e.target.value)}
              className={inputCls} style={{ ...fs, resize: "none" }} placeholder="Your main statement text" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Bio (below statement)</label>
            <textarea rows={3} value={config.hero.bio} onChange={(e) => setHero("bio", e.target.value)}
              className={inputCls} style={{ ...fs, resize: "none" }} placeholder="Short biography" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Available Text (header badge)</label>
            <input value={config.hero.availableText} onChange={(e) => setHero("availableText", e.target.value)}
              className={inputCls} style={fs} placeholder="Available for Work" />
          </div>
        </div>
      </section>

      {/* ── SITE INFO ──────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="lab text-white/60 mb-5 border-b border-rule pb-2" style={{ fontSize: "0.62rem" }}>Site Info</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {([
            ["name", "Your Name"],
            ["role", "Role / Title"],
            ["tagline", "Site Tagline"],
            ["email", "Contact Email"],
            ["location", "Location"],
            ["timezone", "Timezone"],
            ["established", "Established Year"],
          ] as [keyof DesignConfig["site"], string][]).map(([key, label]) => (
            <div key={key}>
              <label className={labelCls} style={fs}>{label}</label>
              <input value={config.site[key]} onChange={(e) => setSite(key, e.target.value)}
                className={inputCls} style={fs} />
            </div>
          ))}
        </div>
      </section>

      {/* ── SOCIAL LINKS ───────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="lab text-white/60 mb-5 border-b border-rule pb-2" style={{ fontSize: "0.62rem" }}>Social Links</h2>
        <div className="flex flex-col gap-5">
          {([
            ["instagram", "Instagram URL"],
            ["behance", "Behance URL"],
            ["linkedin", "LinkedIn URL"],
          ] as [keyof DesignConfig["social"], string][]).map(([key, label]) => (
            <div key={key}>
              <label className={labelCls} style={fs}>{label}</label>
              <input type="url" value={config.social[key]} onChange={(e) => setSocial(key, e.target.value)}
                className={inputCls} style={fs} placeholder="https://" />
            </div>
          ))}
        </div>
      </section>

      {/* Save button bottom */}
      <div className="flex items-center gap-4 border-t border-rule pt-6">
        <button onClick={save} disabled={isPending}
          className="group inline-flex items-center gap-3 border border-signal px-5 py-3 hover:bg-signal transition-colors disabled:opacity-40">
          <span className="lab text-white group-hover:text-black transition-colors" style={fs}>
            {isPending ? "Saving…" : "Save & Publish"}
          </span>
        </button>
        {saved && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>Changes published ✓</span>}
      </div>
    </div>
  );
}
