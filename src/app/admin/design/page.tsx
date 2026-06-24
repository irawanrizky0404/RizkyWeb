"use client";

import { useState, useEffect, useTransition } from "react";
import { updateDesign } from "@/app/admin/actions";
import type { DesignConfig } from "@/lib/store";
import { ImageUpload } from "@/components/admin/image-upload";

const PRESET_ACCENTS = [
  { name: "Signal Red", value: "#ff3500" },
  { name: "Electric Blue", value: "#0066ff" },
  { name: "Acid Green", value: "#39ff14" },
  { name: "Pale Gold", value: "#d4af37" },
  { name: "Cold White", value: "#e8e8e8" },
  { name: "Deep Purple", value: "#7c3aed" },
  { name: "Coral", value: "#ff6b6b" },
  { name: "Hot Pink", value: "#ff1493" },
  { name: "Neon Orange", value: "#ff6700" },
  { name: "Mint", value: "#00fa9a" },
];

const FONT_OPTIONS = [
  // Display
  { label: "Bebas Neue", value: "Bebas Neue", category: "Display" },
  { label: "Oswald", value: "Oswald", category: "Display" },
  { label: "Playfair Display", value: "Playfair Display", category: "Display" },
  { label: "Anton", value: "Anton", category: "Display" },
  { label: "Archivo Black", value: "Archivo Black", category: "Display" },
  { label: "Righteous", value: "Righteous", category: "Display" },
  { label: "Titan One", value: "Titan One", category: "Display" },
  { label: "Bungee", value: "Bungee", category: "Display" },
  { label: "Russo One", value: "Russo One", category: "Display" },
  { label: "Black Ops One", value: "Black Ops One", category: "Display" },
  { label: "Permanent Marker", value: "Permanent Marker", category: "Display" },
  { label: "Staatliches", value: "Staatliches", category: "Display" },
  { label: "Monoton", value: "Monoton", category: "Display" },
  { label: "Syncopate", value: "Syncopate", category: "Display" },
  { label: "Big Shoulders Display", value: "Big Shoulders Display", category: "Display" },
  // Sans
  { label: "IBM Plex Sans", value: "IBM Plex Sans", category: "Sans" },
  { label: "Work Sans", value: "Work Sans", category: "Sans" },
  { label: "Space Grotesk", value: "Space Grotesk", category: "Sans" },
  { label: "DM Sans", value: "DM Sans", category: "Sans" },
  { label: "Outfit", value: "Outfit", category: "Sans" },
  { label: "Manrope", value: "Manrope", category: "Sans" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans", category: "Sans" },
  { label: "Sora", value: "Sora", category: "Sans" },
  { label: "Albert Sans", value: "Albert Sans", category: "Sans" },
  { label: "Nunito Sans", value: "Nunito Sans", category: "Sans" },
  { label: "Karla", value: "Karla", category: "Sans" },
  { label: "Commissioner", value: "Commissioner", category: "Sans" },
  { label: "Barlow", value: "Barlow", category: "Sans" },
  { label: "Libre Franklin", value: "Libre Franklin", category: "Sans" },
  { label: "Rubik", value: "Rubik", category: "Sans" },
  { label: "Mulish", value: "Mulish", category: "Sans" },
  // Mono
  { label: "IBM Plex Mono", value: "IBM Plex Mono", category: "Mono" },
  { label: "JetBrains Mono", value: "JetBrains Mono", category: "Mono" },
  { label: "Space Mono", value: "Space Mono", category: "Mono" },
  { label: "Fira Code", value: "Fira Code", category: "Mono" },
  { label: "Source Code Pro", value: "Source Code Pro", category: "Mono" },
  { label: "Inconsolata", value: "Inconsolata", category: "Mono" },
  { label: "Fira Mono", value: "Fira Mono", category: "Mono" },
  { label: "Roboto Mono", value: "Roboto Mono", category: "Mono" },
  // Serif
  { label: "Fraunces", value: "Fraunces", category: "Serif" },
  { label: "Cormorant", value: "Cormorant", category: "Serif" },
  { label: "Playfair Display", value: "Playfair Display", category: "Serif" },
  { label: "Source Serif 4", value: "Source Serif 4", category: "Serif" },
  { label: "Lora", value: "Lora", category: "Serif" },
  { label: "Merriweather", value: "Merriweather", category: "Serif" },
  { label: "Crimson Pro", value: "Crimson Pro", category: "Serif" },
  { label: "Bodoni Moda", value: "Bodoni Moda", category: "Serif" },
  { label: "Libre Baskerville", value: "Libre Baskerville", category: "Serif" },
  { label: "EB Garamond", value: "EB Garamond", category: "Serif" },
  { label: "Spectral", value: "Spectral", category: "Serif" },
  { label: "Zilla Slab", value: "Zilla Slab", category: "Serif" },
  // Script/Display
  { label: "Satisfy", value: "Satisfy", category: "Script" },
  { label: "Caveat", value: "Caveat", category: "Script" },
  { label: "Dancing Script", value: "Dancing Script", category: "Script" },
  { label: "Pacifico", value: "Pacifico", category: "Script" },
  { label: "Kalam", value: "Kalam", category: "Script" },
  // Horror
  { label: "Creepster", value: "Creepster", category: "Horror" },
  { label: "Nosifer", value: "Nosifer", category: "Horror" },
  { label: "Molot", value: "Molot", category: "Horror" },
  { label: "Audrey", value: "Audrey", category: "Horror" },
];

const ANIMATION_PRESETS = [
  { name: "None", value: "none" },
  { name: "Fade In", value: "fade" },
  { name: "Slide Up", value: "slideUp" },
  { name: "Slide Down", value: "slideDown" },
  { name: "Scale In", value: "scale" },
  { name: "Bounce", value: "bounce" },
];

const COLOR_PRESETS = [
  // Cinematic / Post-Punk
  { name: "Signal Red", colors: { signal: "#ff3500", black: "#080808", white: "#f0f0ee", grey: "#7a7a76" } },
  { name: "Blood Orange", colors: { signal: "#ff4d00", black: "#0a0808", white: "#f5f0ee", grey: "#8a7a6a" } },
  { name: "Ember", colors: { signal: "#ff6b35", black: "#100a08", white: "#faf5f0", grey: "#9a8a7a" } },
  { name: "Rust", colors: { signal: "#b7410e", black: "#0f0a08", white: "#f0ebe5", grey: "#7a6a5a" } },
  // Cool Blues
  { name: "Electric Blue", colors: { signal: "#0066ff", black: "#0a0a0f", white: "#f0f3f8", grey: "#6b7280" } },
  { name: "Cyan", colors: { signal: "#00d4ff", black: "#080a0f", white: "#f0f8ff", grey: "#6a7a8a" } },
  { name: "Azure", colors: { signal: "#007fff", black: "#080c14", white: "#f0f5ff", grey: "#5a6a7a" } },
  { name: "Navy", colors: { signal: "#1e3a5f", black: "#0a0e14", white: "#e8eef5", grey: "#5a6a7a" } },
  // Acid / Neon
  { name: "Acid Green", colors: { signal: "#39ff14", black: "#0a0a0a", white: "#f0f0e0", grey: "#6b6b5a" } },
  { name: "Neon Mint", colors: { signal: "#00fa9a", black: "#080a0a", white: "#f0faf5", grey: "#6a7a6a" } },
  { name: "Lime", colors: { signal: "#a4e000", black: "#0a0c08", white: "#f5fae8", grey: "#7a8a5a" } },
  { name: "Toxic", colors: { signal: "#adff00", black: "#0c1008", white: "#f8fae0", grey: "#8a9a5a" } },
  // Purple / Violet
  { name: "Neon Purple", colors: { signal: "#9333ea", black: "#0f0a1a", white: "#f5f0ff", grey: "#7a6b8a" } },
  { name: "Violet", colors: { signal: "#8b5cf6", black: "#0c0814", white: "#f5f2ff", grey: "#7a6a8a" } },
  { name: "Magenta", colors: { signal: "#e100ff", black: "#100810", white: "#faf0ff", grey: "#9a6a8a" } },
  { name: "Fuchsia", colors: { signal: "#ff00ff", black: "#0c080c", white: "#faf0fa", grey: "#8a6a8a" } },
  // Warm / Orange
  { name: "Cyber Orange", colors: { signal: "#ff6b00", black: "#0a0808", white: "#fff5f0", grey: "#7a6a5a" } },
  { name: "Tangerine", colors: { signal: "#ff7f50", black: "#0c0804", white: "#fff5f2", grey: "#9a7a6a" } },
  { name: "Amber", colors: { signal: "#ffbf00", black: "#100c08", white: "#fff8e8", grey: "#8a7a5a" } },
  { name: "Gold", colors: { signal: "#d4af37", black: "#0c0a08", white: "#faf5e8", grey: "#8a7a6a" } },
  // Pink / Coral
  { name: "Coral", colors: { signal: "#ff6b6b", black: "#0c0808", white: "#fff5f5", grey: "#9a7a7a" } },
  { name: "Hot Pink", colors: { signal: "#ff1493", black: "#0c0810", white: "#fff0f8", grey: "#9a6a7a" } },
  { name: "Rose", colors: { signal: "#ff007f", black: "#100810", white: "#fff0f5", grey: "#8a5a6a" } },
  { name: "Salmon", colors: { signal: "#fa8072", black: "#0c0808", white: "#fff8f5", grey: "#9a7a6a" } },
  // Minimal / Dark
  { name: "Minimal White", colors: { signal: "#1a1a1a", black: "#ffffff", white: "#000000", grey: "#888888" } },
  { name: "Grayscale", colors: { signal: "#333333", black: "#111111", white: "#eeeeee", grey: "#777777" } },
  { name: "Slate", colors: { signal: "#64748b", black: "#0f172a", white: "#f1f5f9", grey: "#94a3b8" } },
  { name: "Zinc", colors: { signal: "#52525b", black: "#09090b", white: "#fafafa", grey: "#a1a1aa" } },
  // Pastel / Soft
  { name: "Lavender", colors: { signal: "#a78bfa", black: "#0c0814", white: "#f5f2ff", grey: "#8a7aaa" } },
  { name: "Peach", colors: { signal: "#fb923c", black: "#100c08", white: "#fff8f0", grey: "#9a8a7a" } },
  { name: "Sky", colors: { signal: "#38bdf8", black: "#080c14", white: "#f0f9ff", grey: "#6a8a9a" } },
  { name: "Mint", colors: { signal: "#6ee7b7", black: "#080c0a", white: "#f0fdf8", grey: "#6a9a8a" } },
  // High Contrast
  { name: "Void", colors: { signal: "#ffffff", black: "#000000", white: "#ffffff", grey: "#666666" } },
  { name: "Inverted", colors: { signal: "#000000", black: "#ffffff", white: "#000000", grey: "#333333" } },
  { name: "Terminal", colors: { signal: "#00ff00", black: "#000000", white: "#00ff00", grey: "#008800" } },
  { name: "Matrix", colors: { signal: "#00ff41", black: "#0d0d0d", white: "#f0fdf0", grey: "#4a4a4a" } },
  // Retro / Vintage
  { name: "Sepia", colors: { signal: "#8b4513", black: "#1a0f0a", white: "#faf0e8", grey: "#8a7a6a" } },
  { name: "Vintage", colors: { signal: "#c9a959", black: "#141008", white: "#f5f0e0", grey: "#8a7a5a" } },
  { name: "Film", colors: { signal: "#c68b59", black: "#100c08", white: "#f5ebe0", grey: "#7a6a5a" } },
  { name: "Kodak", colors: { signal: "#ff7518", black: "#100a08", white: "#fff5e8", grey: "#9a7a5a" } },
  // Horror / Dark
  { name: "Blood", colors: { signal: "#8b0000", black: "#0a0808", white: "#f5e8e8", grey: "#5a4a4a" } },
  { name: "Gore", colors: { signal: "#660000", black: "#080808", white: "#f0e8e8", grey: "#4a3a3a" } },
  { name: "Phantom", colors: { signal: "#4a4a4a", black: "#0a0a0a", white: "#e8e8e8", grey: "#5a5a5a" } },
  { name: "Gothic", colors: { signal: "#8b0000", black: "#0f0f0f", white: "#e0e0e0", grey: "#5a5a5a" } },
  // Brutalist
  { name: "Brutal Red", colors: { signal: "#ff0000", black: "#000000", white: "#ffffff", grey: "#cccccc" } },
  { name: "Brutal Blue", colors: { signal: "#0000ff", black: "#000000", white: "#ffffff", grey: "#cccccc" } },
  { name: "Construction", colors: { signal: "#ffcc00", black: "#1a1a1a", white: "#ffffff", grey: "#888888" } },
  { name: "Caution", colors: { signal: "#ffff00", black: "#000000", white: "#000000", grey: "#666666" } },
  // Cyberpunk
  { name: "Cyber Red", colors: { signal: "#ff0055", black: "#0a0612", white: "#f5f0ff", grey: "#6a5a7a" } },
  { name: "Synthwave", colors: { signal: "#ff00ff", black: "#0d0221", white: "#fdfdff", grey: "#6a5a8a" } },
  { name: "RetroWave", colors: { signal: "#ff6ec7", black: "#1a0a2e", white: "#f5f0ff", grey: "#7a6a8a" } },
  { name: "Night", colors: { signal: "#00d9ff", black: "#050510", white: "#f0f0ff", grey: "#4a4a6a" } },
];

const FONT_PRESETS = [
  // Cinematic/Editorial
  { name: "Bold & Clean", display: "Bebas Neue", heading: "IBM Plex Sans", body: "IBM Plex Sans", accent: "IBM Plex Mono" },
  { name: "Editorial", display: "Playfair Display", heading: "Playfair Display", body: "IBM Plex Sans", accent: "IBM Plex Mono" },
  { name: "Strong Modern", display: "Anton", heading: "Space Grotesk", body: "Space Grotesk", accent: "Space Mono" },
  { name: "Elegant Serif", display: "Cormorant", heading: "Cormorant", body: "Source Serif 4", accent: "IBM Plex Mono" },
  { name: "Technical", display: "Archivo Black", heading: "IBM Plex Sans", body: "IBM Plex Mono", accent: "IBM Plex Mono" },
  { name: "Retro Pop", display: "Titan One", heading: "Work Sans", body: "Work Sans", accent: "Space Mono" },
  // Modern Minimal
  { name: "Clean Sans", display: "Outfit", heading: "Outfit", body: "DM Sans", accent: "JetBrains Mono" },
  { name: "Swiss Style", display: "Barlow", heading: "Barlow", body: "Libre Franklin", accent: "Fira Mono" },
  { name: "Neo Grotesque", display: "Space Grotesk", heading: "Space Grotesk", body: "Manrope", accent: "JetBrains Mono" },
  { name: "Minimal Plus", display: "Plus Jakarta Sans", heading: "Plus Jakarta Sans", body: "Mulish", accent: "Space Mono" },
  // Bold Statement
  { name: "Impact", display: "Bungee", heading: "Archivo Black", body: "IBM Plex Sans", accent: "IBM Plex Mono" },
  { name: "Street Art", display: "Monoton", heading: "Rubik", body: "Karla", accent: "Roboto Mono" },
  { name: "Brutal Bold", display: "Staatliches", heading: "Big Shoulders Display", body: "Commissioner", accent: "Fira Code" },
  { name: "Punk", display: "Syncopate", heading: "Karla", body: "Barlow", accent: "Space Mono" },
  // Serif Luxury
  { name: "Luxury Serif", display: "Bodoni Moda", heading: "Libre Baskerville", body: "EB Garamond", accent: "IBM Plex Mono" },
  { name: "Modern Editorial", display: "Playfair Display", heading: "Spectral", body: "Lora", accent: "Fira Mono" },
  { name: "Classic", display: "Cormorant", heading: "EB Garamond", body: "Merriweather", accent: "IBM Plex Mono" },
  // Horror/Dark
  { name: "Dark Horror", display: "Creepster", heading: "Nosifer", body: "Molot", accent: "Space Mono" },
  { name: "Neon Glow", display: "Audrey", heading: "Rubik", body: "Karla", accent: "JetBrains Mono" },
  // Script/Artistic
  { name: "Script Accent", display: "Bebas Neue", heading: "Caveat", body: "Work Sans", accent: "IBM Plex Mono" },
  { name: "Signature", display: "Pacifico", heading: "Kalam", body: "Mulish", accent: "Space Mono" },
  // Monospace/Cool
  { name: "All Mono", display: "Space Mono", heading: "Space Mono", body: "JetBrains Mono", accent: "Fira Code" },
  { name: "Tech", display: "JetBrains Mono", heading: "Fira Mono", body: "Roboto Mono", accent: "Inconsolata" },
];

const LAYOUT_PRESETS = [
  { name: "Standard", containerWidth: "1200px", gridCols: 12, gap: "24px", navStyle: "minimal" },
  { name: "Wide", containerWidth: "1400px", gridCols: 12, gap: "32px", navStyle: "full" },
  { name: "Compact", containerWidth: "960px", gridCols: 12, gap: "16px", navStyle: "minimal" },
  { name: "Gallery", containerWidth: "100%", gridCols: 16, gap: "8px", navStyle: "hidden" },
  { name: "Magazine", containerWidth: "1100px", gridCols: 12, gap: "40px", navStyle: "centered" },
  { name: "Ultra Wide", containerWidth: "1600px", gridCols: 12, gap: "48px", navStyle: "full" },
  { name: "Narrow Focus", containerWidth: "800px", gridCols: 8, gap: "20px", navStyle: "minimal" },
  { name: "Portfolio", containerWidth: "1300px", gridCols: 12, gap: "24px", navStyle: "centered" },
  { name: "Archive", containerWidth: "1100px", gridCols: 10, gap: "16px", navStyle: "minimal" },
  { name: "Split Screen", containerWidth: "100%", gridCols: 2, gap: "0px", navStyle: "hidden" },
  { name: "Fluid", containerWidth: "100%", gridCols: 12, gap: "24px", navStyle: "minimal" },
  { name: "Masonry", containerWidth: "1400px", gridCols: 16, gap: "12px", navStyle: "hidden" },
];

const COMPONENT_PRESETS = [
  { name: "Bordered", buttonStyle: "bordered", cardStyle: "bordered", badgeStyle: "bordered", inputStyle: "bordered" },
  { name: "Minimal", buttonStyle: "minimal", cardStyle: "minimal", badgeStyle: "minimal", inputStyle: "minimal" },
  { name: "Filled", buttonStyle: "filled", cardStyle: "filled", badgeStyle: "filled", inputStyle: "filled" },
  { name: "Soft", buttonStyle: "soft", cardStyle: "soft", badgeStyle: "soft", inputStyle: "soft" },
  { name: "Glitch", buttonStyle: "glitch", cardStyle: "bordered", badgeStyle: "glitch", inputStyle: "minimal" },
  { name: "Brutalist", buttonStyle: "brutal", cardStyle: "brutal", badgeStyle: "brutal", inputStyle: "brutal" },
  { name: "Elegant", buttonStyle: "elegant", cardStyle: "elegant", badgeStyle: "elegant", inputStyle: "elegant" },
  { name: "Retro", buttonStyle: "retro", cardStyle: "retro", badgeStyle: "retro", inputStyle: "retro" },
  { name: "Cyber", buttonStyle: "cyber", cardStyle: "cyber", badgeStyle: "cyber", inputStyle: "cyber" },
  { name: "Neon", buttonStyle: "neon", cardStyle: "neon", badgeStyle: "neon", inputStyle: "neon" },
];

const HERO_PRESETS = [
  { name: "Full Screen", statementSize: "clamp(3rem, 10vw, 12rem)", statementAlign: "left", showImage: true, imageOverlay: 0.6 },
  { name: "Compact", statementSize: "clamp(2rem, 6vw, 5rem)", statementAlign: "left", showImage: false, imageOverlay: 0 },
  { name: "Centered", statementSize: "clamp(2.5rem, 8vw, 8rem)", statementAlign: "center", showImage: true, imageOverlay: 0.4 },
  { name: "Split", statementSize: "clamp(2rem, 7vw, 7rem)", statementAlign: "left", showImage: true, imageOverlay: 0.5 },
  { name: "Statement Only", statementSize: "clamp(3rem, 12vw, 14rem)", statementAlign: "left", showImage: false, imageOverlay: 0 },
  { name: "Cinematic", statementSize: "clamp(2.5rem, 9vw, 10rem)", statementAlign: "center", showImage: true, imageOverlay: 0.7 },
  { name: "Typographic", statementSize: "clamp(4rem, 15vw, 18rem)", statementAlign: "left", showImage: false, imageOverlay: 0 },
  { name: "Split Diagonal", statementSize: "clamp(2.5rem, 8vw, 9rem)", statementAlign: "left", showImage: true, imageOverlay: 0.65 },
  { name: "Video BG", statementSize: "clamp(2rem, 7vw, 8rem)", statementAlign: "center", showImage: true, imageOverlay: 0.8 },
  { name: "Parallax", statementSize: "clamp(3rem, 12vw, 14rem)", statementAlign: "left", showImage: true, imageOverlay: 0.5 },
];

const SOCIAL_PRESETS = [
  { name: "Minimal Icons", style: "icon", size: "small" },
  { name: "Full Links", style: "full", size: "medium" },
  { name: "Large Display", style: "display", size: "large" },
  { name: "Text Only", style: "text", size: "small" },
  { name: "Circle Icons", style: "circle", size: "medium" },
];

const DEFAULT: DesignConfig = {
  colors: { signal: "#ff3500", black: "#080808", white: "#f0f0ee", grey: "#7a7a76" },
  hero: { statement: "Working at the frequency between signal and silence.", bio: "5 years across 3D, motion, illustration, and identity.", availableText: "Available for Work", heroImage: "/images/works/phantom-in-the-ruins/01.jpg" },
  site: { name: "Rizky Irawan", role: "Multidisciplinary Visual Artist", tagline: "Visual Archive", email: "rizkyirawan0404@gmail.com", location: "Indonesia", timezone: "UTC +7", established: "2017" },
  social: { instagram: "", behance: "", linkedin: "" },
  fonts: { display: "Bebas Neue", heading: "IBM Plex Sans", body: "IBM Plex Sans", accent: "IBM Plex Mono" },
  favicon: "",
  meta: { title: "", description: "", keywords: "", ogImage: "" },
  layout: {
    containerWidth: "1280px",
    sectionPadding: "80px 40px",
    gridGap: "24px",
    borderRadius: "4px",
    headerHeight: "64px",
    navStyle: "minimal",
    worksGridCols: 3,
    journalGridCols: 2,
  },
  components: {
    buttonStyle: "bordered",
    cardStyle: "bordered",
    badgeStyle: "bordered",
    inputStyle: "bordered",
    borderRadius: "4px",
    buttonPadding: "12px 24px",
    cardPadding: "20px",
    shadowStyle: "none",
  },
};

type DesignTab = "colors" | "fonts" | "layout" | "components" | "hero" | "favicon" | "site" | "social" | "meta" | "advanced";

export default function AdminDesign() {
  const [config, setConfig] = useState<DesignConfig>(DEFAULT);
  const [loadedConfig, setLoadedConfig] = useState<DesignConfig | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<DesignTab>("colors");
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [generatingStatement, setGeneratingStatement] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [genMsg, setGenMsg] = useState("");

  const [selectedFontPreset, setSelectedFontPreset] = useState<string | null>(null);

  const [heroStyle, setHeroStyle] = useState({
    selectedPreset: "Full Screen",
    statementSize: "clamp(3rem, 10vw, 12rem)",
    statementAlign: "left" as "left" | "center" | "right",
    showImage: true,
    imageOverlay: 0.6,
  });

  const [socialStyle, setSocialStyle] = useState({
    selectedPreset: "Minimal Icons",
    style: "icon",
    size: "small" as "small" | "medium" | "large",
  });

  function setLayout(key: keyof DesignConfig["layout"], value: string | number) {
    setConfig((prev) => ({ ...prev, layout: { ...prev.layout, [key]: value } }));
  }

  function setComponent(key: keyof DesignConfig["components"], value: string) {
    setConfig((prev) => ({ ...prev, components: { ...prev.components, [key]: value } }));
  }

  const resetSection = (section: keyof DesignConfig) => {
    if (!loadedConfig) return;
    const sectionValue = loadedConfig[section];
    if (typeof sectionValue === 'object' && sectionValue !== null) {
      setConfig((prev) => ({ ...prev, [section]: { ...(sectionValue as object) } }));
    } else {
      setConfig((prev) => ({ ...prev, [section]: sectionValue }));
    }
  };

  const resetColors = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, colors: { ...loadedConfig.colors } }));
  };
  const resetFonts = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, fonts: { ...loadedConfig.fonts } }));
  };
  const resetHero = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, hero: { ...loadedConfig.hero } }));
  };
  const resetSite = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, site: { ...loadedConfig.site } }));
  };
  const resetSocial = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, social: { ...loadedConfig.social } }));
  };
  const resetMeta = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, meta: { ...loadedConfig.meta } }));
  };
  const resetFavicon = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, favicon: loadedConfig.favicon }));
  };
  const resetLayout = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, layout: { ...loadedConfig.layout } }));
  };
  const resetComponents = () => {
    if (!loadedConfig) return;
    setConfig((prev) => ({ ...prev, components: { ...loadedConfig.components } }));
  };
  const resetAdvanced = () => window.location.reload();

  useEffect(() => {
    setLoaded(false);
    setConfig(DEFAULT);
    fetch("/api/admin/design")
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((d) => {
        if (d && typeof d === "object" && "colors" in d && d.colors && typeof d.colors.signal === "string") {
          const loaded = {
            ...DEFAULT,
            ...d,
            colors: { ...DEFAULT.colors, ...d.colors },
            fonts: { ...DEFAULT.fonts, ...d.fonts },
            meta: { ...DEFAULT.meta, ...d.meta },
            layout: { ...DEFAULT.layout, ...(d.layout || {}) },
            components: { ...DEFAULT.components, ...(d.components || {}) },
          };
          setConfig(loaded);
          setLoadedConfig(loaded);
        } else {
          setConfig(DEFAULT);
          setLoadedConfig(DEFAULT);
        }
        setLoaded(true);
      })
      .catch(() => { setConfig(DEFAULT); setLoadedConfig(DEFAULT); setLoaded(true); });
  }, []);

  function setColor(key: keyof DesignConfig["colors"], value: string) {
    setConfig((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  }

  function setFont(key: keyof DesignConfig["fonts"], value: string) {
    setConfig((prev) => ({ ...prev, fonts: { ...prev.fonts, [key]: value } }));
  }

  function setMeta(key: keyof DesignConfig["meta"], value: string) {
    setConfig((prev) => ({ ...prev, meta: { ...prev.meta, [key]: value } }));
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

  async function handleGenerateStatement() {
    const siteName = config.site.name || "Rizky Irawan";
    const siteRole = config.site.role || "Visual Artist";
    setGeneratingStatement(true);
    setGenMsg("");
    try {
      const res = await fetch("/api/admin/ai/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: `A creative professional who is a ${siteRole}. Their portfolio should have a compelling hero statement that captures their unique creative philosophy and artistic identity. Site name: ${siteName}.` }),
      });
      const data = await res.json();
      if (data.title) {
        setHero("statement", data.title);
        setGenMsg("Statement generated!");
      } else {
        setGenMsg("Generation failed");
      }
    } catch { setGenMsg("Generation failed"); }
    finally { setGeneratingStatement(false); setTimeout(() => setGenMsg(""), 2000); }
  }

  async function handleGenerateBio() {
    const siteRole = config.site.role || "Visual Artist";
    const statement = config.hero.statement || "";
    setGeneratingBio(true);
    setGenMsg("");
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: statement || siteRole, type: "summary", category: "artist bio" }),
      });
      const data = await res.json();
      if (data.result) {
        setHero("bio", data.result);
        setGenMsg("Bio generated!");
      } else {
        setGenMsg("Generation failed");
      }
    } catch { setGenMsg("Generation failed"); }
    finally { setGeneratingBio(false); setTimeout(() => setGenMsg(""), 2000); }
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("category", "favicon");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok && data.results?.[0]?.path) {
        setConfig((prev) => ({ ...prev, favicon: data.results[0].path }));
      } else {
        alert(data.error || "Upload failed");
      }
    } catch { alert("Upload failed"); }
    finally { setUploadingFavicon(false); }
  }

  function save() {
    startTransition(async () => {
      await updateDesign(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  if (!loaded || !config?.colors?.signal) return <div className="p-8"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  const inputCls = "w-full bg-transparent border border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors";
  const textareaCls = "w-full bg-transparent border border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors resize-none";
  const selectCls = "w-full bg-black border border-rule px-3 py-2 lab text-white focus:outline-none focus:border-signal transition-colors";
  const labelCls = "lab text-white/40 block mb-1";
  const fs = { fontSize: "0.6rem" };
  const sectionLabelCls = "lab text-white/20 block mb-3";

  const tabs: { id: DesignTab; label: string; num: string }[] = [
    { id: "colors", label: "Colors", num: "01" },
    { id: "fonts", label: "Typography", num: "02" },
    { id: "layout", label: "Layout", num: "03" },
    { id: "components", label: "Components", num: "04" },
    { id: "hero", label: "Hero", num: "05" },
    { id: "favicon", label: "Favicon", num: "06" },
    { id: "site", label: "Site Info", num: "07" },
    { id: "social", label: "Social", num: "08" },
    { id: "meta", label: "SEO", num: "09" },
    { id: "advanced", label: "Advanced", num: "10" },
  ];

  const getFontCategory = (font: string) => FONT_OPTIONS.find(f => f.value === font)?.category || "Sans";

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-6 border-b border-rule pb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Design</span>
          <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Design</h1>
          <p className="lab text-white/30 mt-2" style={{ fontSize: "0.55rem" }}>Complete customization — from 0 to 100.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="lab text-signal animate-pulse" style={{ fontSize: "0.55rem" }}>Saved ✓</span>}
          <button onClick={save} disabled={isPending}
            className="group inline-flex items-center gap-3 border border-signal px-5 py-3 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white group-hover:text-black transition-colors" style={fs}>
              {isPending ? "Saving…" : "Save & Publish"}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-rule pb-0 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="lab px-3 py-2.5 transition-colors"
            style={{
              fontSize: "0.55rem",
              color: activeTab === tab.id ? "#080808" : "rgba(240,240,238,0.4)",
              background: activeTab === tab.id ? "#ff3500" : "transparent",
              borderBottom: activeTab === tab.id ? "2px solid #ff3500" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            {tab.num} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 01 — COLORS                                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "colors" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>Colors</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Customize your brand colors</p>
              </div>
              <button onClick={resetColors} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset Colors
              </button>
            </div>

            {/* Color Scheme Presets */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>00 — Color Scheme Presets</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Complete color schemes. Click to apply all colors at once.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setConfig((prev) => ({ ...prev, colors: { ...preset.colors } }))}
                    className="flex flex-col items-center gap-3 border p-4 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: config.colors.signal === preset.colors.signal ? preset.colors.signal : "rgba(240,240,238,0.1)",
                      background: "transparent",
                    }}
                  >
                    <div className="flex gap-2">
                      <span className="h-6 w-6 rounded-full" style={{ background: preset.colors.signal }} />
                      <span className="h-6 w-6 rounded-full" style={{ background: preset.colors.black }} />
                      <span className="h-6 w-6 rounded-full" style={{ background: preset.colors.white }} />
                      <span className="h-6 w-6 rounded-full" style={{ background: preset.colors.grey }} />
                    </div>
                    <span className="lab text-white/60" style={{ fontSize: "0.55rem" }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Presets */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Accent Color Presets</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Click to apply instantly. Customize further below.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {PRESET_ACCENTS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { setColor("signal", p.value); }}
                    className="flex flex-col items-center gap-2 border p-4 transition-all hover:scale-105"
                    style={{
                      borderColor: config.colors.signal === p.value ? p.value : "rgba(240,240,238,0.1)",
                      background: config.colors.signal === p.value ? `${p.value}15` : "transparent",
                    }}
                  >
                    <span className="h-8 w-8 rounded-full shadow-lg" style={{ background: p.value }} />
                    <span className="lab text-white/60" style={{ fontSize: "0.5rem" }}>{p.name}</span>
                    <span className="lab text-white/30" style={{ fontSize: "0.45rem" }}>{p.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Accent */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>02 — Custom Accent Color</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Your main brand color. Used for buttons, links, active states, and highlights.</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={config.colors.signal}
                  onChange={(e) => setColor("signal", e.target.value)}
                  className="h-16 w-24 border border-rule bg-transparent cursor-pointer p-1"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={config.colors.signal}
                    onChange={(e) => setColor("signal", e.target.value)}
                    className="w-full bg-transparent border border-rule px-4 py-3 lab text-white text-lg font-mono focus:outline-none focus:border-signal"
                    style={{ fontSize: "1rem" }}
                    placeholder="#ff3500"
                  />
                  <p className="lab text-white/30 mt-2" style={{ fontSize: "0.5rem" }}>Click the color picker or type a HEX code (include #)</p>
                </div>
              </div>
              <div className="mt-4 p-3 border border-rule" style={{ background: `${config.colors.signal}10` }}>
                <p className="lab text-white/50" style={{ fontSize: "0.5rem" }}>Preview: This is how your accent looks on dark backgrounds.</p>
              </div>
            </div>

            {/* Full Palette */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>03 — Full Color Palette</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Every color used across the site. Customize each one.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {([
                  ["signal", "Signal / Accent", "Primary brand color. Used for highlights, buttons, links, and accents."],
                  ["black", "Background", "Main site background. Should contrast well with text."],
                  ["white", "Foreground", "Primary text color. Should be readable on dark backgrounds."],
                  ["grey", "Muted / Secondary", "Secondary text, captions, borders, disabled states."],
                ] as [keyof DesignConfig["colors"], string, string][]).map(([key, label, desc]) => (
                  <div key={key} className="flex items-start gap-4 p-4 border border-rule">
                    <input
                      type="color"
                      value={config.colors[key]}
                      onChange={(e) => setColor(key, e.target.value)}
                      className="h-14 w-20 border border-rule bg-transparent cursor-pointer p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label className={labelCls} style={fs}>{label}</label>
                      <input
                        type="text"
                        value={config.colors[key]}
                        onChange={(e) => setColor(key, e.target.value)}
                        className="w-full bg-transparent border border-rule px-3 py-2 lab text-white focus:outline-none focus:border-signal mt-1"
                        style={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                      />
                      <p className="lab text-white/20 mt-2" style={{ fontSize: "0.52rem" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>04 — Live Preview</h3>
              <div className="rounded overflow-hidden" style={{ background: config.colors.black }}>
                <div className="p-6 space-y-4">
                  <span className="lab" style={{ fontSize: "0.5rem", color: config.colors.signal }}>FAC.001 — Preview</span>
                  <p style={{ color: config.colors.white, fontFamily: `'${config.fonts.display}', sans-serif`, fontSize: "3rem", lineHeight: 0.88 }}>
                    <span style={{ color: config.colors.signal }}>Rizky</span> Irawan
                  </p>
                  <p style={{ color: config.colors.grey, fontSize: "0.75rem", fontFamily: `'${config.fonts.body}', sans-serif` }}>
                    Multidisciplinary Visual Artist
                  </p>
                  <p style={{ color: config.colors.white, fontSize: "0.85rem", fontFamily: `'${config.fonts.accent}', monospace` }}>
                    Creating atmospheric visual experiences since 2017
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button className="border px-4 py-2 lab" style={{ fontSize: "0.6rem", color: config.colors.white, borderColor: config.colors.signal, background: config.colors.signal }}>
                      Primary Button
                    </button>
                    <button className="border px-4 py-2 lab" style={{ fontSize: "0.6rem", color: config.colors.signal, borderColor: config.colors.signal }}>
                      Outline Button
                    </button>
                    <button className="border px-4 py-2 lab" style={{ fontSize: "0.6rem", color: config.colors.white, borderColor: config.colors.grey }}>
                      Secondary
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Guide */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>05 — Color Usage Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="border border-rule p-4">
                  <p className="text-white/40 mb-2" style={{ fontSize: "0.55rem", textTransform: "uppercase" }}>Signal Color Uses</p>
                  <p className="text-white/30" style={{ fontSize: "0.58rem", lineHeight: 1.7 }}>• Active states & hover effects<br/>• Featured badges & highlights<br/>• Primary buttons<br/>• Links & interactive elements<br/>• Section numbers (FAC.001)</p>
                </div>
                <div className="border border-rule p-4">
                  <p className="text-white/40 mb-2" style={{ fontSize: "0.55rem", textTransform: "uppercase" }}>Black Color Uses</p>
                  <p className="text-white/30" style={{ fontSize: "0.58rem", lineHeight: 1.7 }}>• Page backgrounds<br/>• Card backgrounds<br/>• Modal overlays<br/>• Navigation bars<br/>• Footer sections</p>
                </div>
                <div className="border border-rule p-4">
                  <p className="text-white/40 mb-2" style={{ fontSize: "0.55rem", textTransform: "uppercase" }}>White Color Uses</p>
                  <p className="text-white/30" style={{ fontSize: "0.58rem", lineHeight: 1.7 }}>• Primary text<br/>• Headings<br/>• Icon fills<br/>• Inverse buttons<br/>• Image overlays</p>
                </div>
                <div className="border border-rule p-4">
                  <p className="text-white/40 mb-2" style={{ fontSize: "0.55rem", textTransform: "uppercase" }}>Grey Color Uses</p>
                  <p className="text-white/30" style={{ fontSize: "0.58rem", lineHeight: 1.7 }}>• Secondary text<br/>• Captions & metadata<br/>• Borders & dividers<br/>• Disabled states<br/>• Placeholder text</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 02 — TYPOGRAPHY                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "fonts" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>Typography</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Choose fonts for different text roles</p>
              </div>
              <button onClick={resetFonts} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset Fonts
              </button>
            </div>

            {/* Font Pairing Presets */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>00 — Font Pairing Presets</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Complete font pairings. Click to apply all fonts at once.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FONT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => { setSelectedFontPreset(preset.name); setConfig((prev) => ({ ...prev, fonts: { display: preset.display, heading: preset.heading, body: preset.body, accent: preset.accent } })); }}
                    className="flex flex-col items-center gap-2 border p-4 transition-all hover:scale-[1.02] text-left"
                    style={{
                      borderColor: selectedFontPreset === preset.name ? config.colors.signal : "rgba(240,240,238,0.1)",
                      background: "transparent",
                    }}
                  >
                    <span className="lab text-white/60 mb-1" style={{ fontSize: "0.55rem" }}>{preset.name}</span>
                    <span className="dis" style={{ fontFamily: `'${preset.display}', sans-serif`, fontSize: "1rem", color: config.colors.white }}>{preset.display}</span>
                    <span className="lab text-white/40" style={{ fontFamily: `'${preset.body}', sans-serif`, fontSize: "0.6rem" }}>{preset.body}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Font Selection</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Choose fonts for different text roles. All fonts are loaded from Google Fonts.</p>

              {([
                ["display", "Display Font", "Used for hero statements, large headings, and impact text"],
                ["heading", "Heading Font", "Used for section titles and subheadings"],
                ["body", "Body Font", "Used for paragraphs and general content"],
                ["accent", "Accent Font", "Used for labels, captions, tags, and metadata"],
              ] as [keyof DesignConfig["fonts"], string, string][]).map(([key, label, desc]) => (
                <div key={key} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelCls} style={fs}>{label}</label>
                    <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>{getFontCategory(config.fonts[key])}</span>
                  </div>
                  <select
                    value={config.fonts[key]}
                    onChange={(e) => setFont(key, e.target.value)}
                    className={selectCls}
                    style={fs}
                  >
                    <optgroup label="Display — Bold, impactful fonts">
                      {FONT_OPTIONS.filter(f => f.category === "Display").map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Sans — Clean, modern fonts">
                      {FONT_OPTIONS.filter(f => f.category === "Sans").map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Serif — Elegant, classic fonts">
                      {FONT_OPTIONS.filter(f => f.category === "Serif").map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Mono — Monospaced fonts">
                      {FONT_OPTIONS.filter(f => f.category === "Mono").map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="lab text-white/20 mt-2" style={{ fontSize: "0.52rem" }}>{desc}</p>

                  {/* Font Preview */}
                  <div className="mt-3 p-4 border border-rule" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p style={{ fontFamily: `'${config.fonts[key]}', sans-serif`, fontSize: "1.4rem", color: config.colors.white }}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="lab text-white/30 mt-1" style={{ fontFamily: `'${config.fonts[key]}', sans-serif`, fontSize: "0.65rem" }}>
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !@#$%^
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Type Scale Preview */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>02 — Type Scale</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>See how your fonts work at different sizes.</p>
              <div className="space-y-6">
                <div>
                  <p className="lab text-white/30 mb-2" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Display — Hero Statement</p>
                  <p style={{ fontFamily: `'${config.fonts.display}', sans-serif`, fontSize: "clamp(3rem, 10vw, 10rem)", lineHeight: 0.85, color: config.colors.white }}>
                    Making Ideas Visible
                  </p>
                </div>
                <div>
                  <p className="lab text-white/30 mb-2" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Heading — Section Title</p>
                  <p style={{ fontFamily: `'${config.fonts.heading}', sans-serif`, fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1, color: config.colors.white }}>
                    Section Heading
                  </p>
                </div>
                <div>
                  <p className="lab text-white/30 mb-2" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Subheading</p>
                  <p style={{ fontFamily: `'${config.fonts.heading}', sans-serif`, fontSize: "1.5rem", lineHeight: 1.2, color: config.colors.white }}>
                    This is a subheading or card title
                  </p>
                </div>
                <div>
                  <p className="lab text-white/30 mb-2" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Body — Paragraphs</p>
                  <p style={{ fontFamily: `'${config.fonts.body}', sans-serif`, fontSize: "1rem", lineHeight: 1.7, color: config.colors.white }}>
                    This is body text. It should be highly readable and comfortable for extended reading. Good body typography is essential for any content-heavy page like journal posts or project descriptions.
                  </p>
                </div>
                <div>
                  <p className="lab text-white/30 mb-2" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Small Text</p>
                  <p style={{ fontFamily: `'${config.fonts.body}', sans-serif`, fontSize: "0.875rem", lineHeight: 1.5, color: config.colors.grey }}>
                    Secondary information like captions, dates, and metadata.
                  </p>
                </div>
                <div>
                  <p className="lab text-white/30 mb-2" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Accent — Labels & Tags</p>
                  <p style={{ fontFamily: `'${config.fonts.accent}', monospace`, fontSize: "0.7rem", color: config.colors.grey, letterSpacing: "0.05em" }}>
                    FAC.001 · CATEGORY · TAG · METADATA
                  </p>
                </div>
              </div>
            </div>

            {/* Font Pairing Suggestions */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>03 — Font Pairing Ideas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { display: "Bebas Neue", body: "IBM Plex Sans", name: "Bold & Clean" },
                  { display: "Playfair Display", body: "IBM Plex Sans", name: "Editorial" },
                  { display: "Anton", body: "Work Sans", name: "Strong & Modern" },
                  { display: "Cormorant", body: "IBM Plex Sans", name: "Elegant" },
                  { display: "Oswald", body: "DM Sans", name: "Classic" },
                  { display: "Bebas Neue", body: "IBM Plex Mono", name: "Technical" },
                ].map((pair) => (
                  <button
                    key={pair.name}
                    onClick={() => setConfig((prev) => ({
                      ...prev,
                      fonts: { ...prev.fonts, display: pair.display, body: pair.body }
                    }))}
                    className="border border-rule p-4 text-left hover:border-signal transition-colors"
                  >
                    <p className="lab text-white/50 mb-1" style={{ fontSize: "0.55rem" }}>{pair.name}</p>
                    <p className="dis" style={{ fontFamily: `'${pair.display}', sans-serif`, fontSize: "1.2rem", color: config.colors.white }}>{pair.display}</p>
                    <p className="lab text-white/30" style={{ fontFamily: `'${pair.body}', sans-serif`, fontSize: "0.6rem" }}>{pair.body}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 03 — LAYOUT                                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "layout" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>Layout</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Control the structure and spacing of your site</p>
              </div>
              <button onClick={resetLayout} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset to Saved
              </button>
            </div>

            {/* Layout Presets */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>00 — Layout Presets</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Click to instantly apply layout settings.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {LAYOUT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setLayout("containerWidth", preset.containerWidth);
                      setLayout("gridGap", preset.gap);
                      setLayout("navStyle", preset.navStyle);
                    }}
                    className="flex flex-col items-center gap-2 border p-4 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: config.layout.containerWidth === preset.containerWidth ? config.colors.signal : "rgba(240,240,238,0.1)",
                      background: config.layout.containerWidth === preset.containerWidth ? `${config.colors.signal}10` : "transparent",
                    }}
                  >
                    <div className="flex flex-col gap-0.5 w-full">
                      <div className="h-2 bg-white/20 rounded" />
                      <div className="h-1 bg-white/10 rounded" />
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-6 flex-1 bg-white/10 rounded" />)}
                      </div>
                    </div>
                    <span className="lab text-white/60" style={{ fontSize: "0.55rem" }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Container Settings</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Control the max-width and padding of content areas.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Max Content Width</label>
                  <input
                    type="text"
                    value={config.layout.containerWidth}
                    onChange={(e) => setLayout("containerWidth", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="1280px, 100%, etc."
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Maximum width of content containers</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Section Padding</label>
                  <input
                    type="text"
                    value={config.layout.sectionPadding}
                    onChange={(e) => setLayout("sectionPadding", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="80px 40px"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Vertical and horizontal padding for sections</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Grid Gap</label>
                  <input
                    type="text"
                    value={config.layout.gridGap}
                    onChange={(e) => setLayout("gridGap", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="24px"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Gap between items in grids</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Border Radius</label>
                  <input
                    type="text"
                    value={config.layout.borderRadius}
                    onChange={(e) => setLayout("borderRadius", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="4px, 8px, 0px"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Corner roundness for cards, buttons, etc.</p>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>02 — Navigation Layout</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Customize the header and navigation bar.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Header Height</label>
                  <input
                    type="text"
                    value={config.layout.headerHeight}
                    onChange={(e) => setLayout("headerHeight", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="64px"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Height of the top navigation bar</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Nav Style</label>
                  <select
                    className={selectCls}
                    style={fs}
                    value={config.layout.navStyle}
                    onChange={(e) => setLayout("navStyle", e.target.value)}
                  >
                    <option value="minimal">Minimal — Simple, clean nav</option>
                    <option value="full">Full — Expanded with labels</option>
                    <option value="centered">Centered — Logo in middle</option>
                    <option value="hidden">Hidden — Menu only on mobile</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>How the navigation appears on desktop</p>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>03 — Grid Layouts</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Configure how items are displayed in grids.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Works Grid Columns</label>
                  <select
                    className={selectCls}
                    style={fs}
                    value={config.layout.worksGridCols}
                    onChange={(e) => setLayout("worksGridCols", parseInt(e.target.value))}
                  >
                    <option value={2}>2 columns</option>
                    <option value={3}>3 columns</option>
                    <option value={4}>4 columns</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Number of columns on the Works page</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Journal Grid</label>
                  <select
                    className={selectCls}
                    style={fs}
                    value={config.layout.journalGridCols}
                    onChange={(e) => setLayout("journalGridCols", parseInt(e.target.value))}
                  >
                    <option value={2}>2 columns</option>
                    <option value={3}>3 columns</option>
                    <option value={1}>List view</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Columns for journal entries</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Services Grid</label>
                  <select className={selectCls} style={fs}>
                    <option>3 columns</option>
                    <option value={2}>2 columns</option>
                    <option value={4}>4 columns</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Columns for services display</p>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>04 — Responsive Breakpoints</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-rule p-4">
                  <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Mobile</p>
                  <p className="lab text-white" style={{ fontSize: "0.7rem" }}>0 - 640px</p>
                </div>
                <div className="border border-rule p-4">
                  <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Tablet</p>
                  <p className="lab text-white" style={{ fontSize: "0.7rem" }}>640 - 768px</p>
                </div>
                <div className="border border-rule p-4">
                  <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Desktop</p>
                  <p className="lab text-white" style={{ fontSize: "0.7rem" }}>768 - 1024px</p>
                </div>
                <div className="border border-rule p-4">
                  <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Large</p>
                  <p className="lab text-white" style={{ fontSize: "0.7rem" }}>1024px+</p>
                </div>
              </div>
              <p className="lab text-white/20 mt-4" style={{ fontSize: "0.52rem" }}>Site uses Tailwind CSS responsive prefixes (sm:, md:, lg:, xl:)</p>
            </div>

            {/* Live Layout Preview */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>05 — Live Layout Preview</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>See how your layout settings affect the site structure.</p>

              {/* Container Width Preview */}
              <div className="mb-6">
                <label className={labelCls} style={fs}>Container Width: {config.layout.containerWidth}</label>
                <input
                  type="range"
                  min="800"
                  max="1600"
                  step="40"
                  value={parseInt(config.layout.containerWidth)}
                  onChange={(e) => setLayout("containerWidth", `${e.target.value}px`)}
                  className="w-full"
                />
              </div>

              {/* Grid Gap Preview */}
              <div className="mb-6">
                <label className={labelCls} style={fs}>Grid Gap: {config.layout.gridGap}</label>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="4"
                  value={parseInt(config.layout.gridGap)}
                  onChange={(e) => setLayout("gridGap", `${e.target.value}px`)}
                  className="w-full"
                />
              </div>

              {/* Border Radius Preview */}
              <div className="mb-6">
                <label className={labelCls} style={fs}>Border Radius: {config.layout.borderRadius}</label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="2"
                  value={parseInt(config.layout.borderRadius)}
                  onChange={(e) => setLayout("borderRadius", `${e.target.value}px`)}
                  className="w-full"
                />
              </div>

              {/* Works Grid Preview */}
              <div className="mb-6">
                <label className={labelCls} style={fs}>Works Grid: {config.layout.worksGridCols} columns</label>
                <input
                  type="range"
                  min="2"
                  max="4"
                  step="1"
                  value={config.layout.worksGridCols}
                  onChange={(e) => setLayout("worksGridCols", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Live Preview Box */}
              <div className="border border-rule overflow-hidden" style={{ background: config.colors.black }}>
                {/* Header */}
                <div className="border-b border-rule px-4 py-3 flex items-center justify-between" style={{ height: config.layout.headerHeight }}>
                  <div className="flex items-center gap-4">
                    <span className="dis" style={{ fontFamily: `'${config.fonts.display}', sans-serif`, fontSize: "1rem", color: config.colors.white }}>{config.site.name}</span>
                    <span className="lab hidden md:inline" style={{ fontSize: "0.55rem", color: config.colors.grey }}>Works · Journal · About</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="lab text-xs" style={{ fontSize: "0.55rem", color: config.colors.signal }}>Available</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4" style={{ maxWidth: config.layout.containerWidth, margin: "0 auto" }}>
                  {/* Hero Statement */}
                  <div className="py-12">
                    <span className="lab" style={{ fontSize: "0.5rem", color: config.colors.signal }}>FAC.01 — Hero</span>
                    <h1 className="dis mt-2" style={{ fontFamily: `'${config.fonts.display}', sans-serif`, fontSize: "clamp(2rem, 8vw, 6rem)", lineHeight: 0.9, color: config.colors.white }}>
                      Making Ideas<br/><span style={{ color: config.colors.signal }}>Visible</span>
                    </h1>
                    <p className="lab mt-4" style={{ fontFamily: `'${config.fonts.body}', sans-serif`, fontSize: "0.8rem", color: config.colors.grey }}>
                      5 years across 3D, motion, illustration, and identity.
                    </p>
                  </div>

                  {/* Works Grid */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="lab" style={{ fontSize: "0.55rem", color: config.colors.white }}>Selected Works</span>
                      <span className="lab" style={{ fontSize: "0.5rem", color: config.colors.signal }}>FAC.02</span>
                    </div>
                    <div
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${config.layout.worksGridCols}, 1fr)` }}
                    >
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="border transition-all hover:border-signal"
                          style={{
                            borderColor: config.colors.grey,
                            borderRadius: config.layout.borderRadius,
                            padding: config.components.cardPadding,
                            background: "rgba(255,255,255,0.02)"
                          }}
                        >
                          <div className="aspect-video bg-rule mb-3" style={{ borderRadius: config.layout.borderRadius }} />
                          <p className="lab" style={{ fontFamily: `'${config.fonts.heading}', sans-serif`, fontSize: "0.65rem", color: config.colors.white }}>Project Title {i}</p>
                          <p className="lab mt-1" style={{ fontSize: "0.55rem", color: config.colors.grey }}>Category · 2024</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Journal Grid */}
                  <div className="mt-12">
                    <div className="flex items-center justify-between mb-4">
                      <span className="lab" style={{ fontSize: "0.55rem", color: config.colors.white }}>Journal</span>
                      <span className="lab" style={{ fontSize: "0.5rem", color: config.colors.signal }}>FAC.03</span>
                    </div>
                    <div
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${config.layout.worksGridCols === 4 ? 3 : config.layout.worksGridCols}, 1fr)` }}
                    >
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="border"
                          style={{
                            borderColor: config.colors.grey,
                            borderRadius: config.layout.borderRadius,
                            padding: config.components.cardPadding,
                            background: "rgba(255,255,255,0.02)"
                          }}
                        >
                          <span className="lab" style={{ fontSize: "0.5rem", color: config.colors.signal }}>2024.0{i}</span>
                          <p className="lab mt-2" style={{ fontFamily: `'${config.fonts.heading}', sans-serif`, fontSize: "0.75rem", color: config.colors.white }}>Journal Entry Title</p>
                          <p className="lab mt-1" style={{ fontSize: "0.55rem", color: config.colors.grey }}>Brief excerpt of the journal entry goes here...</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-rule px-4 py-6 mt-8" style={{ maxWidth: config.layout.containerWidth, margin: "0 auto" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="lab" style={{ fontFamily: `'${config.fonts.accent}', monospace`, fontSize: "0.55rem", color: config.colors.grey }}>rizkyirawan0404@gmail.com</p>
                      <p className="lab mt-1" style={{ fontSize: "0.5rem", color: config.colors.grey }}>Indonesia · UTC +7</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="lab" style={{ fontSize: "0.55rem", color: config.colors.signal }}>Instagram</span>
                      <span className="lab" style={{ fontSize: "0.55rem", color: config.colors.grey }}>Behance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 04 — COMPONENTS                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "components" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>Components</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Style buttons, cards, badges, and form elements</p>
              </div>
              <button onClick={resetComponents} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset to Saved
              </button>
            </div>

            {/* Component Presets */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>00 — Component Style Presets</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Complete component styling presets. Click to apply all styles at once.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {COMPONENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setComponent("buttonStyle", preset.buttonStyle);
                      setComponent("cardStyle", preset.cardStyle);
                      setComponent("badgeStyle", preset.badgeStyle);
                      setComponent("inputStyle", preset.inputStyle);
                      setComponent("borderRadius", preset.buttonStyle === "brutal" ? "0px" : preset.buttonStyle === "retro" ? "8px" : "4px");
                      setComponent("shadowStyle", preset.buttonStyle === "neon" ? "glow" : "none");
                    }}
                    className="flex flex-col items-center gap-2 border p-4 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: config.components.buttonStyle === preset.buttonStyle ? config.colors.signal : "rgba(240,240,238,0.1)",
                      background: config.components.buttonStyle === preset.buttonStyle ? `${config.colors.signal}10` : "transparent",
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="h-4 w-8 border" style={{ borderRadius: preset.buttonStyle === "brutal" ? "0" : "4px", background: config.colors.signal }} />
                      <div className="h-4 w-4 border" style={{ borderRadius: preset.buttonStyle === "brutal" ? "0" : "4px" }} />
                    </div>
                    <span className="lab text-white/60" style={{ fontSize: "0.55rem" }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Buttons</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Style buttons and interactive elements.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Button Style</label>
                  <select
                    className={selectCls}
                    style={fs}
                    value={config.components.buttonStyle}
                    onChange={(e) => setComponent("buttonStyle", e.target.value)}
                  >
                    <option value="bordered">Solid Fill</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                    <option value="brutal">Brutalist</option>
                    <option value="cyber">Cyber</option>
                    <option value="neon">Neon Glow</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Overall button appearance style</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Border Radius: {config.components.borderRadius}</label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="2"
                    value={parseInt(config.components.borderRadius)}
                    onChange={(e) => setComponent("borderRadius", `${e.target.value}px`)}
                    className="w-full"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Corner roundness for buttons</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Button Padding</label>
                  <input
                    type="text"
                    value={config.components.buttonPadding}
                    onChange={(e) => setComponent("buttonPadding", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="12px 24px"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Internal padding (vertical horizontal)</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Button Font Weight</label>
                  <select className={selectCls} style={fs}>
                    <option>Normal (400)</option>
                    <option>Medium (500)</option>
                    <option>Semi Bold (600)</option>
                    <option>Bold (700)</option>
                  </select>
                </div>
              </div>

              {/* Button Preview */}
              <div className="mt-6 p-5 border border-rule" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="lab text-white/30 mb-3" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Preview</p>
                <div className="flex flex-wrap gap-3">
                  <button className="border px-5 py-2.5 lab transition-colors" style={{ fontSize: "0.6rem", color: config.colors.white, borderColor: config.colors.signal, background: config.colors.signal }}>
                    Primary Solid
                  </button>
                  <button className="border px-5 py-2.5 lab transition-colors" style={{ fontSize: "0.6rem", color: config.colors.signal, borderColor: config.colors.signal }}>
                    Primary Outline
                  </button>
                  <button className="border border-white/20 px-5 py-2.5 lab text-white/70 hover:text-white hover:border-white transition-colors" style={{ fontSize: "0.6rem" }}>
                    Secondary
                  </button>
                  <button className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>
                    Text Link →
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>02 — Cards</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Style project cards and content cards.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Card Style</label>
                  <select
                    className={selectCls}
                    style={fs}
                    value={config.components.cardStyle}
                    onChange={(e) => setComponent("cardStyle", e.target.value)}
                  >
                    <option value="bordered">Solid border</option>
                    <option value="glow">Glow on hover</option>
                    <option value="none">No border</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Card border appearance</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Card Padding</label>
                  <input
                    type="text"
                    value={config.components.cardPadding}
                    onChange={(e) => setComponent("cardPadding", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="20px"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Internal padding of cards</p>
                </div>
              </div>

              {/* Card Preview */}
              <div className="mt-6 p-5 border border-rule" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="lab text-white/30 mb-3" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Preview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="border p-4 transition-all hover:border-signal"
                    style={{
                      background: config.colors.black,
                      borderRadius: config.components.borderRadius,
                    }}
                  >
                    <div className="aspect-video bg-rule mb-3" style={{ borderRadius: config.components.borderRadius }} />
                    <p className="lab text-white" style={{ fontSize: "0.65rem" }}>Project Title</p>
                    <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Category · 2024</p>
                  </div>
                  <div
                    className="border p-4 transition-all hover:border-signal"
                    style={{
                      background: config.colors.black,
                      borderRadius: config.components.borderRadius,
                    }}
                  >
                    <div className="aspect-video bg-rule mb-3" style={{ borderRadius: config.components.borderRadius }} />
                    <p className="lab text-white" style={{ fontSize: "0.65rem" }}>Project Title</p>
                    <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Category · 2024</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>03 — Badges & Tags</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Style tags, badges, and labels.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Badge Style</label>
                  <select className={selectCls} style={fs}>
                    <option>Solid</option>
                    <option>Outline</option>
                    <option>Glow</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Badge Border Radius</label>
                  <input type="text" defaultValue="4px" className={inputCls} style={fs} placeholder="4px, 9999px" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="lab px-3 py-1" style={{ fontSize: "0.55rem", color: config.colors.signal, background: `${config.colors.signal}20` }}>
                  Featured
                </span>
                <span className="lab px-3 py-1" style={{ fontSize: "0.55rem", color: config.colors.white, background: "rgba(255,255,255,0.1)" }}>
                  Draft
                </span>
                <span className="lab px-3 py-1 border" style={{ fontSize: "0.55rem", color: config.colors.grey, borderColor: config.colors.grey }}>
                  3D
                </span>
                <span className="lab px-3 py-1" style={{ fontSize: "0.55rem", color: config.colors.white, background: "rgba(255,255,255,0.05)" }}>
                  Animation
                </span>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>04 — Form Elements</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Style inputs, selects, and textareas.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Input Border Style</label>
                  <select className={selectCls} style={fs}>
                    <option>Solid</option>
                    <option>Dashed</option>
                    <option>None</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Input Focus Color</label>
                  <select className={selectCls} style={fs}>
                    <option>Signal (accent)</option>
                    <option>White</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Input Height</label>
                  <input type="text" defaultValue="44px" className={inputCls} style={fs} placeholder="44px" />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Input Border Radius</label>
                  <input type="text" defaultValue="4px" className={inputCls} style={fs} placeholder="4px" />
                </div>
              </div>

              {/* Input Preview */}
              <div className="mt-6 p-5 border border-rule space-y-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="lab text-white/30 mb-2" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>Preview</p>
                <input type="text" placeholder="Text input" className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors" style={{ fontSize: "0.6rem" }} />
                <textarea placeholder="Textarea" rows={3} className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors resize-none" style={{ fontSize: "0.6rem" }} />
                <select className="w-full bg-black border border-rule px-4 py-3 lab text-white focus:outline-none focus:border-signal transition-colors" style={{ fontSize: "0.6rem" }}>
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 05 — HERO                                                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "hero" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>Hero</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Configure your homepage hero section</p>
              </div>
              <button onClick={resetHero} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset Hero
              </button>
            </div>

            {/* Hero Style Presets */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>00 — Hero Style Presets</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Click to apply hero style. Watch the preview update instantly.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HERO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setHeroStyle({
                      selectedPreset: preset.name,
                      statementSize: preset.statementSize,
                      statementAlign: preset.statementAlign as "left" | "center" | "right",
                      showImage: preset.showImage,
                      imageOverlay: preset.imageOverlay,
                    })}
                    className="flex flex-col items-center gap-2 border p-4 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: heroStyle.selectedPreset === preset.name ? config.colors.signal : "rgba(240,240,238,0.1)",
                      background: heroStyle.selectedPreset === preset.name ? `${config.colors.signal}10` : "transparent",
                    }}
                  >
                    <div className="w-full aspect-video bg-dim border border-rule rounded flex flex-col items-center justify-center gap-1 p-2 relative overflow-hidden">
                      {preset.showImage && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />}
                      <span className="dis text-white relative z-10" style={{ fontSize: preset.name === "Statement Only" ? "0.8rem" : "0.6rem", lineHeight: 1 }}>TEXT</span>
                      {preset.showImage && <span className="lab text-white/40 relative z-10" style={{ fontSize: "0.4rem" }}>IMAGE</span>}
                    </div>
                    <span className="lab text-white/60" style={{ fontSize: "0.55rem" }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Hero Statement</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>The main statement displayed on your homepage (FAC.02 section). This is the large display text that defines your brand.</p>
              <div>
                <label className={labelCls} style={fs}>Statement Text</label>
                <textarea
                  rows={3}
                  value={config.hero.statement}
                  onChange={(e) => setHero("statement", e.target.value)}
                  className={textareaCls}
                  style={{ ...fs, resize: "vertical" }}
                  placeholder="Working at the frequency between signal and silence."
                />
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleGenerateStatement}
                    disabled={generatingStatement}
                    className="border border-signal/40 text-signal hover:bg-signal/10 px-3 py-1.5 lab transition-colors disabled:opacity-40"
                    style={{ fontSize: "0.55rem" }}
                  >
                    {generatingStatement ? "◆ Generating..." : "◆ Generate with AI"}
                  </button>
                  {genMsg && <span className="lab text-white/40" style={{ fontSize: "0.55rem" }}>{genMsg}</span>}
                </div>
                <p className="lab text-white/20 mt-2" style={{ fontSize: "0.5rem" }}>This is the large display text on your homepage. Keep it impactful and concise.</p>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>02 — Bio / Tagline</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Short biography shown below the statement. Describe your expertise and focus areas.</p>
              <div>
                <label className={labelCls} style={fs}>Bio Text</label>
                <textarea
                  rows={4}
                  value={config.hero.bio}
                  onChange={(e) => setHero("bio", e.target.value)}
                  className={textareaCls}
                  style={{ ...fs, resize: "vertical" }}
                  placeholder="5 years across 3D, motion, illustration, and identity."
                />
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleGenerateBio}
                    disabled={generatingBio}
                    className="border border-signal/40 text-signal hover:bg-signal/10 px-3 py-1.5 lab transition-colors disabled:opacity-40"
                    style={{ fontSize: "0.55rem" }}
                  >
                    {generatingBio ? "◆ Generating..." : "◆ Generate with AI"}
                  </button>
                </div>
                <p className="lab text-white/20 mt-2" style={{ fontSize: "0.5rem" }}>Aim for 1-2 sentences that complement your statement.</p>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>03 — Availability Badge</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Text shown in the availability badge on your site header. Shows clients that you're open to work.</p>
              <div>
                <label className={labelCls} style={fs}>Available Text</label>
                <input
                  type="text"
                  value={config.hero.availableText}
                  onChange={(e) => setHero("availableText", e.target.value)}
                  className={inputCls}
                  style={fs}
                  placeholder="Available for Work"
                />
                <p className="lab text-white/20 mt-2" style={{ fontSize: "0.5rem" }}>Changes to "Not Available" should be done manually when you're fully booked.</p>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>04 — Hero Image</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Background image for the hero section. Shown behind the name and statement with parallax effect.</p>
              <ImageUpload
                value={config.hero.heroImage}
                onChange={(url) => setHero("heroImage", url)}
                category="hero"
                placeholder="/images/works/phantom-in-the-ruins/01.jpg"
                inputClassName={inputCls}
                style={fs}
              />
            </div>

            {/* Live Preview */}
            <div className="border border-signal p-5" style={{ background: config.colors.black }}>
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>05 — Live Preview</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Watch your hero section update as you change settings.</p>

              {/* Hero Preview */}
              <div className="relative overflow-hidden border border-rule" style={{ minHeight: "300px", background: config.colors.black }}>
                {/* Background Image */}
                {heroStyle.showImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: "url(/images/works/phantom-in-the-ruins/01.jpg)",
                      opacity: heroStyle.imageOverlay,
                    }}
                  />
                )}
                {heroStyle.showImage && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />}

                {/* Content */}
                <div className="relative p-8 md:p-12" style={{ textAlign: heroStyle.statementAlign as "left" | "center" | "right" }}>
                  <span className="lab text-white/40 mb-4 block" style={{ fontSize: "0.5rem" }}>FAC.02 — Hero</span>
                  <h1
                    style={{
                      fontFamily: `'${config.fonts.display}', sans-serif`,
                      fontSize: heroStyle.statementSize,
                      lineHeight: 0.88,
                      color: config.colors.white,
                    }}
                  >
                    {config.hero.statement.split(" ").slice(0, 4).join(" ") || "Your Hero"}
                  </h1>
                  <p
                    className="mt-4"
                    style={{
                      fontFamily: `'${config.fonts.body}', sans-serif`,
                      fontSize: "clamp(0.8rem, 2vw, 1rem)",
                      color: config.colors.grey,
                    }}
                  >
                    {config.hero.bio || "Your bio text here"}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: config.colors.signal }} />
                    <span className="lab" style={{ fontSize: "0.6rem", color: config.colors.signal }}>{config.hero.availableText}</span>
                  </div>
                </div>
              </div>

              {/* Preview Controls */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="border border-rule p-2 text-center">
                  <p className="lab text-white/30" style={{ fontSize: "0.45rem" }}>Preset</p>
                  <p className="lab text-white" style={{ fontSize: "0.55rem" }}>{heroStyle.selectedPreset}</p>
                </div>
                <div className="border border-rule p-2 text-center">
                  <p className="lab text-white/30" style={{ fontSize: "0.45rem" }}>Alignment</p>
                  <p className="lab text-white" style={{ fontSize: "0.55rem" }}>{heroStyle.statementAlign}</p>
                </div>
                <div className="border border-rule p-2 text-center">
                  <p className="lab text-white/30" style={{ fontSize: "0.45rem" }}>Image BG</p>
                  <p className="lab text-white" style={{ fontSize: "0.55rem" }}>{heroStyle.showImage ? "Yes" : "No"}</p>
                </div>
                <div className="border border-rule p-2 text-center">
                  <p className="lab text-white/30" style={{ fontSize: "0.45rem" }}>Overlay</p>
                  <p className="lab text-white" style={{ fontSize: "0.55rem" }}>{Math.round(heroStyle.imageOverlay * 100)}%</p>
                </div>
              </div>
            </div>

            {/* Hero Settings */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>06 — Hero Display Settings</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Fine-tune the hero section. Changes show instantly in the preview above.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Statement Size</label>
                  <select
                    className={selectCls}
                    style={fs}
                    value={heroStyle.statementSize}
                    onChange={(e) => setHeroStyle(prev => ({ ...prev, statementSize: e.target.value, selectedPreset: "Custom" }))}
                  >
                    <option value="clamp(2rem, 6vw, 5rem)">Compact — Good for minimal layouts</option>
                    <option value="clamp(2.5rem, 8vw, 8rem)">Medium — Balanced for most sites</option>
                    <option value="clamp(3rem, 10vw, 12rem)">Large — Impactful statement</option>
                    <option value="clamp(4rem, 15vw, 18rem)">Massive — Full impact hero</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Controls how big the hero text appears</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Statement Alignment</label>
                  <select
                    className={selectCls}
                    style={fs}
                    value={heroStyle.statementAlign}
                    onChange={(e) => setHeroStyle(prev => ({ ...prev, statementAlign: e.target.value as "left" | "center" | "right", selectedPreset: "Custom" }))}
                  >
                    <option value="left">Left — Classic, editorial feel</option>
                    <option value="center">Center — Modern, centered focus</option>
                    <option value="right">Right — Asymmetric balance</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Horizontal text alignment in hero</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Background Image</label>
                  <select
                    className={selectCls}
                    style={fs}
                    value={heroStyle.showImage ? "yes" : "no"}
                    onChange={(e) => setHeroStyle(prev => ({ ...prev, showImage: e.target.value === "yes", selectedPreset: "Custom" }))}
                  >
                    <option value="yes">Show background image</option>
                    <option value="no">No background (solid color)</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Toggle hero background image</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Image Overlay: {Math.round(heroStyle.imageOverlay * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={heroStyle.imageOverlay * 100}
                    onChange={(e) => setHeroStyle(prev => ({ ...prev, imageOverlay: parseInt(e.target.value) / 100, selectedPreset: "Custom" }))}
                    className="w-full"
                    disabled={!heroStyle.showImage}
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Darkness of overlay on background image</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Hero Vertical Padding</label>
                  <input type="text" defaultValue="120px" className={inputCls} style={fs} placeholder="120px" />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Space above and below hero content</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Animation on Load</label>
                  <select className={selectCls} style={fs}>
                    <option>Fade in — Smooth fade transition</option>
                    <option>Slide up — Content slides up</option>
                    <option>None — No animation</option>
                  </select>
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Entrance animation for hero elements</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 06 — FAVICON                                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "favicon" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>Favicon</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Your website icon shown in browser tabs</p>
              </div>
              <button onClick={resetFavicon} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset to Saved
              </button>
            </div>
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Favicon Upload</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Upload a favicon for your website. Recommended: 32x32 or 64x64 PNG. Can also use SVG or ICO.</p>

              <div className="flex items-start gap-6">
                <div className="shrink-0">
                  {config.favicon ? (
                    <div className="relative">
                      <img src={config.favicon} alt="Favicon" className="w-24 h-24 border border-rule object-contain" style={{ background: config.colors.white }} />
                      <button
                        onClick={() => setConfig((prev) => ({ ...prev, favicon: "" }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border border-rule flex items-center justify-center" style={{ background: config.colors.black }}>
                      <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>No favicon</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="border border-signal px-6 py-4 hover:bg-signal transition-colors cursor-pointer inline-block">
                    <span className="lab text-white hover:text-black" style={{ fontSize: "0.6rem" }}>
                      {uploadingFavicon ? "Uploading..." : "Upload Favicon"}
                    </span>
                    <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                  </label>
                  <p className="lab text-white/30 mt-3" style={{ fontSize: "0.5rem" }}>Or paste a URL below:</p>
                  <input
                    type="text"
                    value={config.favicon}
                    onChange={(e) => setConfig((prev) => ({ ...prev, favicon: e.target.value }))}
                    className={`${inputCls} mt-2`}
                    style={fs}
                    placeholder="/images/favicon.png"
                  />
                </div>
              </div>
            </div>

            {/* Browser Preview */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>02 — Browser Preview</h3>
              <div className="flex gap-6 items-center">
                <div className="flex items-center gap-3 p-4 border border-rule">
                  <img src={config.favicon || "/favicon.ico"} alt="" className="w-8 h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="lab text-white/50" style={{ fontSize: "0.6rem" }}>Browser Tab</span>
                </div>
                <div className="flex items-center gap-3 p-4 border border-rule">
                  <img src={config.favicon || "/favicon.ico"} alt="" className="w-6 h-6" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="lab text-white/50" style={{ fontSize: "0.6rem" }}>Bookmark</span>
                </div>
              </div>
            </div>

            {/* Favicon Guidelines */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>03 — Favicon Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="border border-rule p-4">
                  <p className="text-white/40 mb-2" style={{ fontSize: "0.55rem", textTransform: "uppercase" }}>Recommended Formats</p>
                  <p className="text-white/30" style={{ fontSize: "0.58rem", lineHeight: 1.6 }}>• PNG: 32x32 or 64x64 px<br/>• ICO: Multi-resolution<br/>• SVG: Scalable, modern<br/>• Avoid: JPEG, GIF</p>
                </div>
                <div className="border border-rule p-4">
                  <p className="text-white/40 mb-2" style={{ fontSize: "0.55rem", textTransform: "uppercase" }}>Best Practices</p>
                  <p className="text-white/30" style={{ fontSize: "0.58rem", lineHeight: 1.6 }}>• Simple, recognizable design<br/>• Works at small sizes<br/>• High contrast<br/>• Use your brand mark</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 07 — SITE INFO                                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "site" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>Site Info</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Your identity and contact information</p>
              </div>
              <button onClick={resetSite} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset Site Info
              </button>
            </div>
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Identity</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Basic information about yourself or your brand.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {([
                  ["name", "Your Name", "Your full name or brand name"],
                  ["role", "Role / Title", "How you describe yourself professionally"],
                  ["tagline", "Site Tagline", "Short descriptor shown in header/logo area"],
                ] as [keyof DesignConfig["site"], string, string][]).map(([key, label, desc]) => (
                  <div key={key}>
                    <label className={labelCls} style={fs}>{label}</label>
                    <input
                      type="text"
                      value={config.site[key]}
                      onChange={(e) => setSite(key, e.target.value)}
                      className={inputCls}
                      style={fs}
                    />
                    <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>02 — Contact Information</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Contact details shown on your site.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {([
                  ["email", "Contact Email", "rizkyirawan0404@gmail.com"],
                  ["location", "Location", "City, Country"],
                  ["timezone", "Timezone", "UTC +7"],
                  ["established", "Established Year", "2017"],
                ] as [keyof DesignConfig["site"], string, string][]).map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label className={labelCls} style={fs}>{label}</label>
                    <input
                      type="text"
                      value={config.site[key]}
                      onChange={(e) => setSite(key, e.target.value)}
                      className={inputCls}
                      style={fs}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>03 — Preview</h3>
              <div className="p-6 border border-rule" style={{ background: config.colors.black }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dis" style={{ fontFamily: `'${config.fonts.display}', sans-serif`, fontSize: "1.5rem", color: config.colors.white }}>{config.site.name}</p>
                    <p className="lab" style={{ fontSize: "0.6rem", color: config.colors.grey }}>{config.site.role} · {config.site.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="lab" style={{ fontSize: "0.55rem", color: config.colors.grey }}>{config.site.location}</p>
                    <p className="lab" style={{ fontSize: "0.55rem", color: config.colors.grey }}>{config.site.timezone}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 08 — SOCIAL                                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "social" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>Social Links</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Your social media profile URLs</p>
              </div>
              <button onClick={resetSocial} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset Social
              </button>
            </div>

            {/* Social Display Presets */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>00 — Display Style Presets</h3>
              <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Choose how social links appear on your site.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {SOCIAL_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSocialStyle({
                      selectedPreset: preset.name,
                      style: preset.style,
                      size: preset.size as "small" | "medium" | "large",
                    })}
                    className="flex flex-col items-center gap-2 border p-4 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: socialStyle.selectedPreset === preset.name ? config.colors.signal : "rgba(240,240,238,0.1)",
                      background: socialStyle.selectedPreset === preset.name ? `${config.colors.signal}10` : "transparent",
                    }}
                  >
                    <div className="flex gap-2">
                      {preset.style === "icon" && (
                        <>
                          <div className="w-5 h-5 rounded-full border border-rule" />
                          <div className="w-5 h-5 rounded-full border border-rule" />
                        </>
                      )}
                      {preset.style === "full" && (
                        <>
                          <div className="h-5 w-12 border border-rule" />
                          <div className="h-5 w-12 border border-rule" />
                        </>
                      )}
                      {preset.style === "display" && (
                        <>
                          <div className="h-6 w-8 border border-rule" />
                          <div className="h-6 w-8 border border-rule" />
                        </>
                      )}
                      {preset.style === "text" && (
                        <>
                          <div className="h-3 w-8 border-b border-rule" />
                          <div className="h-3 w-8 border-b border-rule" />
                        </>
                      )}
                      {preset.style === "circle" && (
                        <>
                          <div className="w-6 h-6 rounded-full border-2 border-rule" />
                          <div className="w-6 h-6 rounded-full border-2 border-rule" />
                        </>
                      )}
                    </div>
                    <span className="lab text-white/60" style={{ fontSize: "0.55rem" }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Social Media Links</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Enter the full URLs to your social media profiles. These appear in the footer and contact sections.</p>

              {([
                ["instagram", "Instagram URL", "Your Instagram profile link", "https://instagram.com/yourusername"],
                ["behance", "Behance URL", "Your Behance portfolio link", "https://behance.net/yourusername"],
                ["linkedin", "LinkedIn URL", "Your LinkedIn profile link", "https://linkedin.com/in/yourprofile"],
              ] as [keyof DesignConfig["social"], string, string, string][]).map(([key, label, desc, placeholder]) => (
                <div key={key} className="mb-4 last:mb-0">
                  <label className={labelCls} style={fs}>{label}</label>
                  <input
                    type="url"
                    value={config.social[key]}
                    onChange={(e) => setSocial(key, e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder={placeholder}
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* Social Icon Preview */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>02 — Preview</h3>
              <div className="flex gap-4">
                {config.social.instagram && (
                  <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" className="border border-rule px-4 py-2 lab text-white/50 hover:text-white hover:border-signal transition-colors" style={{ fontSize: "0.6rem" }}>
                    Instagram ↗
                  </a>
                )}
                {config.social.behance && (
                  <a href={config.social.behance} target="_blank" rel="noopener noreferrer" className="border border-rule px-4 py-2 lab text-white/50 hover:text-white hover:border-signal transition-colors" style={{ fontSize: "0.6rem" }}>
                    Behance ↗
                  </a>
                )}
                {config.social.linkedin && (
                  <a href={config.social.linkedin} target="_blank" rel="noopener noreferrer" className="border border-rule px-4 py-2 lab text-white/50 hover:text-white hover:border-signal transition-colors" style={{ fontSize: "0.6rem" }}>
                    LinkedIn ↗
                  </a>
                )}
                {!config.social.instagram && !config.social.behance && !config.social.linkedin && (
                  <p className="lab text-white/30" style={{ fontSize: "0.6rem" }}>No social links configured</p>
                )}
              </div>
            </div>

            {/* Available Social Platforms */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>03 — Supported Platforms</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Instagram", "Behance", "LinkedIn", "Twitter/X", "Dribbble", "ArtStation", "YouTube", "Vimeo"].map((platform) => (
                  <div key={platform} className="border border-rule p-3 text-center">
                    <p className="lab text-white/40" style={{ fontSize: "0.55rem" }}>{platform}</p>
                  </div>
                ))}
              </div>
              <p className="lab text-white/20 mt-3" style={{ fontSize: "0.52rem" }}>Need a platform added? Request it in the comments.</p>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 09 — SEO META                                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "meta" && (
          <section className="space-y-8">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dis text-white" style={{ fontSize: "1.2rem" }}>SEO Meta</h2>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Search engine and social sharing settings</p>
              </div>
              <button onClick={resetMeta} className="border border-rule px-4 py-2 lab text-white/40 hover:text-white hover:border-white/30 transition-colors" style={{ fontSize: "0.55rem" }}>
                Reset SEO
              </button>
            </div>
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — SEO Meta Tags</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Default meta information used across the site for search engines and social sharing.</p>

              <div className="space-y-6">
                <div>
                  <label className={labelCls} style={fs}>Default Title</label>
                  <input
                    type="text"
                    value={config.meta.title}
                    onChange={(e) => setMeta("title", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="Rizky Irawan — Visual Archive"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Used in browser tab and search results (50-60 characters recommended)</p>
                </div>

                <div>
                  <label className={labelCls} style={fs}>Default Description</label>
                  <textarea
                    rows={3}
                    value={config.meta.description}
                    onChange={(e) => setMeta("description", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Visual archive of works in 3D, motion, illustration, and graphic design..."
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Shown in search results (150-160 characters recommended)</p>
                </div>

                <div>
                  <label className={labelCls} style={fs}>Keywords</label>
                  <input
                    type="text"
                    value={config.meta.keywords}
                    onChange={(e) => setMeta("keywords", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="3D, Animation, Illustration, Graphic Design, Motion"
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Comma-separated keywords relevant to your work</p>
                </div>

                <div>
                  <ImageUpload
                    label="Default OG Image URL"
                    value={config.meta.ogImage}
                    onChange={(url) => setMeta("ogImage", url)}
                    category="general"
                    placeholder="https://yoursite.com/images/og-image.jpg"
                    inputClassName={inputCls}
                    style={fs}
                  />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Shown when sharing on social media (recommended: 1200x630px)</p>
                </div>
              </div>
            </div>

            {/* SEO Tips */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>02 — SEO Best Practices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="border border-rule p-4">
                  <p className="text-white/40 mb-2" style={{ fontSize: "0.55rem", textTransform: "uppercase" }}>Title Tag Tips</p>
                  <p className="text-white/30" style={{ fontSize: "0.58rem", lineHeight: 1.6 }}>• Keep it under 60 characters<br/>• Include your name or brand<br/>• Put important keywords first<br/>• Make it compelling</p>
                </div>
                <div className="border border-rule p-4">
                  <p className="text-white/40 mb-2" style={{ fontSize: "0.55rem", textTransform: "uppercase" }}>Meta Description Tips</p>
                  <p className="text-white/30" style={{ fontSize: "0.58rem", lineHeight: 1.6 }}>• Keep it under 160 characters<br/>• Include a call to action<br/>• Describe your unique value<br/>• Add relevant keywords</p>
                </div>
              </div>
            </div>

            {/* Open Graph Preview */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>03 — Social Share Preview</h3>
              <div className="max-w-md border border-rule overflow-hidden" style={{ background: config.colors.white }}>
                {config.meta.ogImage && (
                  <div className="aspect-video bg-rule" style={{ background: `${config.colors.grey}40` }} />
                )}
                <div className="p-4">
                  <p className="lab text-white/30" style={{ fontSize: "0.5rem", textTransform: "uppercase" }}>yoursite.com</p>
                  <p className="lab mt-1" style={{ fontSize: "0.8rem", color: config.colors.black }}>{config.meta.title || "Your Page Title"}</p>
                  <p className="lab text-white/30 mt-1" style={{ fontSize: "0.6rem" }}>{config.meta.description || "Your page description will appear here..."}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 10 — ADVANCED                                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "advanced" && (
          <section className="space-y-8">
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>01 — Custom CSS</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Add custom CSS for advanced styling that goes beyond the options above.</p>
              <textarea
                rows={8}
                className={textareaCls}
                style={{ ...fs, fontFamily: "'IBM Plex Mono', monospace" }}
                placeholder={`/* Example: Custom button style */\n.btn-custom {\n  background: var(--color-signal);\n  border-radius: 8px;\n}`}
              />
              <p className="lab text-white/20 mt-2" style={{ fontSize: "0.5rem" }}>Use CSS variables: --color-signal, --color-black, --color-white, --color-grey</p>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>02 — Animation Settings</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Configure default animations and transitions.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Default Animation</label>
                  <select className={selectCls} style={fs}>
                    {ANIMATION_PRESETS.map((a) => (
                      <option key={a.value} value={a.value}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Animation Duration</label>
                  <input type="text" defaultValue="300ms" className={inputCls} style={fs} placeholder="300ms" />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Hover Transition</label>
                  <input type="text" defaultValue="200ms" className={inputCls} style={fs} placeholder="200ms" />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Easing</label>
                  <select className={selectCls} style={fs}>
                    <option>ease</option>
                    <option>ease-in</option>
                    <option>ease-out</option>
                    <option>ease-in-out</option>
                    <option>linear</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>03 — Particle / Background Effects</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Configure background effects on the homepage.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Particle Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={config.colors.signal} onChange={(e) => setColor("signal", e.target.value)} className="h-10 w-16 border border-rule bg-transparent cursor-pointer p-1" />
                    <span className="lab text-white/50" style={{ fontSize: "0.6rem" }}>{config.colors.signal}</span>
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Particle Density</label>
                  <select className={selectCls} style={fs}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Particle Speed</label>
                  <select className={selectCls} style={fs}>
                    <option>Slow</option>
                    <option>Normal</option>
                    <option>Fast</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Background Noise</label>
                  <select className={selectCls} style={fs}>
                    <option>Subtle</option>
                    <option>None</option>
                    <option>Strong</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-1" style={{ fontSize: "0.7rem" }}>04 — Loading & Performance</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Fine-tune how the site loads and performs.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Page Transition</label>
                  <select className={selectCls} style={fs}>
                    <option>Fade</option>
                    <option>Slide</option>
                    <option>None</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Image Loading</label>
                  <select className={selectCls} style={fs}>
                    <option>Lazy (recommended)</option>
                    <option>Eager</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Preload Fonts</label>
                  <select className={selectCls} style={fs}>
                    <option>Display & Heading only</option>
                    <option>All fonts</option>
                    <option>None</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Cache Policy</label>
                  <select className={selectCls} style={fs}>
                    <option>Aggressive (recommended)</option>
                    <option>Conservative</option>
                    <option>None</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-4" style={{ fontSize: "0.7rem" }}>05 — Reset & Export</h3>
              <div className="flex flex-wrap gap-3">
                <button className="border border-rule px-4 py-2 lab text-white/50 hover:text-white hover:border-white transition-colors" style={{ fontSize: "0.55rem" }}>
                  Export Current Config
                </button>
                <button className="border border-rule px-4 py-2 lab text-white/50 hover:text-white hover:border-white transition-colors" style={{ fontSize: "0.55rem" }}>
                  Import Config
                </button>
                <button className="border border-red-500/50 px-4 py-2 lab text-red-400 hover:border-red-500 transition-colors" style={{ fontSize: "0.55rem" }}>
                  Reset to Defaults
                </button>
              </div>
              <p className="lab text-white/20 mt-4" style={{ fontSize: "0.52rem" }}>Export your config to back it up or import to restore a previous configuration.</p>
            </div>
          </section>
        )}
      </div>

      {/* Save Bar */}
      <div className="flex items-center gap-4 border-t border-rule pt-6 mt-8">
        <button onClick={save} disabled={isPending}
          className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
          <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>
            {isPending ? "Saving…" : "Save Changes"}
          </span>
        </button>
        {saved && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>Changes published ✓</span>}
        <span className="lab text-white/20 ml-auto" style={{ fontSize: "0.5rem" }}>Last saved: just now</span>
      </div>
    </div>
  );
}
