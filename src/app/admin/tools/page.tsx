"use client";

import { useState } from "react";

type TitleResult = { title: string; description: string; error?: string };

export default function AdminTools() {
  const [mode, setMode] = useState<"single" | "bulk" | "seo">("single");
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TitleResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<TitleResult[]>([]);
  const [bulkTopics, setBulkTopics] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoType, setSeoType] = useState<"work" | "journal" | "page">("work");
  const [seoResult, setSeoResult] = useState<{ metaTitle: string; metaDescription: string; ogTitle: string; ogDescription: string; keywords: string } | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), prompt: customPrompt.trim() || null }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Request failed", title: "", description: "" });
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkGenerate(e: React.FormEvent) {
    e.preventDefault();
    const topics = bulkTopics.split("\n").map((t) => t.trim()).filter(Boolean);
    if (!topics.length) return;

    const results: TitleResult[] = [];
    setBulkResults(results);
    setLoading(true);

    for (const t of topics) {
      try {
        const res = await fetch("/api/admin/ai/caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: t, prompt: customPrompt.trim() || null }),
        });
        const d = await res.json();
        results.push({ title: d.title || "", description: d.description || "", error: d.error });
      } catch {
        results.push({ title: "", description: "", error: "Request failed" });
      }
      setBulkResults([...results]);
    }

    setLoading(false);
  }

  async function generateSeo(e: React.FormEvent) {
    e.preventDefault();
    if (!seoTitle.trim()) return;

    setSeoLoading(true);
    setSeoResult(null);

    try {
      const res = await fetch("/api/admin/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: seoTitle.trim(), description: seoDesc.trim() || null, type: seoType }),
      });
      const data = await res.json();
      setSeoResult(data);
    } catch {
      setSeoResult(null);
    } finally {
      setSeoLoading(false);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const tabs = [
    { id: "single" as const, label: "Single" },
    { id: "bulk" as const, label: "Bulk" },
    { id: "seo" as const, label: "SEO Meta" },
  ];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 border-b border-rule pb-6">
        <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Tools</span>
        <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>AI Tools</h1>
        <p className="lab text-white/30 mt-3" style={{ fontSize: "0.6rem" }}>
          Generate titles, descriptions, and SEO metadata using xAI Grok.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-rule">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setMode(tab.id); setResult(null); setBulkResults([]); setSeoResult(null); }}
            className="px-4 py-2 lab transition-colors border-b-2"
            style={{
              fontSize: "0.6rem",
              color: mode === tab.id ? "#ff3500" : "rgba(240,240,238,0.4)",
              borderColor: mode === tab.id ? "#ff3500" : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Single Title & Description */}
      {mode === "single" && (
        <section className="mb-10">
          <form onSubmit={generate} className="flex flex-col gap-5 mb-6">
            <div>
              <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.58rem" }}>Topic / Keywords *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="E.g. 'Abandoned factory photography series'"
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.6rem" }}
              />
            </div>

            <div>
              <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>
                Custom Prompt <span className="text-white/15">(optional)</span>
              </label>
              <textarea
                value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={2}
                placeholder="E.g. 'Style: atmospheric, noir photography'"
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                style={{ fontSize: "0.6rem" }}
              />
            </div>

            <button type="submit" disabled={loading || !topic.trim()}
              className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40 self-start">
              <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>
                {loading ? "Generating…" : "Generate"}
              </span>
            </button>
          </form>

          {result && (
            <div className="border border-rule">
              {result.error ? (
                <div className="px-5 py-4"><p className="lab text-red-400" style={{ fontSize: "0.6rem" }}>{result.error}</p></div>
              ) : (
                <div className="divide-y divide-rule">
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>Title</span>
                      <button onClick={() => copy(result.title, "title")} className="lab text-white/30 hover:text-signal" style={{ fontSize: "0.48rem" }}>{copied === "title" ? "Copied!" : "Copy"}</button>
                    </div>
                    <p className="text-white/80 leading-relaxed" style={{ fontSize: "0.85rem" }}>{result.title}</p>
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>Description</span>
                      <button onClick={() => copy(result.description, "desc")} className="lab text-white/30 hover:text-signal" style={{ fontSize: "0.48rem" }}>{copied === "desc" ? "Copied!" : "Copy"}</button>
                    </div>
                    <p className="text-white/80 leading-relaxed" style={{ fontSize: "0.85rem" }}>{result.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Bulk Title & Description */}
      {mode === "bulk" && (
        <section className="mb-10">
          <div className="mb-6">
            <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.58rem" }}>Topics (one per line)</label>
            <textarea
              value={bulkTopics}
              onChange={(e) => setBulkTopics(e.target.value)}
              rows={6}
              placeholder={"Abandoned factory series\nNeon night photography\nBrutalist architecture\n..."}
              className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
              style={{ fontSize: "0.6rem" }}
            />
          </div>

          <div className="mb-6">
            <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>
              Custom Prompt <span className="text-white/15">(optional)</span>
            </label>
            <textarea
              value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={2}
              placeholder="E.g. 'Style: dark, atmospheric, cinematic'"
              className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
              style={{ fontSize: "0.6rem" }}
            />
          </div>

          <button onClick={handleBulkGenerate} disabled={loading || !bulkTopics.trim()}
            className="border border-signal px-4 py-2 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{loading ? "Processing…" : "Generate All"}</span>
          </button>

          {bulkResults.length > 0 && (
            <div className="border border-rule mt-6">
              <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
                <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>
                  {bulkResults.filter((r) => r.title).length}/{bulkResults.length} generated
                </span>
                <button onClick={() => {
                  const all = bulkResults.map((r) => `## Topic\n${r.title}\n**Description:** ${r.description}`).join("\n\n");
                  copy(all, "all");
                }} className="lab text-signal hover:text-white" style={{ fontSize: "0.5rem" }}>Copy all</button>
              </div>
              <div className="divide-y divide-rule max-h-96 overflow-auto">
                {bulkResults.map((r, i) => (
                  <div key={i} className="px-4 py-3">
                    {r.error && <span className="lab text-red-400" style={{ fontSize: "0.45rem" }}>{r.error}</span>}
                    {r.title && <p className="text-white/80 mb-1" style={{ fontSize: "0.75rem" }}>{r.title}</p>}
                    {r.description && <p className="text-white/50" style={{ fontSize: "0.7rem" }}>{r.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* SEO Meta */}
      {mode === "seo" && (
        <section className="mb-10">
          <form onSubmit={generateSeo} className="flex flex-col gap-5 mb-6">
            <div className="flex gap-3">
              {(["work", "journal", "page"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setSeoType(t)}
                  className="lab px-3 py-1.5 border transition-colors"
                  style={{
                    fontSize: "0.55rem",
                    color: seoType === t ? "#080808" : "rgba(240,240,238,0.4)",
                    background: seoType === t ? "#ff3500" : "transparent",
                    borderColor: seoType === t ? "#ff3500" : "rgba(240,240,238,0.12)",
                  }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div>
              <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>Title *</label>
              <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} required
                placeholder="Work or post title"
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.6rem" }} />
            </div>
            <div>
              <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>Description (optional)</label>
              <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2}
                placeholder="Brief description to help AI generate better meta"
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                style={{ fontSize: "0.6rem" }} />
            </div>
            <button type="submit" disabled={seoLoading || !seoTitle.trim()}
              className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40 self-start">
              <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>
                {seoLoading ? "Generating…" : "Generate SEO"}
              </span>
            </button>
          </form>

          {seoResult && (
            <div className="border border-rule">
              <div className="divide-y divide-rule">
                {[
                  { label: "Meta Title", value: seoResult.metaTitle, key: "metaTitle", hint: "50-60 chars" },
                  { label: "Meta Description", value: seoResult.metaDescription, key: "metaDescription", hint: "150-160 chars" },
                  { label: "OG Title", value: seoResult.ogTitle, key: "ogTitle", hint: "Max 60 chars" },
                  { label: "OG Description", value: seoResult.ogDescription, key: "ogDescription", hint: "60-100 chars" },
                  { label: "Keywords", value: seoResult.keywords, key: "keywords", hint: "SEO keywords" },
                ].map((field) => (
                  <div key={field.key} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>{field.label}</span>
                      <button onClick={() => copy(field.value, field.key)} className="lab text-white/30 hover:text-signal" style={{ fontSize: "0.48rem" }}>
                        {copied === field.key ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-white/80" style={{ fontSize: "0.8rem" }}>{field.value}</p>
                    <span className="lab text-white/20 mt-1 block" style={{ fontSize: "0.45rem" }}>{field.hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tips */}
      <section>
        <h2 className="lab text-white/60 mb-4 border-b border-rule pb-2" style={{ fontSize: "0.62rem" }}>Tips</h2>
        <div className="border border-rule p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.52rem" }}>01</span>
            <p className="lab text-white/70" style={{ fontSize: "0.58rem" }}>Enter a topic or keywords to generate evocative titles and descriptions</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.52rem" }}>02</span>
            <p className="lab text-white/70" style={{ fontSize: "0.58rem" }}>Bulk mode processes multiple topics at once</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.52rem" }}>03</span>
            <p className="lab text-white/70" style={{ fontSize: "0.58rem" }}>SEO meta is tailored for work, journal, or general pages</p>
          </div>
        </div>
      </section>
    </div>
  );
}
