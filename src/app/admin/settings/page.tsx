"use client";

import { useState, useEffect, useTransition } from "react";
import { addClient, deleteClient, updateSEO } from "@/app/admin/actions";
import type { SEOConfig } from "@/lib/store";

const DEFAULT_SEO: SEOConfig = {
  siteName: "Rizky Irawan",
  titleTemplate: "%s — Rizky Irawan",
  defaultDescription: "Visual archive of works in 3D, motion, illustration, and graphic design — atmospheric, post-industrial, editorial.",
  ogImage: "",
  canonicalBaseUrl: "",
  twitterHandle: "",
  robots: "index, follow",
};

export default function AdminSettings() {
  const [clients, setClients] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [newClient, setNewClient] = useState("");
  const [seo, setSeo] = useState<SEOConfig>(DEFAULT_SEO);
  const [seoSaved, setSeoSaved] = useState(false);
  const [tab, setTab] = useState<"seo" | "clients">("seo");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch("/api/admin/seo").then((r) => r.json()),
    ]).then(([clientsData, seoData]) => {
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setSeo(seoData);
      setLoaded(true);
    });
  }, []);

  function notify(text: string) { setMsg(text); setTimeout(() => setMsg(""), 3000); }

  function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!newClient.trim()) return;
    startTransition(async () => {
      const result = await addClient(newClient.trim());
      if (result.ok) {
        setClients((prev) => [...prev, newClient.trim()]);
        setNewClient("");
        notify("Client added!");
      } else { notify(`Error: ${result.error}`); }
    });
  }

  function handleDeleteClient(name: string) {
    if (!confirm(`Remove "${name}"?`)) return;
    startTransition(async () => {
      await deleteClient(name);
      setClients((prev) => prev.filter((c) => c !== name));
      notify("Client removed.");
    });
  }

  function saveSeo() {
    startTransition(async () => {
      await updateSEO(seo);
      setSeoSaved(true);
      setTimeout(() => setSeoSaved(false), 3000);
    });
  }

  function setSeoField<K extends keyof SEOConfig>(key: K, value: SEOConfig[K]) {
    setSeo((prev) => ({ ...prev, [key]: value }));
  }

  if (!loaded) return <div className="p-8"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  const inputCls = "w-full bg-dim border border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors";
  const textareaCls = "w-full bg-dim border border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors resize-none";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 border-b border-rule pb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Settings</span>
          <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Settings</h1>
          <p className="lab text-white/30 mt-2" style={{ fontSize: "0.55rem" }}>Configure SEO settings and manage your client list.</p>
        </div>
        {msg && <span className="lab text-signal animate-pulse" style={{ fontSize: "0.55rem" }}>{msg}</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-rule pb-0 flex-wrap">
        <button
          onClick={() => setTab("seo")}
          className="lab px-4 py-2 transition-colors"
          style={{
            fontSize: "0.6rem",
            color: tab === "seo" ? "var(--black)" : "color-mix(in srgb, var(--white) 40%, transparent)",
            background: tab === "seo" ? "var(--signal)" : "transparent",
            borderBottom: tab === "seo" ? "2px solid var(--signal)" : "2px solid transparent",
            marginBottom: "-2px",
          }}
        >
          SEO & Meta
        </button>
        <button
          onClick={() => setTab("clients")}
          className="lab px-4 py-2 transition-colors"
          style={{
            fontSize: "0.6rem",
            color: tab === "clients" ? "var(--black)" : "color-mix(in srgb, var(--white) 40%, transparent)",
            background: tab === "clients" ? "var(--signal)" : "transparent",
            borderBottom: tab === "clients" ? "2px solid var(--signal)" : "2px solid transparent",
            marginBottom: "-2px",
          }}
        >
          Clients ({clients.length})
        </button>
      </div>

      {/* SEO Tab */}
      {tab === "seo" && (
        <section className="space-y-8">
          {/* Basic SEO */}
          <div className="border border-rule p-5">
            <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>01 — Basic SEO</h3>
            <p className="lab text-white/30 mb-6" style={{ fontSize: "0.55rem" }}>Core settings for search engine visibility.</p>
            <div className="flex items-center justify-between mb-6">
              <div />
              <button onClick={saveSeo} disabled={isPending}
                className="group inline-flex items-center gap-3 border border-signal px-5 py-3 hover:bg-signal transition-colors disabled:opacity-40">
                <span className="lab text-white group-hover:text-black" style={fs}>
                  {isPending ? "Saving…" : seoSaved ? "Saved ✓" : "Save SEO"}
                </span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls} style={fs}>Site Name</label>
                <input value={seo.siteName} onChange={(e) => setSeoField("siteName", e.target.value)} className={inputCls} style={fs} />
              </div>
              <div>
                <label className={labelCls} style={fs}>Title Template</label>
                <input value={seo.titleTemplate} onChange={(e) => setSeoField("titleTemplate", e.target.value)} className={inputCls} style={fs} />
                <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Use %s for the page title</p>
              </div>
            </div>
          </div>

          {/* Meta Description */}
          <div className="border border-rule p-5">
            <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>02 — Default Meta Description</h3>
            <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Used when no page-specific meta description is set.</p>
            <div>
              <textarea rows={3} value={seo.defaultDescription} onChange={(e) => setSeoField("defaultDescription", e.target.value)}
                className={textareaCls} style={{ ...fs, resize: "vertical" }} />
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Recommended: 150-160 characters for optimal display in search results</p>
            </div>
          </div>

          {/* Open Graph */}
          <div className="border border-rule p-5">
            <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>03 — Open Graph (Social Sharing)</h3>
            <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>How your site appears when shared on Facebook, LinkedIn, etc.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls} style={fs}>OG Image URL</label>
                <input value={seo.ogImage} onChange={(e) => setSeoField("ogImage", e.target.value)} className={inputCls} style={fs} placeholder="https://yoursite.com/images/og.jpg" />
                <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Recommended: 1200×630px for best display</p>
              </div>
              <div>
                <label className={labelCls} style={fs}>Twitter / X Handle</label>
                <input value={seo.twitterHandle} onChange={(e) => setSeoField("twitterHandle", e.target.value)} className={inputCls} style={fs} placeholder="@yourhandle" />
                <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Your site's official social account</p>
              </div>
            </div>
          </div>

          {/* Technical */}
          <div className="border border-rule p-5">
            <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>04 — Technical SEO</h3>
            <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Advanced settings for crawler access and canonical URLs.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls} style={fs}>Canonical Base URL</label>
                <input value={seo.canonicalBaseUrl} onChange={(e) => setSeoField("canonicalBaseUrl", e.target.value)} className={inputCls} style={fs} placeholder="https://yoursite.com" />
                <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Primary URL for all canonical links</p>
              </div>
              <div>
                <label className={labelCls} style={fs}>Robots Meta</label>
                <input value={seo.robots} onChange={(e) => setSeoField("robots", e.target.value)} className={inputCls} style={fs} />
                <div className="flex gap-2 mt-2">
                  {["index, follow", "noindex, nofollow", "index, nofollow"].map((r) => (
                    <button key={r} onClick={() => setSeoField("robots", r)}
                      className="lab px-2 py-1 border border-rule hover:border-signal transition-colors"
                      style={{ fontSize: "0.5rem", color: seo.robots === r ? "var(--signal)" : "color-mix(in srgb, var(--white) 40%, transparent)" }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="border border-rule p-5">
            <h3 className="lab text-signal mb-3" style={{ fontSize: "0.65rem" }}>💡 SEO Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.5rem" }}>01</span>
                <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Keep meta descriptions under 160 characters for full display in search results</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.5rem" }}>02</span>
                <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Use keywords naturally in your page titles and descriptions</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.5rem" }}>03</span>
                <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>OG image is used when sharing your site on social media</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.5rem" }}>04</span>
                <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Set robots to "noindex, nofollow" if you want a page hidden from search engines</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Clients Tab */}
      {tab === "clients" && (
        <section className="space-y-8">
          {/* Add Client */}
          <div className="border border-rule p-5">
            <h3 className="lab text-signal mb-2" style={{ fontSize: "0.65rem" }}>01 — Add New Client</h3>
            <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Add clients you've worked with. They appear on your homepage.</p>
            <form onSubmit={handleAddClient} className="flex items-center gap-3">
              <input
                type="text"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="Enter client or company name..."
                className="flex-1 bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.6rem" }}
              />
              <button type="submit" disabled={isPending || !newClient.trim()}
                className="border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
                <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{isPending ? "…" : "Add"}</span>
              </button>
            </form>
          </div>

          {/* Client Grid */}
          <div className="border border-rule p-5">
            <h3 className="lab text-signal mb-4" style={{ fontSize: "0.65rem" }}>02 — Your Clients ({clients.length})</h3>

            {clients.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-rule">
                <p className="lab text-white/30 mb-2" style={{ fontSize: "0.6rem" }}>No clients yet</p>
                <p className="lab text-white/20" style={{ fontSize: "0.55rem" }}>Add your first client using the form above</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {clients.map((name, i) => (
                  <div key={name} className="group relative p-4 border border-rule hover:border-signal/50 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>{String(i + 1).padStart(2, "0")}</span>
                      <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                    </div>
                    <p className="lab text-white truncate" style={{ fontSize: "0.65rem" }}>{name}</p>
                    <button
                      onClick={() => handleDeleteClient(name)}
                      disabled={isPending}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="border border-rule p-5">
            <h3 className="lab text-signal mb-3" style={{ fontSize: "0.65rem" }}>💡 Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.5rem" }}>01</span>
                <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Clients appear in the Clients section on your homepage</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.5rem" }}>02</span>
                <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Used for work attribution and portfolio context</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.5rem" }}>03</span>
                <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Click the × on any client card to remove it</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.5rem" }}>04</span>
                <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Add the client name exactly as you'd like it displayed</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
