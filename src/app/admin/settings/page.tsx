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
      } else {
        notify(`Error: ${result.error}`);
      }
    });
  }

  function handleDeleteClient(name: string) {
    if (!confirm(`Remove "${name}" from client list?`)) return;
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

  const inputCls = "w-full bg-transparent border-b border-rule py-2 lab text-white placeholder:text-white/15 focus:outline-none focus:border-signal transition-colors";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 border-b border-rule pb-6">
        <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Settings</span>
        <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Settings</h1>
      </div>

      {/* ── SEO ─────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 border-b border-rule pb-2">
          <h2 className="lab text-white/60" style={{ fontSize: "0.6rem" }}>SEO</h2>
          <div className="flex items-center gap-3">
            {seoSaved && <span className="lab text-signal" style={fs}>Saved ✓</span>}
            <button onClick={saveSeo} disabled={isPending}
              className="group inline-flex items-center gap-3 border border-signal px-4 py-2 hover:bg-signal transition-colors disabled:opacity-40">
              <span className="lab text-white group-hover:text-black" style={fs}>
                {isPending ? "Saving…" : "Save SEO"}
              </span>
            </button>
          </div>
        </div>

        <div className="border border-rule p-5 space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls} style={fs}>Site Name</label>
              <input value={seo.siteName} onChange={(e) => setSeoField("siteName", e.target.value)}
                className={inputCls} style={fs} placeholder="Rizky Irawan" />
            </div>
            <div>
              <label className={labelCls} style={fs}>Title Template</label>
              <input value={seo.titleTemplate} onChange={(e) => setSeoField("titleTemplate", e.target.value)}
                className={inputCls} style={fs} placeholder="%s — Rizky Irawan" />
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Use %s for the page title</p>
            </div>
          </div>

          <div>
            <label className={labelCls} style={fs}>Default Meta Description</label>
            <textarea rows={2} value={seo.defaultDescription}
              onChange={(e) => setSeoField("defaultDescription", e.target.value)}
              className={inputCls} style={{ ...fs, resize: "none" }}
              placeholder="Brief description for search engines when no page-specific description exists" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls} style={fs}>OG Image URL</label>
              <input value={seo.ogImage} onChange={(e) => setSeoField("ogImage", e.target.value)}
                className={inputCls} style={fs} placeholder="/images/og-default.jpg" />
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Used for social sharing. 1200×630 recommended.</p>
            </div>
            <div>
              <label className={labelCls} style={fs}>Canonical Base URL</label>
              <input value={seo.canonicalBaseUrl} onChange={(e) => setSeoField("canonicalBaseUrl", e.target.value)}
                className={inputCls} style={fs} placeholder="https://rizkyirawan.com" />
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Used to generate canonical URLs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls} style={fs}>Twitter / X Handle</label>
              <input value={seo.twitterHandle} onChange={(e) => setSeoField("twitterHandle", e.target.value)}
                className={inputCls} style={fs} placeholder="@rizkyirawan44" />
            </div>
            <div>
              <label className={labelCls} style={fs}>Robots</label>
              <input value={seo.robots} onChange={(e) => setSeoField("robots", e.target.value)}
                className={inputCls} style={fs} placeholder="index, follow" />
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>e.g. index, follow · noindex, nofollow</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Site Config ─────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="lab text-white/60 mb-4 border-b border-rule pb-2" style={{ fontSize: "0.6rem" }}>Site Config</h2>
        <div className="border border-rule p-5">
          <p className="lab text-white/40 mb-3" style={{ fontSize: "0.55rem" }}>
            Site identity, colors, hero text, and social links are managed via the <span className="text-signal">Design</span> page.
          </p>
          <a href="/admin/design" className="lab text-signal hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>
            → Go to Design page
          </a>
        </div>
      </section>

      {/* ── Clients ─────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 border-b border-rule pb-2">
          <h2 className="lab text-white/60" style={{ fontSize: "0.6rem" }}>
            Client List ({clients.length})
          </h2>
          {msg && <span className="lab text-signal" style={fs}>{msg}</span>}
        </div>

        <form onSubmit={handleAdd} className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            placeholder="Add new client…"
            className="flex-1 bg-transparent border border-rule px-3 py-2 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
            style={{ fontSize: "0.58rem" }}
          />
          <button
            type="submit"
            disabled={isPending || !newClient.trim()}
            className="border border-signal px-4 py-2 hover:bg-signal transition-colors disabled:opacity-40"
          >
            <span className="lab text-white" style={{ fontSize: "0.58rem" }}>
              {isPending ? "…" : "Add"}
            </span>
          </button>
        </form>

        <div className="border border-rule">
          {clients.length === 0 && (
            <div className="px-5 py-4">
              <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>No clients yet. Add your first above.</span>
            </div>
          )}
          {clients.map((name, i) => (
            <div key={name} className="flex items-center justify-between border-b border-rule px-5 py-3 last:border-b-0 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <span className="lab text-signal" style={{ fontSize: "0.48rem" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="lab text-white/70" style={{ fontSize: "0.58rem" }}>{name}</span>
              </div>
              <button
                onClick={() => handleDeleteClient(name)}
                disabled={isPending}
                className="lab text-white/20 hover:text-red-400 transition-colors"
                style={{ fontSize: "0.52rem" }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Auth ────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="lab text-white/60 mb-4 border-b border-rule pb-2" style={{ fontSize: "0.6rem" }}>Admin Access</h2>
        <div className="border border-rule px-5 py-4">
          <p className="lab text-white/40 mb-1" style={{ fontSize: "0.55rem" }}>
            Credentials are stored in <code className="text-signal">.env.local</code> — never committed to git.
          </p>
          <p className="lab text-white/40 mb-3" style={{ fontSize: "0.55rem" }}>
            To change password: edit <code className="text-signal">ADMIN_PASSWORD</code> in <code className="text-signal">.env.local</code> and restart the server.
          </p>
          <div className="flex gap-2">
            <span className="lab text-white/20 border border-rule px-3 py-1" style={{ fontSize: "0.5rem" }}>ADMIN_EMAIL ✓</span>
            <span className="lab text-white/20 border border-rule px-3 py-1" style={{ fontSize: "0.5rem" }}>ADMIN_PASSWORD ✓</span>
            <span className="lab text-white/20 border border-rule px-3 py-1" style={{ fontSize: "0.5rem" }}>JWT_SECRET ✓</span>
          </div>
        </div>
      </section>
    </div>
  );
}
