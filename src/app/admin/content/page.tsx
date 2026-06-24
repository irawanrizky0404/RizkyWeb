"use client";

import { useState, useEffect, useTransition } from "react";
import { updateContent } from "@/app/admin/actions";
import type { PageContent } from "@/lib/store";

const DEFAULT: PageContent = {
  homepage: {
    statement: "Working at the frequency between signal and silence.",
    bio: "5 years across 3D, motion, illustration, and identity.",
    location: "Indonesia",
    established: "2017",
    showFilmStrip: true,
    showWorks: true,
    showCapabilities: true,
    showClients: true,
    showRecognition: true,
    showCta: true,
    ctaText: "Start a Project",
    metaTitle: "",
    metaDescription: "",
  },
  about: {
    intro: "5 years across 3D, motion, illustration, and identity. Every project begins with a feeling, not a brief. Aesthetic leads. Technique follows.",
    storyTitle: "Working at the frequency between signal and silence.",
    story: "Aesthetic leads. Technique follows.",
    approachTitle: "The Approach",
    approach: "Aesthetic leads. Technique follows. I believe in the power of restraint, the importance of negative space, and the emotional resonance of light.",
    imageUrl: "/images/hero/hero-a.jpg",
    metaTitle: "",
    metaDescription: "",
  },
  services: {
    intro: "I offer creative services across 3D visualization, motion design, illustration, and graphic design.",
    outro: "Each project is approached with fresh eyes and careful attention to the specific needs of the brief.",
    metaTitle: "",
    metaDescription: "",
  },
  labs: {
    intro: "Experiments, explorations, and works in progress — a space for creative testing without the pressure of client expectations.",
    metaTitle: "",
    metaDescription: "",
  },
  contact: {
    intro: "Have a project in mind? I'd love to hear about it.",
    email: "rizkyirawan0404@gmail.com",
    location: "Indonesia",
    availability: "Available for new projects",
    metaTitle: "",
    metaDescription: "",
  },
  cv: {
    metaTitle: "",
    metaDescription: "",
  },
};

