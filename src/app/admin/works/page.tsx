"use client";

import { useState, useEffect, useTransition } from "react";
import { addWork, updateWork, deleteWork, toggleFeatured } from "@/app/admin/actions";
import type { Project } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["3D", "Illustration", "Graphic Design", "Animation"] as const;
const PAGE_SIZE = 15;
const EMPTY: Project = {
  slug: "", title: "", year: new Date().getFullYear().toString(),
  category: "3D", client: "", summary: "", description: "",
  tags: [], cover: "", gallery: [], featured: false, type: "client",
};

export default function AdminWorks() {
  const [isPending, startTransition] = useTransition();
  const [works, setWorks] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Project | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"type-client" | "type-personal" | "">("");

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [filter, search]);

  useEffect(() => {
    fetch("/api/admin/works?t=" + Date.now()).then((r) => r.json()).then((data) => {
      const clientWorks = (data as Project[]).filter((w: Project) => w.type === "client" || !w.type);
      setWorks(clientWorks);
      setLoaded(true);
    });
  }, []);

  function notify(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  const filtered = works.filter((p) => {
    const matchCat = filter === "All" || p.category === filter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleSave(work: Project) {
    startTransition(async () => {
      const result = editing ? await updateWork(editing.slug, work) : await addWork(work);
      if (result.ok) {
        notify(editing ? "Work updated!" : "Work added!");
        setView("list");
        setEditing(null);
        const data = await fetch("/api/admin/works?t=" + Date.now()).then((r) => r.json());
        const clientWorks = (data as Project[]).filter((w: Project) => w.type === "client" || !w.type);
        setWorks(clientWorks);
      } else {
        notify(`Error: ${result.error}`);
      }
    });
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      await deleteWork(slug);
      setWorks((prev) => prev.filter((w) => w.slug !== slug));
      notify("Work deleted.");
    });
  }

  async function handleToggleFeatured(slug: string) {
    startTransition(async () => {
      await toggleFeatured(slug);
      setWorks((prev) => prev.map((w) => w.slug === slug ? { ...w, featured: !w.featured } : w));
    });
  }

  function toggleSelectAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((p) => p.slug)));
    }
  }

  function toggleSelect(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
  }

  async function handleBulkUpdate() {
    if (!bulkAction || selected.size === 0) return;
    const newType = bulkAction === "type-client" ? "client" : "personal";
    startTransition(async () => {
      for (const slug of selected) {
        const work = works.find((w) => w.slug === slug);
        if (work) await updateWork(slug, { ...work, type: newType });
      }
      setWorks((prev) => prev.map((w) => selected.has(w.slug) ? { ...w, type: newType } : w));
      setSelected(new Set());
      setBulkAction("");
      notify(`Updated ${selected.size} works`);
    });
  }

  function startAdd() {
    setEditing(null);
    setView("add");
  }

  function startEdit(work: Project) {
    setEditing(work);
    setView("edit");
  }

  function goBack() {
    setView("list");
    setEditing(null);
  }

  const fs = { fontSize: "0.6rem" };

  if (!loaded) return <div className="p-6"><span className="lab text-white/30" style={fs}>Loading…</span></div>;

  // ── Form View ──────────────────────────────────────────────────────────────
  if (view === "add" || view === "edit") {
    return (
      <WorkEditor
        work={editing || EMPTY}
        isNew={view === "add"}
        onSave={handleSave}
        onCancel={goBack}
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
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — Works</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1.2rem, 3vw, 2.5rem)", lineHeight: 0.88 }}>Works</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {msg && <span className="lab text-signal animate-pulse" style={{ fontSize: "0.52rem" }}>{msg}</span>}
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border border-rule px-3 py-1.5 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.55rem", width: "140px" }}
            />
            <div className="flex gap-1">
              {["All", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className="lab px-2 py-1 transition-colors"
                  style={{
                    fontSize: "0.5rem",
                    color: filter === c ? "#080808" : "rgba(240,240,238,0.35)",
                    background: filter === c ? "#ff3500" : "transparent",
                    border: `1px solid ${filter === c ? "#ff3500" : "rgba(240,240,238,0.12)"}`,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <button onClick={startAdd} className="border border-signal px-3 py-1.5 hover:bg-signal transition-colors">
              <span className="lab text-white hover:text-black" style={{ fontSize: "0.55rem" }}>+ Add Work</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="shrink-0 bg-signal/10 border-b border-rule px-5 py-2 flex items-center gap-3">
          <span className="lab text-white" style={{ fontSize: "0.55rem" }}>{selected.size} selected</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value as typeof bulkAction)}
            className="bg-black border border-rule px-2 py-1 lab text-white"
            style={{ fontSize: "0.5rem" }}
          >
            <option value="">Bulk actions…</option>
            <option value="type-client">Set as Client Work</option>
            <option value="type-personal">Set as Personal Work</option>
          </select>
          <button onClick={handleBulkUpdate} disabled={!bulkAction || isPending} className="border border-signal px-3 py-1 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white" style={{ fontSize: "0.5rem" }}>Apply</span>
          </button>
          <button onClick={() => setSelected(new Set())} className="lab text-white/50 hover:text-white" style={{ fontSize: "0.5rem" }}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="grid border-b border-rule px-5 py-2 sticky top-0 bg-black z-10" style={{ gridTemplateColumns: "32px 32px 1fr 100px 64px 40px 88px" }}>
          <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="accent-signal" />
          {["#", "Title / Client", "Category", "Year", "★", "Actions"].map((h) => (
            <span key={h} className="lab text-white/25" style={{ fontSize: "0.48rem" }}>{h}</span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="lab text-white/20" style={fs}>No works found.</p>
          </div>
        ) : (
          paginated.map((p) => (
            <div
              key={p.slug}
              className="grid items-center border-b border-rule px-5 py-2.5 hover:bg-white/[0.02] transition-colors"
              style={{ gridTemplateColumns: "32px 32px 1fr 100px 64px 40px 88px" }}
            >
              <input type="checkbox" checked={selected.has(p.slug)} onChange={() => toggleSelect(p.slug)} className="accent-signal" />
              <div className="relative w-10 h-7 bg-rule overflow-hidden shrink-0 mr-2">
                {p.cover ? <Image src={p.cover} alt="" fill className="object-cover" unoptimized /> : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="lab text-white/15" style={{ fontSize: "0.4rem" }}>—</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 mr-3">
                <p className="lab text-white truncate" style={{ fontSize: "0.6rem" }}>{p.title}</p>
                <p className="lab text-white/30 truncate" style={{ fontSize: "0.48rem" }}>{p.client}</p>
              </div>
              <span className="lab text-white/40" style={{ fontSize: "0.52rem" }}>{p.category}</span>
              <span className="lab text-white/40" style={{ fontSize: "0.52rem" }}>{p.year}</span>
              <button onClick={() => handleToggleFeatured(p.slug)} disabled={isPending} className="lab text-left" style={{ fontSize: "0.7rem", color: p.featured ? "#ff3500" : "rgba(240,240,238,0.15)" }}>
                {p.featured ? "★" : "☆"}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(p)} className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.5rem" }}>Edit</button>
                <Link href={`/works/${p.slug}`} target="_blank" className="lab text-white/20 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>↗</Link>
                <button onClick={() => handleDelete(p.slug, p.title)} disabled={isPending} className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.5rem" }}>Del</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-t border-rule bg-black">
        <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>{filtered.length} works · page {page} of {totalPages}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="lab px-2 py-1 border border-rule hover:border-signal transition-colors disabled:opacity-30" style={{ fontSize: "0.5rem", color: "rgba(240,240,238,0.5)" }}>←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="lab px-2 py-1 border transition-colors"
              style={{
                fontSize: "0.5rem",
                color: p === page ? "#080808" : "rgba(240,240,238,0.5)",
                background: p === page ? "#ff3500" : "transparent",
                border: `1px solid ${p === page ? "#ff3500" : "rgba(240,240,238,0.12)"}`,
              }}
            >
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="lab px-2 py-1 border border-rule hover:border-signal transition-colors disabled:opacity-30" style={{ fontSize: "0.5rem", color: "rgba(240,240,238,0.5)" }}>→</button>
        </div>
      </div>
    </div>
  );
}

// ── Work Editor Component ─────────────────────────────────────────────────────
function WorkEditor({ work: initial, isNew, onSave, onCancel, isPending, msg }: {
  work: Project;
  isNew: boolean;
  onSave: (p: Project) => void;
  onCancel: () => void;
  isPending: boolean;
  msg: string;
}) {
  const [form, setForm] = useState<Project>(initial);
  const [tagsStr, setTagsStr] = useState(initial.tags.join(", "));
  const [galleryStr, setGalleryStr] = useState(initial.gallery.join("\n"));
  const [uploadingCover, setUploadingCover] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);

  const set = (k: keyof Project) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "works");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) setForm((p) => ({ ...p, cover: data.path }));
      else alert(data.error || "Upload failed");
    } catch { alert("Upload failed"); }
    finally { setUploadingCover(false); }
  }

  async function handleGenerateTags() {
    if (!form.title.trim()) { alert("Enter a title first"); return; }
    setGeneratingTags(true);
    try {
      const res = await fetch("/api/admin/ai/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, category: form.category }),
      });
      const data = await res.json();
      if (data.tags) setTagsStr(data.tags);
      else alert(data.error || "Failed to generate");
    } catch { alert("Failed to generate tags"); }
    finally { setGeneratingTags(false); }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsStr.trim() ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [form.category];
    const work: Project = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      tags,
      gallery: galleryStr.split("\n").map((t) => t.trim()).filter(Boolean),
    };
    onSave(work);
  }

  const inputCls = "w-full bg-transparent border-b border-rule py-2 lab text-white placeholder:text-white/15 focus:outline-none focus:border-signal transition-colors";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

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
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — {isNew ? "New Work" : "Edit Work"}</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.8rem)", lineHeight: 0.88 }}>
              {isNew ? "Add New Work" : `Editing — ${initial.title}`}
            </p>
          </div>
          {msg && <span className="lab text-signal animate-pulse ml-auto" style={{ fontSize: "0.52rem" }}>{msg}</span>}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="p-6 max-w-4xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelCls} style={fs}>Title *</label>
            <input required value={form.title} onChange={set("title")} className={inputCls} style={fs} placeholder="Project title" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Slug (auto if empty)</label>
            <input value={form.slug} onChange={set("slug")} className={inputCls} style={fs} placeholder="project-slug" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Client *</label>
            <input required value={form.client} onChange={set("client")} className={inputCls} style={fs} placeholder="Client name" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Year *</label>
            <input required value={form.year} onChange={set("year")} className={inputCls} style={fs} placeholder="2024" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Category *</label>
            <select required value={form.category} onChange={set("category")} className={inputCls} style={fs}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={fs}>Type *</label>
            <select required value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "client" | "personal" }))} className={inputCls} style={fs}>
              <option value="client">Client Work</option>
              <option value="personal">Personal Work</option>
            </select>
          </div>
          <div>
            <label className={labelCls} style={fs}>Cover image</label>
            <div className="flex items-center gap-2">
              <input value={form.cover} onChange={set("cover")} className={inputCls} style={fs} placeholder="/images/works/project.jpg" />
              <label className="border border-rule px-3 py-2 hover:border-signal transition-colors cursor-pointer">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{uploadingCover ? "..." : "Upload"}</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            </div>
            {form.cover && (
              <div className="mt-2 relative w-20 h-14 bg-rule overflow-hidden">
                <img src={form.cover} alt="" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} style={fs}>Summary (1 sentence) *</label>
            <input required value={form.summary} onChange={set("summary")} className={inputCls} style={fs} placeholder="Brief summary" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} style={fs}>Description (full)</label>
            <textarea rows={4} value={form.description} onChange={set("description")} className={inputCls} style={{ ...fs, resize: "none" }} placeholder="Full project description" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Tags (comma separated)</label>
            <div className="flex items-center gap-2">
              <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className={inputCls} style={fs} placeholder="Leave empty for AI generate" />
              <button type="button" onClick={handleGenerateTags} disabled={generatingTags} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTags ? "..." : "✨ AI"}</span>
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls} style={fs}>Gallery (one path per line)</label>
            <textarea rows={3} value={galleryStr} onChange={(e) => setGalleryStr(e.target.value)} className={inputCls} style={{ ...fs, resize: "none" }} placeholder="/images/works/project/01.jpg" />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} className="accent-signal" />
            <label htmlFor="featured" className="lab text-white/50 cursor-pointer" style={fs}>Featured on homepage</label>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 border-t border-rule pt-5">
          <button type="submit" disabled={isPending} className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white group-hover:text-black transition-colors" style={fs}>{isPending ? "Saving..." : "Save Work"}</span>
          </button>
          <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={fs}>Cancel</button>
          {!isNew && <Link href={`/works/${initial.slug}`} target="_blank" className="lab text-white/20 hover:text-white ml-auto" style={{ fontSize: "0.55rem" }}>View live ↗</Link>}
        </div>
      </form>
    </div>
  );
}
