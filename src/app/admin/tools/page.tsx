"use client";

import { useState } from "react";

type Result = { [key: string]: any };

export default function AdminTools() {
  const [mode, setMode] = useState<"content" | "visual" | "seo">("content");
  const [visualMode, setVisualMode] = useState<"palette" | "style" | "mood" | "composition" | "name">("palette");
  const [contentMode, setContentMode] = useState<"single" | "bulk">("single");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Content generation state
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [bulkTopics, setBulkTopics] = useState("");
  const [bulkResults, setBulkResults] = useState<Result[]>([]);

  // Visual analysis state
  const [visualDesc, setVisualDesc] = useState("");

  // SEO state
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoType, setSeoType] = useState<"work" | "journal" | "page">("work");
  const [seoResult, setSeoResult] = useState<Result | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function copyAll(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  }

  // Content generation
  async function generateContent(e: React.FormEvent) {
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
      setResult({ error: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkGenerate(e: React.FormEvent) {
    e.preventDefault();
    const topics = bulkTopics.split("\n").map((t) => t.trim()).filter(Boolean);
    if (!topics.length) return;

    const results: Result[] = [];
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
        results.push({ topic: t, ...d });
      } catch {
        results.push({ topic: t, error: "Request failed" });
      }
      setBulkResults([...results]);
    }

    setLoading(false);
  }

  // Visual analysis
  async function analyzeVisual(e: React.FormEvent) {
    e.preventDefault();
    if (!visualDesc.trim() && visualMode !== "name") return;

    setLoading(true);
    setResult(null);

    const endpoints: Record<string, string> = {
      palette: "/api/admin/ai/palette",
      style: "/api/admin/ai/style",
      mood: "/api/admin/ai/mood",
      composition: "/api/admin/ai/composition",
      name: "/api/admin/ai/name",
    };

    try {
      const res = await fetch(endpoints[visualMode], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: visualDesc.trim(),
          keywords: customPrompt.trim() || undefined
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  // SEO
  async function generateSeo(e: React.FormEvent) {
    e.preventDefault();
    if (!seoTitle.trim()) return;

    setLoading(true);
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
      setSeoResult({ error: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  const renderResult = (data: Result, _label: string, _parentKey?: string) => {
    if (data.error) {
      return <p className="lab text-red-400" style={{ fontSize: "0.6rem" }}>{data.error}</p>;
    }

    if (Array.isArray(data)) {
      return (
        <div className="flex flex-wrap gap-2">
          {data.map((item, i) => {
            if (typeof item === "object") {
              return (
                <div key={i} className="border border-rule px-3 py-2">
                  <p className="text-white/80" style={{ fontSize: "0.75rem" }}>
                    {Object.values(item).join(" — ")}
                  </p>
                </div>
              );
            }
            return (
              <span key={i} className="lab text-white/70 border border-rule px-3 py-2" style={{ fontSize: "0.58rem" }}>
                {item}
              </span>
            );
          })}
        </div>
      );
    }

    if (typeof data === "object") {
      return (
        <div className="space-y-3">
          {Object.entries(data).map(([k, v]) => {
            if (Array.isArray(v)) {
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>{k.toUpperCase()}</span>
                    <button
                      onClick={() => copy(Array.isArray(v) ? v.join(", ") : String(v), k)}
                      className="lab text-white/30 hover:text-signal"
                      style={{ fontSize: "0.48rem" }}
                    >
                      {copied === k ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {v.map((item: any, i: number) => (
                      <span key={i} className="lab text-white/70 border border-rule px-2 py-1" style={{ fontSize: "0.55rem" }}>
                        {typeof item === "object" ? Object.values(item).join(" ") : item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
            if (typeof v === "string") {
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>{k.replace(/([A-Z])/g, " $1").toUpperCase()}</span>
                    <button
                      onClick={() => copy(v, k)}
                      className="lab text-white/30 hover:text-signal"
                      style={{ fontSize: "0.48rem" }}
                    >
                      {copied === k ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-white/80" style={{ fontSize: "0.8rem" }}>{v}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    return null;
  };

  const modeLabels = [
    { id: "content" as const, label: "Content" },
    { id: "visual" as const, label: "Visual Analysis" },
    { id: "seo" as const, label: "SEO Meta" },
  ];

  const visualLabels = [
    { id: "palette" as const, label: "Color" },
    { id: "style" as const, label: "Style" },
    { id: "mood" as const, label: "Mood" },
    { id: "composition" as const, label: "Composition" },
    { id: "name" as const, label: "Naming" },
  ];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 border-b border-rule pb-6">
        <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Tools</span>
        <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.88 }}>AI Tools</h1>
        <p className="lab text-white/30 mt-3" style={{ fontSize: "0.6rem" }}>
          Generate content, analyze visuals, and create SEO metadata using Groq AI.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 mb-6 border-b border-rule">
        {modeLabels.map((tab) => (
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

      {/* Content Mode */}
      {mode === "content" && (
        <div>
          <div className="flex gap-1 mb-6">
            {[
              { id: "single" as const, label: "Single" },
              { id: "bulk" as const, label: "Bulk" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setContentMode(tab.id); setResult(null); setBulkResults([]); }}
                className="px-3 py-1.5 lab border transition-colors"
                style={{
                  fontSize: "0.55rem",
                  color: contentMode === tab.id ? "#080808" : "rgba(240,240,238,0.4)",
                  background: contentMode === tab.id ? "#ff3500" : "transparent",
                  borderColor: contentMode === tab.id ? "#ff3500" : "rgba(240,240,238,0.12)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {contentMode === "single" ? (
            <form onSubmit={generateContent} className="flex flex-col gap-5 mb-6">
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
                  Style Direction <span className="text-white/15">(optional)</span>
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={2}
                  placeholder="E.g. 'Atmospheric, noir, cinematic lighting'"
                  className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                  style={{ fontSize: "0.6rem" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40 self-start"
              >
                <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>
                  {loading ? "Generating…" : "Generate"}
                </span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 mb-6">
              <div>
                <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.58rem" }}>Topics (one per line)</label>
                <textarea
                  value={bulkTopics}
                  onChange={(e) => setBulkTopics(e.target.value)}
                  rows={6}
                  placeholder={"Abandoned factory series\nNeon night photography\nBrutalist architecture"}
                  className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                  style={{ fontSize: "0.6rem" }}
                />
              </div>
              <div>
                <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>
                  Style Direction <span className="text-white/15">(optional)</span>
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={2}
                  placeholder="E.g. 'Dark, atmospheric, cinematic'"
                  className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                  style={{ fontSize: "0.6rem" }}
                />
              </div>
              <button
                onClick={handleBulkGenerate}
                disabled={loading || !bulkTopics.trim()}
                className="border border-signal px-4 py-2 hover:bg-signal transition-colors disabled:opacity-40"
              >
                <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{loading ? "Processing…" : "Generate All"}</span>
              </button>
            </div>
          )}

          {result && (
            <div className="border border-rule">
              {result.error ? (
                <div className="px-5 py-4"><p className="lab text-red-400" style={{ fontSize: "0.6rem" }}>{result.error}</p></div>
              ) : (
                <div className="divide-y divide-rule">
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>Title</span>
                      <button onClick={() => copy(result.title || "", "title")} className="lab text-white/30 hover:text-signal" style={{ fontSize: "0.48rem" }}>
                        {copied === "title" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-white/80 leading-relaxed" style={{ fontSize: "0.85rem" }}>{result.title}</p>
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>Description</span>
                      <button onClick={() => copy(result.description || "", "desc")} className="lab text-white/30 hover:text-signal" style={{ fontSize: "0.48rem" }}>
                        {copied === "desc" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-white/80 leading-relaxed" style={{ fontSize: "0.85rem" }}>{result.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {bulkResults.length > 0 && (
            <div className="border border-rule mt-6">
              <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
                <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>
                  {bulkResults.filter((r) => r.title).length}/{bulkResults.length} generated
                </span>
                <button
                  onClick={() => {
                    const all = bulkResults.map((r) => `## ${r.topic}\n**Title:** ${r.title || "—"}\n**Description:** ${r.description || "—"}\n`).join("\n");
                    copyAll(all);
                  }}
                  className="lab text-signal hover:text-white"
                  style={{ fontSize: "0.5rem" }}
                >
                  {copiedAll ? "Copied!" : "Copy all"}
                </button>
              </div>
              <div className="divide-y divide-rule max-h-96 overflow-auto">
                {bulkResults.map((r, i) => (
                  <div key={i} className="px-4 py-3">
                    <p className="lab text-signal mb-2" style={{ fontSize: "0.52rem" }}>{r.topic}</p>
                    {r.error && <span className="lab text-red-400" style={{ fontSize: "0.55rem" }}>{r.error}</span>}
                    {r.title && <p className="text-white/80 mb-1" style={{ fontSize: "0.8rem" }}>{r.title}</p>}
                    {r.description && <p className="text-white/50" style={{ fontSize: "0.7rem" }}>{r.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Analysis Mode */}
      {mode === "visual" && (
        <div>
          <div className="flex flex-wrap gap-1 mb-6">
            {visualLabels.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setVisualMode(tab.id); setResult(null); }}
                className="px-3 py-1.5 lab border transition-colors"
                style={{
                  fontSize: "0.55rem",
                  color: visualMode === tab.id ? "#080808" : "rgba(240,240,238,0.4)",
                  background: visualMode === tab.id ? "#ff3500" : "transparent",
                  borderColor: visualMode === tab.id ? "#ff3500" : "rgba(240,240,238,0.12)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={analyzeVisual} className="flex flex-col gap-5 mb-6">
            <div>
              <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.58rem" }}>
                {visualMode === "name" ? "Keywords / Vision" : "Visual Description"} *
              </label>
              <textarea
                value={visualDesc}
                onChange={(e) => setVisualDesc(e.target.value)}
                rows={4}
                placeholder={
                  visualMode === "palette" ? "E.g. 'Warm sunset over industrial harbor, orange and purple hues'" :
                  visualMode === "style" ? "E.g. 'Minimalist Japanese interior with clean lines'" :
                  visualMode === "mood" ? "E.g. 'Foggy forest path at dawn, ethereal atmosphere'" :
                  visualMode === "composition" ? "E.g. 'Portrait with subject slightly off-center, dramatic lighting'" :
                  "E.g. 'Project about urban decay and renewal'"
                }
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                style={{ fontSize: "0.6rem" }}
              />
            </div>

            {visualMode === "palette" && (
              <div>
                <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>
                  Additional context <span className="text-white/15">(optional)</span>
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={2}
                  placeholder="Any additional details to help color extraction"
                  className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                  style={{ fontSize: "0.6rem" }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40 self-start"
            >
              <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>
                {loading ? "Analyzing…" : "Analyze"}
              </span>
            </button>
          </form>

          {result && (
            <div className="border border-rule">
              <div className="px-5 py-4">
                {renderResult(result, visualMode)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEO Mode */}
      {mode === "seo" && (
        <div>
          <form onSubmit={generateSeo} className="flex flex-col gap-5 mb-6">
            <div className="flex gap-3">
              {(["work", "journal", "page"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSeoType(t)}
                  className="lab px-3 py-1.5 border transition-colors"
                  style={{
                    fontSize: "0.55rem",
                    color: seoType === t ? "#080808" : "rgba(240,240,238,0.4)",
                    background: seoType === t ? "#ff3500" : "transparent",
                    borderColor: seoType === t ? "#ff3500" : "rgba(240,240,238,0.12)",
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div>
              <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>Title *</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                required
                placeholder="Work or post title"
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.6rem" }}
              />
            </div>
            <div>
              <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>Description (optional)</label>
              <textarea
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                rows={2}
                placeholder="Brief description to help AI generate better meta"
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                style={{ fontSize: "0.6rem" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !seoTitle.trim()}
              className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40 self-start"
            >
              <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>
                {loading ? "Generating…" : "Generate SEO"}
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
                      <button
                        onClick={() => copy(field.value || "", field.key)}
                        className="lab text-white/30 hover:text-signal"
                        style={{ fontSize: "0.48rem" }}
                      >
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
        </div>
      )}

      {/* Tips */}
      <section className="mt-10">
        <h2 className="lab text-white/60 mb-4 border-b border-rule pb-2" style={{ fontSize: "0.62rem" }}>Tips</h2>
        <div className="border border-rule p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.52rem" }}>01</span>
            <p className="lab text-white/70" style={{ fontSize: "0.58rem" }}>Be specific in descriptions for better visual analysis results</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.52rem" }}>02</span>
            <p className="lab text-white/70" style={{ fontSize: "0.58rem" }}>Use Content mode for titles and descriptions, Visual mode for analyzing visual properties</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="lab text-signal mt-[2px]" style={{ fontSize: "0.52rem" }}>03</span>
            <p className="lab text-white/70" style={{ fontSize: "0.58rem" }}>All results can be copied to clipboard with one click</p>
          </div>
        </div>
      </section>
    </div>
  );
}
