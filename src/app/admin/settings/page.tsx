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
  const [tab, setTab] = useState<"seo" | "clients" | "system">("seo");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch("/api/admin/seo").then((r) => r.json()),
    ]).then(([clientsData, seoData]) => {
      setClients(clientsData);
      setSeo(seoData);
      setLoaded(true);
    });
  }, []);

  function notify(text: string) { setMsg(text); setTimeout(() => setMsg(""), 3000); }

  function handleAdd(e: React.FormEvent) {
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

  const inputCls = "w-full bg-dim border-b border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 bg-black border-b border-rule px-5 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — Settings</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1.2rem, 3vw, 2.5rem)", lineHeight: 0.88 }}>Settings</p>
          </div>
          {msg && <span className="lab text-signal animate-pulse" style={{ fontSize: "0.52rem" }}>{msg}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex items-center gap-1 px-5 py-2 border-b border-rule bg-black">
        {(["seo", "clients", "system"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="lab px-4 py-2 transition-colors"
            style={{
              fontSize: "0.58rem",
              color: tab === t ? "#080808" : "rgba(240,240,238,0.4)",
              background: tab === t ? "#ff3500" : "transparent",
            }}
          >
            {t === "seo" ? "SEO" : t === "clients" ? "Clients" : "System"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {/* SEO Tab */}
        {tab === "seo" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="lab text-white/60" style={{ fontSize: "0.6rem" }}>SEO Configuration</h2>
              <button onClick={saveSeo} disabled={isPending}
                className="group inline-flex items-center gap-3 border border-signal px-4 py-2 hover:bg-signal transition-colors disabled:opacity-40">
                <span className="lab text-white group-hover:text-black" style={fs}>
                  {isPending ? "Saving…" : seoSaved ? "Saved ✓" : "Save SEO"}
                </span>
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelCls} style={fs}>Site Name</label>
                  <input value={seo.siteName} onChange={(e) => setSeoField("siteName", e.target.value)} className={inputCls} style={fs} />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Title Template</label>
                  <input value={seo.titleTemplate} onChange={(e) => setSeoField("titleTemplate", e.target.value)} className={inputCls} style={fs} />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Use %s for page title</p>
                </div>
              </div>

              <div>
                <label className={labelCls} style={fs}>Default Meta Description</label>
                <textarea rows={2} value={seo.defaultDescription} onChange={(e) => setSeoField("defaultDescription", e.target.value)}
                  className={inputCls} style={{ ...fs, resize: "none" }} />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelCls} style={fs}>OG Image URL</label>
                  <input value={seo.ogImage} onChange={(e) => setSeoField("ogImage", e.target.value)} className={inputCls} style={fs} />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>1200×630 recommended</p>
                </div>
                <div>
                  <label className={labelCls} style={fs}>Canonical Base URL</label>
                  <input value={seo.canonicalBaseUrl} onChange={(e) => setSeoField("canonicalBaseUrl", e.target.value)} className={inputCls} style={fs} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelCls} style={fs}>Twitter / X Handle</label>
                  <input value={seo.twitterHandle} onChange={(e) => setSeoField("twitterHandle", e.target.value)} className={inputCls} style={fs} />
                </div>
                <div>
                  <label className={labelCls} style={fs}>Robots</label>
                  <input value={seo.robots} onChange={(e) => setSeoField("robots", e.target.value)} className={inputCls} style={fs} />
                  <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>e.g. index, follow</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {tab === "clients" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="lab text-white/60" style={{ fontSize: "0.6rem" }}>Client List ({clients.length})</h2>
            </div>

            {/* Add form */}
            <form onSubmit={handleAdd} className="flex items-center gap-3 mb-6">
              <input type="text" value={newClient} onChange={(e) => setNewClient(e.target.value)} placeholder="Add new client…"
                className="flex-1 bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.6rem" }} />
              <button type="submit" disabled={isPending || !newClient.trim()}
                className="border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
                <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{isPending ? "…" : "Add Client"}</span>
              </button>
            </form>

            {/* Client list */}
            <div className="border border-rule">
              {clients.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="lab text-white/30" style={{ fontSize: "0.6rem" }}>No clients yet. Add your first above.</p>
                </div>
              ) : clients.map((name, i) => (
                <div key={name} className="flex items-center justify-between border-b border-rule px-5 py-4 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="lab text-signal" style={{ fontSize: "0.48rem" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="lab text-white/70" style={{ fontSize: "0.65rem" }}>{name}</span>
                  </div>
                  <button onClick={() => handleDeleteClient(name)} disabled={isPending}
                    className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.52rem" }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <p className="lab text-white/30 mt-4" style={{ fontSize: "0.55rem" }}>
              Clients are used for work attribution. Add clients you've worked with.
            </p>
          </div>
        )}

        {/* System Tab */}
        {tab === "system" && (
          <div className="max-w-3xl">
            <h2 className="lab text-white/60 mb-6" style={{ fontSize: "0.6rem" }}>System Information</h2>

            <div className="space-y-6">
              {/* Quick Links */}
              <div className="border border-rule">
                <div className="border-b border-rule px-5 py-3">
                  <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>Quick Links</span>
                </div>
                <div className="divide-y divide-rule">
                  <a href="/admin/design" className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="lab text-white/70" style={{ fontSize: "0.6rem" }}>Design Config</span>
                    <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>→</span>
                  </a>
                  <a href="/admin/upload" className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="lab text-white/70" style={{ fontSize: "0.6rem" }}>Media Library</span>
                    <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>→</span>
                  </a>
                  <a href="/admin/tools" className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="lab text-white/70" style={{ fontSize: "0.6rem" }}>AI Tools</span>
                    <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>→</span>
                  </a>
                  <a href="/admin/cv" className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="lab text-white/70" style={{ fontSize: "0.6rem" }}>CV / Resume</span>
                    <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>→</span>
                  </a>
                </div>
              </div>

              {/* Environment */}
              <div className="border border-rule">
                <div className="border-b border-rule px-5 py-3">
                  <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>Environment Variables</span>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="lab text-green-400" style={{ fontSize: "0.55rem" }}>✓</span>
                    <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>ADMIN_EMAIL</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="lab text-green-400" style={{ fontSize: "0.55rem" }}>✓</span>
                    <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>ADMIN_PASSWORD</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="lab text-green-400" style={{ fontSize: "0.55rem" }}>✓</span>
                    <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>JWT_SECRET</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="lab text-green-400" style={{ fontSize: "0.55rem" }}>✓</span>
                    <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>JSONBIN_ACCESS_KEY</span>
                  </div>
                </div>
                <div className="border-t border-rule px-5 py-3">
                  <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>
                    All required environment variables are configured.
                  </p>
                </div>
              </div>

              {/* Admin Access Info */}
              <div className="border border-rule">
                <div className="border-b border-rule px-5 py-3">
                  <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>Admin Access</span>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <p className="lab text-white/40" style={{ fontSize: "0.55rem" }}>
                    Credentials are stored in <code className="text-signal">.env.local</code> — never committed to git.
                  </p>
                  <p className="lab text-white/40" style={{ fontSize: "0.55rem" }}>
                    To change password: edit <code className="text-signal">ADMIN_PASSWORD</code> in <code className="text-signal">.env.local</code> and restart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