export default function AdminContent() {
  const [config, setConfig] = useState<PageContent>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"homepage" | "about" | "services" | "labs" | "contact" | "cv">("homepage");

  useEffect(() => {
    setLoaded(false);
    setConfig(DEFAULT);
    fetch("/api/admin/content")
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((d) => {
        if (d && typeof d === "object" && "homepage" in d && "about" in d) {
          setConfig({
            ...DEFAULT,
            ...d,
            homepage: { ...DEFAULT.homepage, ...d.homepage },
            about: { ...DEFAULT.about, ...d.about },
            services: { ...DEFAULT.services, ...d.services },
            labs: { ...DEFAULT.labs, ...d.labs },
            contact: { ...DEFAULT.contact, ...d.contact },
            cv: { ...DEFAULT.cv, ...d.cv },
          });
        } else {
          setConfig(DEFAULT);
        }
        setLoaded(true);
      })
      .catch(() => { setConfig(DEFAULT); setLoaded(true); });
  }, []);

  function setHomepage(key: keyof PageContent["homepage"], value: string | boolean) {
    setConfig((prev) => ({ ...prev, homepage: { ...prev.homepage, [key]: value } }));
  }

  function setAbout(key: keyof PageContent["about"], value: string) {
    setConfig((prev) => ({ ...prev, about: { ...prev.about, [key]: value } }));
  }

  function setServices(key: keyof PageContent["services"], value: string) {
    setConfig((prev) => ({ ...prev, services: { ...prev.services, [key]: value } }));
  }

  function setLabs(key: keyof PageContent["labs"], value: string) {
    setConfig((prev) => ({ ...prev, labs: { ...prev.labs, [key]: value } }));
  }

  function setContact(key: keyof PageContent["contact"], value: string) {
    setConfig((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));
  }

  function setCv(key: keyof PageContent["cv"], value: string) {
    setConfig((prev) => ({ ...prev, cv: { ...prev.cv, [key]: value } }));
  }

  function save() {
    startTransition(async () => {
      await updateContent(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  if (!loaded || !config?.homepage) return <div className="p-8"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  const inputCls = "w-full bg-dim border border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors";
  const textareaCls = "w-full bg-dim border border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors resize-none";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

  const tabs: { id: typeof activeTab; label: string; desc: string }[] = [
    { id: "homepage", label: "Homepage", desc: "FAC.02 statement, sections, CTA" },
    { id: "about", label: "About", desc: "Bio, story, approach" },
    { id: "services", label: "Services", desc: "Intro and outro text" },
    { id: "labs", label: "Labs", desc: "Labs introduction" },
    { id: "contact", label: "Contact", desc: "Contact info and availability" },
    { id: "cv", label: "CV", desc: "SEO meta for CV page" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 border-b border-rule pb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Content</span>
          <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Page Content</h1>
          <p className="lab text-white/30 mt-2" style={{ fontSize: "0.55rem" }}>Edit all page content and SEO settings. Changes apply site-wide.</p>
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

      <div className="flex gap-1 mb-6 border-b border-rule pb-0 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="lab px-4 py-2 transition-colors"
            style={{
              fontSize: "0.6rem",
              color: activeTab === tab.id ? "#080808" : "rgba(240,240,238,0.4)",
              background: activeTab === tab.id ? "#ff3500" : "transparent",
              borderBottom: activeTab === tab.id ? "2px solid #ff3500" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {/* HOMEPAGE TAB */}
        {activeTab === "homepage" && (
          <section className="space-y-8">
            {/* Statement Section */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>01 — FAC.02 Statement</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>The large display text on your homepage.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Statement Text</label>
                  <textarea
                    rows={3}
                    value={config.homepage.statement}
                    onChange={(e) => setHomepage("statement", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Working at the frequency between signal and silence."
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Bio Text</label>
                  <textarea
                    rows={3}
                    value={config.homepage.bio}
                    onChange={(e) => setHomepage("bio", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="5 years across 3D, motion, illustration, and identity."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={fs}>Location</label>
                    <input
                      type="text"
                      value={config.homepage.location}
                      onChange={(e) => setHomepage("location", e.target.value)}
                      className={inputCls}
                      style={fs}
                      placeholder="Indonesia"
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={fs}>Established Year</label>
                    <input
                      type="text"
                      value={config.homepage.established}
                      onChange={(e) => setHomepage("established", e.target.value)}
                      className={inputCls}
                      style={fs}
                      placeholder="2017"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sections Visibility */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>02 — Section Visibility</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Toggle which sections appear on the homepage.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: "showFilmStrip" as const, label: "Film Strip", desc: "Personal works slider" },
                  { key: "showWorks" as const, label: "Works Catalogue", desc: "Featured works grid" },
                  { key: "showCapabilities" as const, label: "Capabilities", desc: "Services overview" },
                  { key: "showClients" as const, label: "Clients", desc: "Client logos" },
                  { key: "showRecognition" as const, label: "Recognition", desc: "Awards section" },
                  { key: "showCta" as const, label: "CTA Section", desc: "Call to action" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start gap-3 p-4 border border-rule">
                    <input
                      type="checkbox"
                      id={`home-${key}`}
                      checked={config.homepage[key]}
                      onChange={(e) => setHomepage(key, e.target.checked)}
                      className="accent-signal mt-0.5"
                    />
                    <div>
                      <label htmlFor={`home-${key}`} className="lab text-white cursor-pointer" style={{ fontSize: "0.6rem" }}>{label}</label>
                      <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>03 — Call to Action</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Text for the CTA button on homepage.</p>
              <div>
                <label className={labelCls} style={fs}>CTA Button Text</label>
                <input
                  type="text"
                  value={config.homepage.ctaText}
                  onChange={(e) => setHomepage("ctaText", e.target.value)}
                  className={inputCls}
                  style={fs}
                  placeholder="Start a Project"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>04 — SEO Meta</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Meta information for search engines.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Meta Title</label>
                  <input
                    type="text"
                    value={config.homepage.metaTitle}
                    onChange={(e) => setHomepage("metaTitle", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="Leave empty to use default"
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Meta Description</label>
                  <textarea
                    rows={2}
                    value={config.homepage.metaDescription}
                    onChange={(e) => setHomepage("metaDescription", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Leave empty to use default"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <section className="space-y-8">
            {/* Intro */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>01 — Introduction</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Main introduction text on the About page.</p>
              <div>
                <label className={labelCls} style={fs}>Intro Paragraph</label>
                <textarea
                  rows={4}
                  value={config.about.intro}
                  onChange={(e) => setAbout("intro", e.target.value)}
                  className={textareaCls}
                  style={{ ...fs, resize: "vertical" }}
                  placeholder="I'm a multidisciplinary visual artist..."
                />
              </div>
            </div>

            {/* Story Section */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>02 — Story Section</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>The Story section with pull quote.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Section Title</label>
                  <input
                    type="text"
                    value={config.about.storyTitle}
                    onChange={(e) => setAbout("storyTitle", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="The Story"
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Story Text</label>
                  <textarea
                    rows={5}
                    value={config.about.story}
                    onChange={(e) => setAbout("story", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Every project begins with a feeling..."
                  />
                </div>
              </div>
            </div>

            {/* Approach Section */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>03 — Approach Section</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Your creative approach/philosophy.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Section Title</label>
                  <input
                    type="text"
                    value={config.about.approachTitle}
                    onChange={(e) => setAbout("approachTitle", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="The Approach"
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Approach Text</label>
                  <textarea
                    rows={5}
                    value={config.about.approach}
                    onChange={(e) => setAbout("approach", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Aesthetic leads. Technique follows..."
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>04 — Hero Image</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Atmospheric image shown between sections.</p>
              <div>
                <label className={labelCls} style={fs}>Image URL</label>
                <input
                  type="text"
                  value={config.about.imageUrl}
                  onChange={(e) => setAbout("imageUrl", e.target.value)}
                  className={inputCls}
                  style={fs}
                  placeholder="/images/hero/hero-a.jpg"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>05 — SEO Meta</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Meta information for search engines.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Meta Title</label>
                  <input
                    type="text"
                    value={config.about.metaTitle}
                    onChange={(e) => setAbout("metaTitle", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="Leave empty to use default"
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Meta Description</label>
                  <textarea
                    rows={2}
                    value={config.about.metaDescription}
                    onChange={(e) => setAbout("metaDescription", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Leave empty to use default"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <section className="space-y-8">
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>01 — Introduction</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Intro text at the top of the Services page.</p>
              <div>
                <label className={labelCls} style={fs}>Intro Text</label>
                <textarea
                  rows={4}
                  value={config.services.intro}
                  onChange={(e) => setServices("intro", e.target.value)}
                  className={textareaCls}
                  style={{ ...fs, resize: "vertical" }}
                  placeholder="I offer creative services across..."
                />
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>02 — Outro</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Outro text at the bottom of the Services page.</p>
              <div>
                <label className={labelCls} style={fs}>Outro Text</label>
                <textarea
                  rows={4}
                  value={config.services.outro}
                  onChange={(e) => setServices("outro", e.target.value)}
                  className={textareaCls}
                  style={{ ...fs, resize: "vertical" }}
                  placeholder="Each project is approached with fresh eyes..."
                />
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>03 — SEO Meta</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Meta information for search engines.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Meta Title</label>
                  <input
                    type="text"
                    value={config.services.metaTitle}
                    onChange={(e) => setServices("metaTitle", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="Leave empty to use default"
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Meta Description</label>
                  <textarea
                    rows={2}
                    value={config.services.metaDescription}
                    onChange={(e) => setServices("metaDescription", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Leave empty to use default"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LABS TAB */}
        {activeTab === "labs" && (
          <section className="space-y-8">
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>01 — Introduction</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Intro text at the top of the Labs page.</p>
              <div>
                <label className={labelCls} style={fs}>Intro Text</label>
                <textarea
                  rows={4}
                  value={config.labs.intro}
                  onChange={(e) => setLabs("intro", e.target.value)}
                  className={textareaCls}
                  style={{ ...fs, resize: "vertical" }}
                  placeholder="Experiments, explorations, and works in progress..."
                />
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>02 — SEO Meta</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Meta information for search engines.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Meta Title</label>
                  <input
                    type="text"
                    value={config.labs.metaTitle}
                    onChange={(e) => setLabs("metaTitle", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="Leave empty to use default"
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Meta Description</label>
                  <textarea
                    rows={2}
                    value={config.labs.metaDescription}
                    onChange={(e) => setLabs("metaDescription", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Leave empty to use default"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <section className="space-y-8">
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>01 — Contact Information</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Displayed on the Contact page.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls} style={fs}>Intro Text</label>
                  <textarea
                    rows={3}
                    value={config.contact.intro}
                    onChange={(e) => setContact("intro", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Have a project in mind?"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls} style={fs}>Email</label>
                    <input
                      type="email"
                      value={config.contact.email}
                      onChange={(e) => setContact("email", e.target.value)}
                      className={inputCls}
                      style={fs}
                      placeholder="rizkyirawan0404@gmail.com"
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={fs}>Location</label>
                    <input
                      type="text"
                      value={config.contact.location}
                      onChange={(e) => setContact("location", e.target.value)}
                      className={inputCls}
                      style={fs}
                      placeholder="Indonesia"
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={fs}>Availability Status</label>
                    <input
                      type="text"
                      value={config.contact.availability}
                      onChange={(e) => setContact("availability", e.target.value)}
                      className={inputCls}
                      style={fs}
                      placeholder="Available for new projects"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>02 — SEO Meta</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Meta information for search engines.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Meta Title</label>
                  <input
                    type="text"
                    value={config.contact.metaTitle}
                    onChange={(e) => setContact("metaTitle", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="Leave empty to use default"
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Meta Description</label>
                  <textarea
                    rows={2}
                    value={config.contact.metaDescription}
                    onChange={(e) => setContact("metaDescription", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Leave empty to use default"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CV TAB */}
        {activeTab === "cv" && (
          <section className="space-y-8">
            <div className="border border-rule p-5">
              <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>01 — CV Page SEO</h3>
              <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Meta information for the CV/Resume page.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={fs}>Meta Title</label>
                  <input
                    type="text"
                    value={config.cv.metaTitle}
                    onChange={(e) => setCv("metaTitle", e.target.value)}
                    className={inputCls}
                    style={fs}
                    placeholder="Leave empty to use default"
                  />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Meta Description</label>
                  <textarea
                    rows={2}
                    value={config.cv.metaDescription}
                    onChange={(e) => setCv("metaDescription", e.target.value)}
                    className={textareaCls}
                    style={{ ...fs, resize: "vertical" }}
                    placeholder="Leave empty to use default"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-rule pt-6 mt-8">
        <button onClick={save} disabled={isPending}
          className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
          <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>
            {isPending ? "Saving…" : "Save Changes"}
          </span>
        </button>
        {saved && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>Changes published ✓</span>}
      </div>
    </div>
  );
}
