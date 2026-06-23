"use client";

import { useState, useEffect, useTransition } from "react";
import { addPost, updatePost, deletePost } from "@/app/admin/actions";
import type { JournalPost } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 15;
const EMPTY: JournalPost = {
  slug: "", title: "", date: new Date().toISOString().split("T")[0],
  excerpt: "", content: "", tags: [], status: "published",
};

function PostForm({ initial, onSave, onCancel, isNew }: {
  initial: JournalPost; onSave: (p: JournalPost) => void; onCancel: () => void; isNew: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [tagsStr, setTagsStr] = useState(initial.tags.join(", "));

  const set = (k: keyof JournalPost) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  const inputCls = "w-full bg-transparent border-b border-rule py-2 lab text-white placeholder:text-white/15 focus:outline-none focus:border-signal transition-colors";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

  return (
    <form onSubmit={submit} className="border border-signal p-6">
      <h2 className="dis text-white mb-6" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 0.9 }}>
        {isNew ? "New Post" : `Edit — ${initial.title}`}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Title *</label>
          <input required value={form.title} onChange={set("title")} className={inputCls} style={fs} placeholder="Post title" />
        </div>
        <div>
          <label className={labelCls} style={fs}>Slug (auto if empty)</label>
          <input value={form.slug} onChange={set("slug")} className={inputCls} style={fs} placeholder="post-slug" />
        </div>
        <div>
          <label className={labelCls} style={fs}>Date *</label>
          <input required type="date" value={form.date} onChange={set("date")} className={inputCls} style={fs} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Status</label>
          <div className="flex gap-2 mt-1">
            {(["published", "draft", "scheduled"] as const).map((s) => (
              <button key={s} type="button"
                onClick={() => setForm((prev) => ({ ...prev, status: s }))}
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
        </div>
        {form.status === "scheduled" && (
          <div className="md:col-span-2">
            <label className={labelCls} style={fs}>Scheduled Date & Time</label>
            <input type="datetime-local" value={form.scheduledAt || ""} onChange={set("scheduledAt")}
              className={inputCls} style={fs} />
          </div>
        )}
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Tags (comma separated)</label>
          <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className={inputCls} style={fs} placeholder="Design, Process, 3D" />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Excerpt (1–2 sentences) *</label>
          <textarea required rows={2} value={form.excerpt} onChange={set("excerpt")} className={inputCls} style={{ ...fs, resize: "none" }} placeholder="Short description shown in listing" />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Content (full article) *</label>
          <textarea required rows={12} value={form.content} onChange={set("content")} className={inputCls} style={{ ...fs, resize: "vertical" }} placeholder="Full post content. Plain text or markdown." />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="submit" className="group inline-flex items-center gap-4 border border-signal px-5 py-3 hover:bg-signal transition-colors">
          <span className="lab text-white group-hover:text-black transition-colors" style={fs}>Save post</span>
        </button>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={fs}>Cancel</button>
        {form.status === "draft" && (
          <span className="lab text-white/30" style={fs}>Draft — not visible to public</span>
        )}
        {form.status === "scheduled" && (
          <span className="lab text-white/30" style={fs}>Scheduled for: {form.scheduledAt ? new Date(form.scheduledAt).toLocaleString() : "not set"}</span>
        )}
      </div>
    </form>
  );
}

function AiGenerateModal({ onClose, onApply }: { onClose: () => void; onApply: (data: { title: string; excerpt: string; tags: string; content: string }) => void }) {
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
    } catch {
      setResult({ error: "Request failed", title: "", excerpt: "", tags: "", content: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-black border border-rule w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-black border-b border-rule px-6 py-4 flex items-center justify-between">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>AI Tools</span>
            <h2 className="dis text-white" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 0.88 }}>Generate Journal Post</h2>
          </div>
          <button onClick={onClose} className="lab text-white/30 hover:text-white" style={{ fontSize: "0.6rem" }}>✕ Close</button>
        </div>

        <div className="p-6">
          <form onSubmit={generate} className="mb-6">
            <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.58rem" }}>Topic / Subject</label>
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
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40"
              >
                <span className="lab text-white" style={{ fontSize: "0.6rem" }}>
                  {loading ? "Generating…" : "Generate"}
                </span>
              </button>
            </div>
          </form>

          {result && (
            <div className="border border-rule">
              {result.error ? (
                <div className="px-5 py-4">
                  <p className="lab text-red-400" style={{ fontSize: "0.6rem" }}>{result.error}</p>
                </div>
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
                    <p className="text-white/60 leading-relaxed line-clamp-6" style={{ fontSize: "0.8rem" }}>{result.content}</p>
                  </div>
                  <div className="px-5 py-4">
                    <button
                      onClick={() => { onApply(result); onClose(); }}
                      className="border border-signal px-6 py-3 hover:bg-signal transition-colors"
                    >
                      <span className="lab text-white" style={{ fontSize: "0.6rem" }}>Publish Now</span>
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
    </div>
  );
}

export default function AdminJournal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<JournalPost | null>(null);
  const [msg, setMsg] = useState("");
  const [showAi, setShowAi] = useState(false);

  useEffect(() => { setPage(1); }, [search]);

  useEffect(() => {
    fetch("/api/admin/journal").then((r) => r.json()).then((d) => { setPosts(d); setLoaded(true); });
  }, []);

  function notify(text: string) { setMsg(text); setTimeout(() => setMsg(""), 3000); }

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function readingTime(text: string) { return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200)); }

  async function handleSave(post: JournalPost) {
    startTransition(async () => {
      const result = mode === "edit" && editing
        ? await updatePost(editing.slug, post)
        : await addPost(post);
      if (result.ok) {
        notify(mode === "add" ? "Post published!" : "Post updated!");
        setMode("list");
        setEditing(null);
        setTimeout(() => window.location.reload(), 500);
      } else { notify(`Error: ${result.error}`); }
    });
  }

  function handleAiApply(data: { title: string; excerpt: string; tags: string; content: string }) {
    const newPost: JournalPost = {
      slug: "",
      title: data.title,
      date: new Date().toISOString().split("T")[0],
      excerpt: data.excerpt,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      content: data.content,
      status: "published",
    };
    startTransition(async () => {
      const result = await addPost(newPost);
      if (result.ok) {
        notify("Post published!");
        setShowAi(false);
        const res = await fetch("/api/admin/journal");
        const d = await res.json();
        setPosts(d);
      } else {
        notify(`Error: ${result.error}`);
      }
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

  if (!loaded) return <div className="p-6"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 bg-black border-b border-rule px-5 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — Journal</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", lineHeight: 0.88 }}>Journal</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {msg && <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>{msg}</span>}
            <button
              onClick={() => setShowAi(true)}
              className="border border-signal/50 px-3 py-1.5 hover:bg-signal/20 transition-colors"
            >
              <span className="lab text-white" style={{ fontSize: "0.55rem" }}>✨ AI Generate</span>
            </button>
            <button onClick={() => { setMode("add"); setEditing(null); }}
              className="border border-signal px-3 py-1.5 hover:bg-signal transition-colors">
              <span className="lab text-white hover:text-black" style={{ fontSize: "0.55rem" }}>+ New</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAi && <AiGenerateModal onClose={() => setShowAi(false)} onApply={handleAiApply} />}

      {/* Add/Edit form */}
      {(mode === "add" || mode === "edit") && (
        <div className="mb-6">
          <PostForm
            initial={mode === "edit" && editing ? editing : EMPTY}
            onSave={handleSave}
            onCancel={() => { setMode("list"); setEditing(null); }}
            isNew={mode === "add"}
          />
        </div>
      )}

      {/* List */}
      {mode === "list" && (
        <>
          {/* Filters */}
          <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-rule flex-wrap">
            <input type="text" placeholder="Search title or tag…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border border-rule px-3 py-1.5 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.55rem", minWidth: "160px" }} />
          </div>

          {/* Card list */}
          <div className="flex-1 overflow-auto">
            <div className="space-y-2 px-5 py-3">
              {paginated.map((post) => (
                <div key={post.slug} className="border border-rule hover:border-signal/50 transition-colors">
                  <div className="flex items-start gap-4 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap mb-1">
                        <p className="lab text-white truncate" style={{ fontSize: "0.6rem" }}>{post.title}</p>
                        <span className="lab text-white/30 shrink-0" style={{ fontSize: "0.48rem" }}>
                          {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {" · "}{readingTime(post.content ?? post.excerpt)} min
                        </span>
                      </div>
                      <p className="lab text-white/40 line-clamp-1" style={{ fontSize: "0.52rem" }}>{post.excerpt}</p>
                      <div className="mt-1.5 flex gap-2 flex-wrap">
                        {post.tags?.map((t) => (
                          <span key={t} className="lab text-white/20 border border-rule px-1.5 py-0.5" style={{ fontSize: "0.42rem" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setEditing(post); setMode("edit"); }} className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.5rem" }}>Edit</button>
                      <Link href={`/journal/${post.slug}`} target="_blank" className="lab text-white/20 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>↗</Link>
                      <button onClick={() => handleDelete(post.slug, post.title)} disabled={isPending} className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.5rem" }}>Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-2 border-t border-rule">
            <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>
              {filtered.length} posts · page {page}/{totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="lab px-2 py-1 border border-rule hover:border-signal disabled:opacity-30" style={{ fontSize: "0.5rem", color: "rgba(240,240,238,0.5)" }}>←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className="lab px-2 py-1 border transition-colors"
                  style={{
                    fontSize: "0.5rem",
                    color: p === page ? "#080808" : "rgba(240,240,238,0.5)",
                    background: p === page ? "#ff3500" : "transparent",
                    border: `1px solid ${p === page ? "#ff3500" : "rgba(240,240,238,0.12)"}`,
                  }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="lab px-2 py-1 border border-rule hover:border-signal disabled:opacity-30" style={{ fontSize: "0.5rem", color: "rgba(240,240,238,0.5)" }}>→</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
