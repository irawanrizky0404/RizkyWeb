"use client";

import { useState, useEffect, useTransition } from "react";
import { addPost, updatePost, deletePost } from "@/app/admin/actions";
import type { JournalPost } from "@/lib/types";
import Link from "next/link";

const PAGE_SIZE = 12;
const EMPTY: JournalPost = {
  slug: "", title: "", date: new Date().toISOString().split("T")[0],
  excerpt: "", content: "", tags: [], status: "published",
};

export default function AdminJournal() {
  const [isPending, startTransition] = useTransition();
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "add" | "edit" | "ai">("list");
  const [editing, setEditing] = useState<JournalPost | null>(null);
  const [msg, setMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alpha">("newest");

  useEffect(() => { setPage(1); }, [search, statusFilter, sortBy]);

  useEffect(() => {
    fetch("/api/admin/journal").then((r) => r.json()).then((d) => { setPosts(d); setLoaded(true); });
  }, []);

  function notify(text: string) { setMsg(text); setTimeout(() => setMsg(""), 3000); }

  const filtered = posts
    .filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.title.localeCompare(b.title);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function readingTime(text: string) { return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200)); }

  async function handleSave(post: JournalPost) {
    startTransition(async () => {
      const result = editing ? await updatePost(editing.slug, post) : await addPost(post);
      if (result.ok) {
        notify(editing ? "Post updated!" : "Post published!");
        setView("list");
        setEditing(null);
        const data = await fetch("/api/admin/journal").then((r) => r.json());
        setPosts(data);
      } else { notify(`Error: ${result.error}`); }
    });
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      await deletePost(slug);
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      notify("Post deleted.");
    });
  }

  function startAdd() { setEditing(null); setView("add"); }
  function startEdit(post: JournalPost) { setEditing(post); setView("edit"); }
  function goBack() { setView("list"); setEditing(null); }
  function goToAi() { setView("ai"); }

  if (!loaded) return <div className="p-6"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  // ── Form / AI View ──────────────────────────────────────────────────────────
  if (view === "add" || view === "edit") {
    return (
      <PostEditor
        post={editing || EMPTY}
        isNew={view === "add"}
        onSave={handleSave}
        onCancel={goBack}
        isPending={isPending}
        msg={msg}
      />
    );
  }

  if (view === "ai") {
    return (
      <AiGenerator
        onCancel={goBack}
        onPublish={async (data) => {
          const slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60) || `post-${Date.now()}`;
          const newPost: JournalPost = {
            slug, title: data.title, date: new Date().toISOString().split("T")[0],
            excerpt: data.excerpt, tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
            content: data.content, status: "published",
          };
          startTransition(async () => {
            const result = await addPost(newPost);
            if (result.ok) { notify("Post published!"); setPosts((prev) => [newPost, ...prev]); setView("list"); }
            else { notify(`Error: ${result.error}`); }
          });
        }}
        isPending={isPending}
        msg={msg}
      />
    );
  }

  // ── List View ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 bg-black border-b border-rule px-5 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — Journal</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1.2rem, 3vw, 2.5rem)", lineHeight: 0.88 }}>Journal</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {msg && <span className="lab text-signal animate-pulse" style={{ fontSize: "0.52rem" }}>{msg}</span>}
            <input type="text" placeholder="Search…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border border-rule px-3 py-1.5 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.55rem", width: "140px" }} />
            <button onClick={goToAi} className="border border-signal/50 px-3 py-1.5 hover:bg-signal/20 transition-colors">
              <span className="lab text-white" style={{ fontSize: "0.55rem" }}>✨ AI Generate</span>
            </button>
            <button onClick={startAdd} className="border border-signal px-3 py-1.5 hover:bg-signal transition-colors">
              <span className="lab text-white hover:text-black" style={{ fontSize: "0.55rem" }}>+ New Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search / Filters */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-rule flex-wrap">
        <input type="text" placeholder="Search title, tag, or excerpt…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border border-rule px-3 py-1.5 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
          style={{ fontSize: "0.55rem", minWidth: "180px" }} />

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          {(["all", "published", "draft", "scheduled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="lab px-2 py-1 transition-colors"
              style={{
                fontSize: "0.5rem",
                color: statusFilter === s ? "#080808" : "rgba(240,240,238,0.35)",
                background: statusFilter === s ? "#ff3500" : "transparent",
                border: `1px solid ${statusFilter === s ? "#ff3500" : "rgba(240,240,238,0.12)"}`,
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-black border border-rule px-2 py-1.5 lab text-white/50 focus:outline-none focus:border-signal transition-colors"
          style={{ fontSize: "0.5rem" }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alpha">A → Z</option>
        </select>

        <span className="lab text-white/20 ml-auto" style={{ fontSize: "0.5rem" }}>
          {filtered.length} post{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2 px-5 py-3">
          {paginated.length === 0 ? (
            <div className="py-12 text-center">
              <p className="lab text-white/20" style={{ fontSize: "0.6rem" }}>No posts found.</p>
            </div>
          ) : paginated.map((post) => (
            <div key={post.slug} className="border border-rule hover:border-signal/50 transition-colors group">
              <div className="flex items-start gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap mb-2">
                    <p className="lab text-white truncate" style={{ fontSize: "0.65rem" }}>{post.title}</p>
                    <span className={`lab px-1.5 py-0.5 shrink-0 ${post.status === "published" ? "text-signal border border-signal/30" : post.status === "draft" ? "text-white/40 border border-white/20" : "text-white/30 border border-white/10"}`} style={{ fontSize: "0.42rem" }}>
                      {post.status}
                    </span>
                  </div>
                  <p className="lab text-white/40 line-clamp-2 mb-3" style={{ fontSize: "0.55rem" }}>{post.excerpt}</p>
                  <div className="flex items-center gap-4">
                    <span className="lab text-white/25" style={{ fontSize: "0.48rem" }}>
                      {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="lab text-white/25" style={{ fontSize: "0.48rem" }}>·</span>
                    <span className="lab text-white/25" style={{ fontSize: "0.48rem" }}>
                      {readingTime(post.content ?? post.excerpt)} min read
                    </span>
                    <div className="flex gap-2 flex-wrap ml-auto">
                      {post.tags?.slice(0, 3).map((t) => (
                        <span key={t} className="lab text-white/20 border border-rule px-1.5 py-0.5" style={{ fontSize: "0.4rem" }}>{t}</span>
                      ))}
                      {post.tags && post.tags.length > 3 && (
                        <span className="lab text-white/20 px-1.5 py-0.5" style={{ fontSize: "0.4rem" }}>+{post.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(post)} className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.5rem" }}>Edit</button>
                  <Link href={`/journal/${post.slug}`} target="_blank" className="lab text-white/20 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>↗</Link>
                  <button onClick={() => handleDelete(post.slug, post.title)} disabled={isPending} className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.5rem" }}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-t border-rule bg-black">
        <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>{filtered.length} posts · page {page}/{totalPages}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="lab px-2 py-1 border border-rule hover:border-signal disabled:opacity-30" style={{ fontSize: "0.5rem", color: "rgba(240,240,238,0.5)" }}>←</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p;
            if (totalPages <= 5) {
              p = i + 1;
            } else if (page <= 3) {
              p = i + 1;
            } else if (page >= totalPages - 2) {
              p = totalPages - 4 + i;
            } else {
              p = page - 2 + i;
            }
            return (
              <button key={p} onClick={() => setPage(p)} className="lab px-2 py-1 border transition-colors"
                style={{
                  fontSize: "0.5rem",
                  color: p === page ? "#080808" : "rgba(240,240,238,0.5)",
                  background: p === page ? "#ff3500" : "transparent",
                  border: `1px solid ${p === page ? "#ff3500" : "rgba(240,240,238,0.12)"}`,
                }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="lab px-2 py-1 border border-rule hover:border-signal disabled:opacity-30" style={{ fontSize: "0.5rem", color: "rgba(240,240,238,0.5)" }}>→</button>
        </div>
      </div>
    </div>
  );
}

// ── Post Editor ─────────────────────────────────────────────────────────────────
function PostEditor({ post: initial, isNew, onSave, onCancel, isPending, msg }: {
  post: JournalPost;
  isNew: boolean;
  onSave: (p: JournalPost) => void;
  onCancel: () => void;
  isPending: boolean;
  msg: string;
}) {
  const [form, setForm] = useState(initial);
  const [tagsStr, setTagsStr] = useState(initial.tags.join(", "));
  const [isDirty, setIsDirty] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);

  const set = (k: keyof JournalPost) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsDirty(true);
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("post-submit")?.click();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleCancel() {
    if (isDirty && !confirm("You have unsaved changes. Discard them?")) return;
    onCancel();
  }

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleGenerateTitle() {
    if (!form.excerpt.trim() && !form.content.trim()) { alert("Enter an excerpt or content first"); return; }
    setGeneratingTitle(true);
    try {
      const res = await fetch("/api/admin/ai/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: (form.excerpt || form.content).trim(), category: "journal" }),
      });
      const data = await res.json();
      if (data.title) {
        setForm((p) => ({ ...p, title: data.title }));
        if (isNew && !form.slug) setForm((p) => ({ ...p, slug: generateSlug(data.title) }));
      } else alert(data.error || "Failed to generate");
    } catch { alert("Failed to generate title"); }
    finally { setGeneratingTitle(false); }
  }

  async function handleGenerateExcerpt() {
    if (!form.title.trim()) { alert("Enter a title first"); return; }
    setGeneratingExcerpt(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), type: "summary", category: "journal" }),
      });
      const data = await res.json();
      if (data.result) setForm((p) => ({ ...p, excerpt: data.result }));
      else alert(data.error || "Failed to generate");
    } catch { alert("Failed to generate excerpt"); }
    finally { setGeneratingExcerpt(false); }
  }

  async function handleGenerateContent() {
    if (!form.title.trim()) { alert("Enter a title first"); return; }
    setGeneratingContent(true);
    try {
      const res = await fetch("/api/admin/ai/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: form.title.trim() }),
      });
      const data = await res.json();
      if (data.content) setForm((p) => ({ ...p, content: data.content }));
      else if (data.error) alert(data.error);
      else alert("Failed to generate content");
    } catch { alert("Failed to generate content"); }
    finally { setGeneratingContent(false); }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      slug: form.slug || generateSlug(form.title),
      tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  const inputCls = "w-full bg-dim border-b border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-rule z-10">
        <div className="flex items-center gap-4 px-5 py-3">
          <button onClick={handleCancel} className="lab text-white/30 hover:text-white transition-colors flex items-center gap-2" style={{ fontSize: "0.55rem" }}>
            ← Back
          </button>
          <div className="h-4 w-px bg-rule" />
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — {isNew ? "New Post" : "Edit Post"}</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.8rem)", lineHeight: 0.88 }}>
              {isNew ? "Create New Post" : `Editing — ${initial.title}`}
            </p>
          </div>
          {msg && <span className="lab text-signal animate-pulse ml-auto" style={{ fontSize: "0.52rem" }}>{msg}</span>}
        </div>
      </div>

      <form onSubmit={submit} className="p-6 max-w-3xl">
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className={labelCls} style={fs}>Title *</label>
            <div className="flex items-center gap-2">
              <input required value={form.title} onChange={(e) => { set("title")(e); if (isNew && !form.slug) setForm((p) => ({ ...p, slug: generateSlug(e.target.value) })); }} className={inputCls} style={fs} placeholder="Post title" />
              <button type="button" onClick={handleGenerateTitle} disabled={generatingTitle || (!form.excerpt.trim() && !form.content.trim())} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap" title="Generate title from excerpt/content">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTitle ? "..." : "✨ Title"}</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelCls} style={fs}>Slug {isNew && <span className="text-white/20">(auto-generated)</span>}</label>
              <input value={form.slug} onChange={set("slug")} className={inputCls} style={fs} placeholder="post-slug" />
            </div>
            <div>
              <label className={labelCls} style={fs}>Date *</label>
              <input required type="date" value={form.date} onChange={set("date")} className={inputCls} style={fs} />
            </div>
          </div>
          <div>
            <label className={labelCls} style={fs}>Status</label>
            <div className="flex gap-2 mt-1">
              {(["published", "draft", "scheduled"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className="lab px-3 py-1.5 border transition-colors"
                  style={{
                    fontSize: "0.55rem",
                    color: form.status === s ? "#080808" : "rgba(240,240,238,0.5)",
                    background: form.status === s ? "#ff3500" : "transparent",
                    borderColor: form.status === s ? "#ff3500" : "rgba(240,240,238,0.12)",
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {form.status === "draft" && <span className="lab text-white/30 mt-1 block" style={fs}>Draft — not visible to public</span>}
            {form.status === "scheduled" && (
              <div className="mt-2">
                <label className={labelCls} style={fs}>Scheduled Date & Time</label>
                <input type="datetime-local" value={form.scheduledAt || ""} onChange={set("scheduledAt")} className={inputCls} style={fs} />
              </div>
            )}
          </div>
          <div>
            <label className={labelCls} style={fs}>Tags (comma separated)</label>
            <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className={inputCls} style={fs} placeholder="Design, Process, 3D" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Excerpt (1–2 sentences) *</label>
            <div className="flex items-center gap-2">
              <textarea required rows={2} value={form.excerpt} onChange={set("excerpt")} className={inputCls} style={{ ...fs, resize: "none" }} placeholder="Short description shown in listing" />
              <button type="button" onClick={handleGenerateExcerpt} disabled={generatingExcerpt || !form.title.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap self-start mt-1" title="Generate excerpt from title">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingExcerpt ? "..." : "✨ Excerpt"}</span>
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls} style={fs}>Content (full article) *</label>
            <div className="flex items-start gap-2">
              <textarea required rows={12} value={form.content} onChange={set("content")} className={inputCls} style={{ ...fs, resize: "vertical" }} placeholder="Full post content. Plain text or markdown." />
              <button type="button" onClick={handleGenerateContent} disabled={generatingContent || !form.title.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap self-start mt-1" title="Generate full content from title">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingContent ? "..." : "✨ Content"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 border-t border-rule pt-5">
          <button type="submit" id="post-submit" disabled={isPending} className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white group-hover:text-black transition-colors" style={fs}>{isPending ? "Saving..." : "Save Post"}</span>
          </button>
          <button type="button" onClick={handleCancel} className="lab text-white/30 hover:text-white transition-colors" style={fs}>Cancel</button>
          {!isNew && <Link href={`/journal/${initial.slug}`} target="_blank" className="lab text-white/20 hover:text-white ml-auto" style={{ fontSize: "0.55rem" }}>View live ↗</Link>}
          <span className="lab text-white/20 ml-auto" style={{ fontSize: "0.5rem" }}>Ctrl+S to save</span>
        </div>
      </form>
    </div>
  );
}

// ── AI Generator ────────────────────────────────────────────────────────────────
function AiGenerator({ onCancel, onPublish, isPending, msg }: {
  onCancel: () => void;
  onPublish: (data: { title: string; excerpt: string; tags: string; content: string }) => void;
  isPending: boolean;
  msg: string;
}) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; excerpt: string; tags: string; content: string; error?: string } | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/ai/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch { setResult({ error: "Request failed", title: "", excerpt: "", tags: "", content: "" }); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-rule z-10">
        <div className="flex items-center gap-4 px-5 py-3">
          <button onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors flex items-center gap-2" style={{ fontSize: "0.55rem" }}>
            ← Back
          </button>
          <div className="h-4 w-px bg-rule" />
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — AI Generate</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.8rem)", lineHeight: 0.88 }}>AI Journal Post</p>
          </div>
          {msg && <span className="lab text-signal animate-pulse ml-auto" style={{ fontSize: "0.52rem" }}>{msg}</span>}
        </div>
      </div>

      <div className="p-6 max-w-3xl">
        <form onSubmit={generate} className="mb-6">
          <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.58rem" }}>Topic / Subject *</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g. 'The creative process behind my latest 3D project'"
              required
              className="flex-1 bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.6rem" }}
            />
            <button type="submit" disabled={loading || !topic.trim()} className="border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
              <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{loading ? "Generating…" : "Generate"}</span>
            </button>
          </div>
        </form>

        {result && (
          <div className="border border-rule">
            {result.error ? (
              <div className="px-5 py-4"><p className="lab text-red-400" style={{ fontSize: "0.6rem" }}>{result.error}</p></div>
            ) : (
              <div className="divide-y divide-rule">
                <div className="px-5 py-4">
                  <span className="lab text-signal block mb-2" style={{ fontSize: "0.52rem" }}>Title</span>
                  <p className="text-white/80" style={{ fontSize: "0.85rem" }}>{result.title}</p>
                </div>
                <div className="px-5 py-4">
                  <span className="lab text-signal block mb-2" style={{ fontSize: "0.52rem" }}>Excerpt</span>
                  <p className="text-white/80" style={{ fontSize: "0.85rem" }}>{result.excerpt}</p>
                </div>
                <div className="px-5 py-4">
                  <span className="lab text-signal block mb-2" style={{ fontSize: "0.52rem" }}>Tags</span>
                  <p className="text-white/80" style={{ fontSize: "0.85rem" }}>{result.tags}</p>
                </div>
                <div className="px-5 py-4">
                  <span className="lab text-signal block mb-2" style={{ fontSize: "0.52rem" }}>Content Preview</span>
                  <p className="text-white/60 leading-relaxed" style={{ fontSize: "0.8rem" }}>{result.content}</p>
                </div>
                <div className="px-5 py-4">
                  <button onClick={() => onPublish(result)} disabled={isPending} className="border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
                    <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{isPending ? "Publishing..." : "Publish Now"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="lab text-white/20 mt-4" style={{ fontSize: "0.5rem" }}>
          AI-generated content should be reviewed and edited before publishing.
        </p>
      </div>
    </div>
  );
}
