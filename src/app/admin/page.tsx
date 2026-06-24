"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import type { Project, JournalPost } from "@/lib/types";

const CATEGORIES = ["3D", "Illustration", "Graphic Design", "Animation"] as const;

const quickLinks = [
  { label: "View Homepage", href: "/", external: true },
  { label: "View Works", href: "/works", external: true },
  { label: "View Labs", href: "/labs", external: true },
  { label: "View Journal", href: "/journal", external: true },
  { label: "Formspree Inbox", href: "https://formspree.io/forms/xrewgrkl/submissions", external: true },
  { label: "GitHub Repo", href: "https://github.com", external: true },
];

const adminTools = [
  { label: "Media Library", href: "/admin/upload", desc: "Manage images & uploads", icon: "▣" },
  { label: "AI Tools", href: "/admin/tools", desc: "Content & visual AI generation", icon: "◆" },
  { label: "Page Content", href: "/admin/content", desc: "Homepage, About, Services, Labs, Contact", icon: "◈" },
  { label: "SEO & Clients", href: "/admin/settings", desc: "Site metadata & client list", icon: "◇" },
  { label: "Design Config", href: "/admin/design", desc: "Colors, typography, hero, favicon", icon: "◉" },
  { label: "Activity Log", href: "/admin/activity", desc: "All admin actions & changes", icon: "◎" },
  { label: "Backup", href: "/admin/backup", desc: "Export & import site data", icon: "◐" },
];

type TabKey = "overview" | "create" | "works" | "journal" | "media" | "tools";
type CreateTab = "work" | "personal" | "journal" | null;

const fs = { fontSize: "0.6rem" as const };
const labelCls = "lab text-white/50 block mb-1";
const inputCls = "w-full bg-transparent border border-rule px-4 py-2.5 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors";
const textareaCls = "w-full bg-transparent border border-rule px-4 py-2.5 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none";
const selectCls = "w-full bg-black border border-rule px-4 py-2.5 lab text-white focus:outline-none focus:border-signal transition-colors";

function generateSlug(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function EmptyState({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="border border-rule p-8 text-center">
      <p className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{message}</p>
      {action && (
        <button onClick={action.onClick} className="lab text-signal hover:text-white mt-2 transition-colors" style={{ fontSize: "0.55rem" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Inline Work Form with Full Features ────────────────────────────────────────
function InlineWorkForm({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", client: "", year: new Date().getFullYear().toString(),
    category: "3D", type: "client" as "client" | "personal", summary: "", description: "", tags: "", cover: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => {
      const updated = { ...prev, [k]: e.target.value };
      if (k === "title" && !prev.slug) updated.slug = generateSlug(e.target.value);
      return updated;
    });
  };

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("files", file);
        fd.append("category", "works");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.ok && data.results?.[0]?.path) {
          setGallery((prev) => [...prev, data.results[0].path]);
        }
      }
      setMsg("Gallery uploaded!");
    } catch { setMsg("Gallery upload failed"); }
    finally { setUploadingGallery(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGalleryDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const fd = new FormData();
        fd.append("files", file);
        fd.append("category", "works");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.ok && data.results?.[0]?.path) {
          setGallery((prev) => [...prev, data.results[0].path]);
        }
      }
      setMsg("Gallery uploaded!");
    } catch { setMsg("Gallery upload failed"); }
    finally { setUploadingGallery(false); setTimeout(() => setMsg(""), 2000); }
  }

  function removeFromGallery(img: string) {
    setGallery((prev) => prev.filter((g) => g !== img));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("category", "works");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok && data.results?.[0]?.path) {
        setForm((p) => ({ ...p, cover: data.results[0].path }));
        setMsg("Cover uploaded!");
        setTimeout(() => setMsg(""), 2000);
      } else {
        setMsg(data.error || "Upload failed");
      }
    } catch { setMsg("Upload failed"); }
    finally { setUploadingCover(false); }
  }

  async function handleGenerateTitle() {
    if (!form.description.trim()) { setMsg("Add description first"); return; }
    setGeneratingTitle(true);
    try {
      const res = await fetch("/api/admin/ai/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.description }),
      });
      const data = await res.json();
      if (data.title) {
        setForm((p) => ({ ...p, title: data.title, slug: generateSlug(data.title) }));
        setMsg("Title generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingTitle(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateDescription() {
    if (!form.title.trim()) { setMsg("Add title first"); return; }
    setGeneratingDesc(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, type: "description", category: form.category }),
      });
      const data = await res.json();
      if (data.result) {
        setForm((p) => ({ ...p, description: data.result }));
        setMsg("Description generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingDesc(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateSummary() {
    if (!form.title.trim()) { setMsg("Add title first"); return; }
    setGeneratingSummary(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, type: "summary", category: form.category }),
      });
      const data = await res.json();
      if (data.result) {
        setForm((p) => ({ ...p, summary: data.result }));
        setMsg("Summary generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingSummary(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateTags() {
    if (!form.title.trim()) { setMsg("Add title first"); return; }
    setGeneratingTags(true);
    try {
      const res = await fetch("/api/admin/ai/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, category: form.category }),
      });
      const data = await res.json();
      if (data.tags) {
        setForm((p) => ({ ...p, tags: data.tags }));
        setMsg("Tags generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingTags(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Saving...");
    startTransition(async () => {
      const res = await fetch("/api/admin/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gallery,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Work saved!");
        setTimeout(onSuccess, 1000);
      } else {
        setMsg(data.error || "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-rule p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — New Work</span>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white" style={{ fontSize: "0.5rem" }}>✕ Cancel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Title *</label>
          <div className="flex items-center gap-2">
            <input required value={form.title} onChange={set("title")} className={inputCls} style={fs} placeholder="Project title" />
            <button type="button" onClick={handleGenerateTitle} disabled={generatingTitle || !form.description.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap" title="Generate from description">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTitle ? "..." : "✨ Title"}</span>
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls} style={fs}>Slug</label>
          <input value={form.slug} onChange={set("slug")} className={inputCls} style={fs} placeholder="auto-generated" />
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
          <select required value={form.category} onChange={set("category")} className={selectCls} style={fs}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Cover Image</label>
          <div className="flex items-center gap-2">
            <input value={form.cover} onChange={set("cover")} className={inputCls} style={fs} placeholder="/images/works/project.jpg" />
            <label className="border border-rule px-4 py-2 hover:border-signal transition-colors cursor-pointer whitespace-nowrap">
              <span className="lab text-white/70" style={{ fontSize: "0.55rem" }}>{uploadingCover ? "..." : "Upload"}</span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </div>
          {form.cover && (
            <div className="mt-2 w-32 h-20 bg-rule overflow-hidden rounded">
              <img src={form.cover} alt="" className="object-cover w-full h-full" />
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Summary *</label>
          <div className="flex items-center gap-2">
            <input required value={form.summary} onChange={set("summary")} className={inputCls} style={fs} placeholder="One sentence summary" />
            <button type="button" onClick={handleGenerateSummary} disabled={generatingSummary || !form.title.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingSummary ? "..." : "✨ AI"}</span>
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Description</label>
          <div className="flex items-start gap-2">
            <textarea rows={4} value={form.description} onChange={set("description")} className={textareaCls} style={{ ...fs, resize: "vertical" }} placeholder="Full project description" />
            <button type="button" onClick={handleGenerateDescription} disabled={generatingDesc || !form.title.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 self-start mt-1" title="Generate from title">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingDesc ? "..." : "✨ Desc"}</span>
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Tags (comma separated)</label>
          <div className="flex items-center gap-2">
            <input value={form.tags} onChange={set("tags")} className={inputCls} style={fs} placeholder="3D, Animation, Character" />
            <button type="button" onClick={handleGenerateTags} disabled={generatingTags || !form.description.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTags ? "..." : "✨ AI"}</span>
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Gallery ({gallery.length} images)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleGalleryDrop}
            className={`border-2 border-dashed p-4 text-center transition-colors ${dragOver ? "border-signal bg-signal/5" : "border-rule hover:border-white/30"}`}
            style={{ borderRadius: "4px" }}
          >
            <input
              type="file"
              id="gallery-upload-inline"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <label htmlFor="gallery-upload-inline" className="cursor-pointer">
              <span className="lab text-white/50" style={{ fontSize: "0.6rem" }}>
                {uploadingGallery ? "Uploading..." : "Drop images here or click to upload"}
              </span>
            </label>
          </div>
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {gallery.map((img, i) => (
                <div key={i} className="relative group">
                  <div className="relative w-full h-16 bg-rule overflow-hidden rounded">
                    <img src={img} alt="" className="object-cover w-full h-full" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromGallery(img)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ fontSize: "0.6rem" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-5 border-t border-rule pt-4">
        <button type="submit" disabled={isPending} className="lab px-4 py-2 bg-signal text-white hover:bg-signal/80 transition-colors disabled:opacity-40" style={{ fontSize: "0.55rem" }}>
          {isPending ? "Saving..." : "Save Work"}
        </button>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>Cancel</button>
        {msg && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>{msg}</span>}
      </div>
    </form>
  );
}

// ── Inline Personal Work Form ───────────────────────────────────────────────────
function InlinePersonalWorkForm({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragOverGallery, setDragOverGallery] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", client: "Personal", year: new Date().getFullYear().toString(),
    category: "3D", type: "personal" as "client" | "personal", summary: "", description: "", tags: "", cover: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => {
      const updated = { ...prev, [k]: e.target.value };
      if (k === "title" && !prev.slug) updated.slug = generateSlug(e.target.value);
      return updated;
    });
  };

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("files", file);
        fd.append("category", "works");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.ok && data.results?.[0]?.path) {
          setGallery((prev) => [...prev, data.results[0].path]);
        }
      }
      setMsg("Gallery uploaded!");
    } catch { setMsg("Gallery upload failed"); }
    finally { setUploadingGallery(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGalleryDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOverGallery(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const fd = new FormData();
        fd.append("files", file);
        fd.append("category", "works");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.ok && data.results?.[0]?.path) {
          setGallery((prev) => [...prev, data.results[0].path]);
        }
      }
      setMsg("Gallery uploaded!");
    } catch { setMsg("Gallery upload failed"); }
    finally { setUploadingGallery(false); setTimeout(() => setMsg(""), 2000); }
  }

  function removeFromGallery(img: string) {
    setGallery((prev) => prev.filter((g) => g !== img));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("category", "works");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok && data.results?.[0]?.path) {
        setForm((p) => ({ ...p, cover: data.results[0].path }));
        setMsg("Cover uploaded!");
        setTimeout(() => setMsg(""), 2000);
      } else {
        setMsg(data.error || "Upload failed");
      }
    } catch { setMsg("Upload failed"); }
    finally { setUploadingCover(false); }
  }

  async function handleGenerateTitle() {
    if (!form.description.trim()) { setMsg("Add description first"); return; }
    setGeneratingTitle(true);
    try {
      const res = await fetch("/api/admin/ai/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.description }),
      });
      const data = await res.json();
      if (data.title) {
        setForm((p) => ({ ...p, title: data.title, slug: generateSlug(data.title) }));
        setMsg("Title generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingTitle(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateDescription() {
    if (!form.title.trim()) { setMsg("Add title first"); return; }
    setGeneratingDesc(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, type: "description", category: form.category }),
      });
      const data = await res.json();
      if (data.result) {
        setForm((p) => ({ ...p, description: data.result }));
        setMsg("Description generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingDesc(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateSummary() {
    if (!form.title.trim()) { setMsg("Add title first"); return; }
    setGeneratingSummary(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, type: "summary", category: form.category }),
      });
      const data = await res.json();
      if (data.result) {
        setForm((p) => ({ ...p, summary: data.result }));
        setMsg("Summary generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingSummary(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateTags() {
    if (!form.title.trim()) { setMsg("Add title first"); return; }
    setGeneratingTags(true);
    try {
      const res = await fetch("/api/admin/ai/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, category: form.category }),
      });
      const data = await res.json();
      if (data.tags) {
        setForm((p) => ({ ...p, tags: data.tags }));
        setMsg("Tags generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingTags(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Saving...");
    startTransition(async () => {
      const res = await fetch("/api/admin/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gallery,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Personal work saved!");
        setTimeout(onSuccess, 1000);
      } else {
        setMsg(data.error || "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-rule p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — New Personal Work</span>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white" style={{ fontSize: "0.5rem" }}>✕ Cancel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Title *</label>
          <div className="flex items-center gap-2">
            <input required value={form.title} onChange={set("title")} className={inputCls} style={fs} placeholder="Personal project title" />
            <button type="button" onClick={handleGenerateTitle} disabled={generatingTitle || !form.description.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap" title="Generate from description">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTitle ? "..." : "✨ Title"}</span>
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls} style={fs}>Slug</label>
          <input value={form.slug} onChange={set("slug")} className={inputCls} style={fs} placeholder="auto-generated" />
        </div>
        <div>
          <label className={labelCls} style={fs}>Year *</label>
          <input required value={form.year} onChange={set("year")} className={inputCls} style={fs} placeholder="2024" />
        </div>
        <div>
          <label className={labelCls} style={fs}>Category *</label>
          <select required value={form.category} onChange={set("category")} className={selectCls} style={fs}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Cover Image</label>
          <div className="flex items-center gap-2">
            <input value={form.cover} onChange={set("cover")} className={inputCls} style={fs} placeholder="/images/works/project.jpg" />
            <label className="border border-rule px-4 py-2 hover:border-signal transition-colors cursor-pointer whitespace-nowrap">
              <span className="lab text-white/70" style={{ fontSize: "0.55rem" }}>{uploadingCover ? "..." : "Upload"}</span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </div>
          {form.cover && (
            <div className="mt-2 w-32 h-20 bg-rule overflow-hidden rounded">
              <img src={form.cover} alt="" className="object-cover w-full h-full" />
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Summary *</label>
          <div className="flex items-center gap-2">
            <input required value={form.summary} onChange={set("summary")} className={inputCls} style={fs} placeholder="One sentence summary" />
            <button type="button" onClick={handleGenerateSummary} disabled={generatingSummary || !form.title.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingSummary ? "..." : "✨ AI"}</span>
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Description</label>
          <div className="flex items-start gap-2">
            <textarea rows={4} value={form.description} onChange={set("description")} className={textareaCls} style={{ ...fs, resize: "vertical" }} placeholder="Creative story, inspiration, process" />
            <button type="button" onClick={handleGenerateDescription} disabled={generatingDesc || !form.title.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 self-start mt-1">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingDesc ? "..." : "✨ Desc"}</span>
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Tags (comma separated)</label>
          <div className="flex items-center gap-2">
            <input value={form.tags} onChange={set("tags")} className={inputCls} style={fs} placeholder="3D, Animation, Personal Project" />
            <button type="button" onClick={handleGenerateTags} disabled={generatingTags || !form.description.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTags ? "..." : "✨ AI"}</span>
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Gallery ({gallery.length} images)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOverGallery(true); }}
            onDragLeave={() => setDragOverGallery(false)}
            onDrop={handleGalleryDrop}
            className={`border-2 border-dashed p-4 text-center transition-colors ${dragOverGallery ? "border-signal bg-signal/5" : "border-rule hover:border-white/30"}`}
            style={{ borderRadius: "4px" }}
          >
            <input
              type="file"
              id="gallery-upload-personal-inline"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <label htmlFor="gallery-upload-personal-inline" className="cursor-pointer">
              <span className="lab text-white/50" style={{ fontSize: "0.6rem" }}>
                {uploadingGallery ? "Uploading..." : "Drop images here or click to upload"}
              </span>
            </label>
          </div>
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {gallery.map((img, i) => (
                <div key={i} className="relative group">
                  <div className="relative w-full h-16 bg-rule overflow-hidden rounded">
                    <img src={img} alt="" className="object-cover w-full h-full" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromGallery(img)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ fontSize: "0.6rem" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-5 border-t border-rule pt-4">
        <button type="submit" disabled={isPending} className="lab px-4 py-2 bg-signal text-white hover:bg-signal/80 transition-colors disabled:opacity-40" style={{ fontSize: "0.55rem" }}>
          {isPending ? "Saving..." : "Save Personal Work"}
        </button>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>Cancel</button>
        {msg && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>{msg}</span>}
      </div>
    </form>
  );
}

// ── Inline Journal Form with AI ────────────────────────────────────────────────
function InlineJournalForm({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", date: new Date().toISOString().split("T")[0],
    excerpt: "", content: "", tags: "", status: "published" as "published" | "draft",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => {
      const updated = { ...prev, [k]: e.target.value };
      if (k === "title" && !prev.slug) updated.slug = generateSlug(e.target.value);
      return updated;
    });
  };

  async function handleGenerateTitle() {
    if (!form.content.trim() && !form.excerpt.trim()) { setMsg("Add content or excerpt first"); return; }
    setGeneratingTitle(true);
    try {
      const res = await fetch("/api/admin/ai/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.content || form.excerpt }),
      });
      const data = await res.json();
      if (data.title) {
        setForm((p) => ({ ...p, title: data.title, slug: generateSlug(data.title) }));
        setMsg("Title generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingTitle(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateExcerpt() {
    if (!form.title.trim()) { setMsg("Add title first"); return; }
    setGeneratingExcerpt(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, type: "journal" }),
      });
      const data = await res.json();
      if (data.result) {
        setForm((p) => ({ ...p, excerpt: data.result }));
        setMsg("Excerpt generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingExcerpt(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateContent() {
    if (!form.title.trim()) { setMsg("Add title first"); return; }
    setGeneratingContent(true);
    try {
      const res = await fetch("/api/admin/ai/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: form.title }),
      });
      const data = await res.json();
      if (data.content) {
        setForm((p) => ({ ...p, content: data.content, excerpt: data.excerpt || p.excerpt, tags: data.tags || p.tags }));
        setMsg("Content generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingContent(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleGenerateTags() {
    if (!form.content.trim()) { setMsg("Add content first"); return; }
    setGeneratingTags(true);
    try {
      const res = await fetch("/api/admin/ai/utils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hashtags", text: `${form.title} ${form.content}` }),
      });
      const data = await res.json();
      if (data.result) {
        setForm((p) => ({ ...p, tags: data.result }));
        setMsg("Tags generated!");
      } else { setMsg("Generation failed"); }
    } catch { setMsg("Generation failed"); }
    finally { setGeneratingTags(false); setTimeout(() => setMsg(""), 2000); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Saving...");
    startTransition(async () => {
      const res = await fetch("/api/admin/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Post saved!");
        setTimeout(onSuccess, 1000);
      } else {
        setMsg(data.error || "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-rule p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — New Journal Post</span>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white" style={{ fontSize: "0.5rem" }}>✕ Cancel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Title *</label>
          <div className="flex items-center gap-2">
            <input required value={form.title} onChange={set("title")} className={inputCls} style={fs} placeholder="Post title" />
            <button type="button" onClick={handleGenerateTitle} disabled={generatingTitle} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTitle ? "..." : "✨ Title"}</span>
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls} style={fs}>Slug</label>
          <input value={form.slug} onChange={set("slug")} className={inputCls} style={fs} placeholder="auto-generated" />
        </div>
        <div>
          <label className={labelCls} style={fs}>Date *</label>
          <input required type="date" value={form.date} onChange={set("date")} className={inputCls} style={fs} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Status</label>
          <select value={form.status} onChange={set("status")} className={selectCls} style={fs}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Excerpt *</label>
          <div className="flex items-start gap-2">
            <textarea required rows={2} value={form.excerpt} onChange={set("excerpt")} className={textareaCls} style={{ ...fs, resize: "none" }} placeholder="Short description shown in listing" />
            <button type="button" onClick={handleGenerateExcerpt} disabled={generatingExcerpt || !form.title.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 self-start mt-1">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingExcerpt ? "..." : "✨ Excerpt"}</span>
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Content *</label>
          <div className="flex items-start gap-2">
            <textarea required rows={8} value={form.content} onChange={set("content")} className={textareaCls} style={{ ...fs, resize: "vertical" }} placeholder="Full post content (markdown supported)" />
            <button type="button" onClick={handleGenerateContent} disabled={generatingContent || !form.title.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 self-start mt-1">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingContent ? "..." : "✨ Content"}</span>
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Tags (comma separated)</label>
          <div className="flex items-center gap-2">
            <input value={form.tags} onChange={set("tags")} className={inputCls} style={fs} placeholder="Design, Process, 3D" />
            <button type="button" onClick={handleGenerateTags} disabled={generatingTags || !form.content.trim()} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap">
              <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTags ? "..." : "✨ Tags"}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-5 border-t border-rule pt-4">
        <button type="submit" disabled={isPending} className="lab px-4 py-2 bg-signal text-white hover:bg-signal/80 transition-colors disabled:opacity-40" style={{ fontSize: "0.55rem" }}>
          {isPending ? "Saving..." : "Save Post"}
        </button>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>Cancel</button>
        {msg && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>{msg}</span>}
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [createTab, setCreateTab] = useState<CreateTab>(null);
  const [works, setWorks] = useState<Project[]>([]);
  const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
  const [journalCount, setJournalCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [totalMediaSize, setTotalMediaSize] = useState(0);
  const [activity, setActivity] = useState<any[]>([]);
  const [cvEntries, setCvEntries] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/admin/works").then((r) => r.json()),
      fetch("/api/admin/journal").then((r) => r.json()),
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch("/api/admin/services").then((r) => r.json()),
      fetch("/api/admin/media").then((r) => r.json()),
      fetch("/api/admin/activity").then((r) => r.json()),
      fetch("/api/admin/cv").then((r) => r.json()),
    ]).then(([worksData, journalData, clientsData, servicesData, mediaData, activityData, cvData]) => {
      setWorks(worksData);
      setJournalPosts(journalData);
      setJournalCount(journalData.filter((p: any) => p.status !== "draft").length);
      setDraftCount(journalData.filter((p: any) => p.status === "draft").length);
      setClientCount(clientsData.length);
      setServiceCount(servicesData.length);
      setMediaCount(mediaData.images?.length || 0);
      const total = (mediaData.images || []).reduce((acc: number, img: any) => acc + img.size, 0);
      setTotalMediaSize(total);
      setActivity(activityData.entries?.slice(0, 12) || []);
      setCvEntries(cvData || []);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!loaded) {
    return <div className="p-8"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;
  }

  const featured = works.filter((p) => p.featured);
  const recent = works.slice(0, 8);
  const categories = [...new Set(works.map((p) => p.category))];
  const years = [...new Set(works.map((p) => p.year))].sort((a, b) => Number(b) - Number(a));
  const recentPosts = journalPosts.slice(0, 6);
  const personalWorks = works.filter((p) => p.type === "personal");
  const clientWorks = works.filter((p) => p.type === "client");

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActivityStats = () => {
    const today = new Date();
    const thisWeek = activity.filter((e: any) => {
      const d = new Date(e.timestamp);
      const diff = today.getTime() - d.getTime();
      return diff < 7 * 86400000;
    });
    const thisMonth = activity.filter((e: any) => {
      const d = new Date(e.timestamp);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
    return { total: activity.length, thisWeek: thisWeek.length, thisMonth: thisMonth.length };
  };

  const activityStats = getActivityStats();

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 border-b border-rule pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Dashboard</span>
            <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.88 }}>Overview</h1>
            <p className="lab text-white/30 mt-3" style={{ fontSize: "0.6rem" }}>Rizky Irawan · Visual Archive Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-rule pb-px overflow-x-auto">
        {[
          { key: "overview", label: "01 Overview" },
          { key: "create", label: "02 Create New" },
          { key: "works", label: "03 Works" },
          { key: "journal", label: "04 Journal" },
          { key: "media", label: "05 Media" },
          { key: "tools", label: "06 Tools" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className="lab px-4 py-2.5 transition-colors whitespace-nowrap"
            style={{
              fontSize: "0.58rem",
              color: activeTab === tab.key ? "#ff3500" : "rgba(240,240,238,0.35)",
              borderBottom: activeTab === tab.key ? "1px solid #ff3500" : "1px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            <Link href="/admin/works" className="group border border-rule p-4 hover:border-signal transition-colors">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Total Works</p>
              <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{works.length}</p>
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>{featured.length} featured</p>
            </Link>
            <Link href="/admin/works?type=client" className="group border border-rule p-4 hover:border-signal transition-colors">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Client Work</p>
              <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{clientWorks.length}</p>
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>projects</p>
            </Link>
            <Link href="/admin/personal-works" className="group border border-rule p-4 hover:border-signal transition-colors">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Personal</p>
              <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{personalWorks.length}</p>
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>projects</p>
            </Link>
            <Link href="/admin/journal" className="group border border-rule p-4 hover:border-signal transition-colors">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Journal</p>
              <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{journalCount}</p>
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>{draftCount} drafts</p>
            </Link>
            <Link href="/admin/upload" className="group border border-rule p-4 hover:border-signal transition-colors">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Media</p>
              <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{mediaCount}</p>
              <p className="lab text-white/20 mt-1" style={{ fontSize: ".48rem" }}>{formatBytes(totalMediaSize)}</p>
            </Link>
          </div>

          {/* Activity Summary + Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Recent Works */}
            <div className="lg:col-span-2 border border-rule">
              <div className="flex items-center justify-between border-b border-rule px-5 py-3">
                <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Recent Works</span>
                <Link href="/admin/works" className="lab text-signal hover:text-white transition-colors" style={{ fontSize: "0.52rem" }}>
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-rule">
                {recent.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="lab text-white/30" style={{ fontSize: "0.58rem" }}>No works yet. Add your first project.</p>
                    <button onClick={() => setActiveTab("create")} className="lab text-signal hover:text-white mt-2 inline-block" style={{ fontSize: "0.55rem" }}>+ Add Work</button>
                  </div>
                ) : (
                  recent.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/admin/works?edit=${p.slug}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                        <div>
                          <p className="lab text-white" style={{ fontSize: "0.6rem" }}>{p.title}</p>
                          <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{p.category} · {p.client} · {p.year}</p>
                        </div>
                      </div>
                      {p.featured && (
                        <span className="lab text-signal shrink-0" style={{ fontSize: "0.48rem", background: "rgba(255,53,0,0.1)", padding: "2px 6px" }}>
                          Featured
                        </span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Quick Links */}
              <div className="border border-rule">
                <div className="border-b border-rule px-5 py-3">
                  <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Quick Links</span>
                </div>
                <div className="divide-y divide-rule">
                  {quickLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="lab text-white/50 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>{l.label}</span>
                      <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Status + Activity Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Summary */}
            <div className="border border-rule">
              <div className="flex items-center justify-between border-b border-rule px-5 py-3">
                <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Recent Activity</span>
                <Link href="/admin/activity" className="lab text-signal hover:text-white transition-colors" style={{ fontSize: "0.52rem" }}>
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-rule">
                {activity.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="lab text-white/30" style={{ fontSize: "0.58rem" }}>No activity recorded</p>
                  </div>
                ) : (
                  activity.slice(0, 6).map((entry: any) => (
                    <div key={entry.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>{entry.action}</span>
                        <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>{formatTime(entry.timestamp)}</span>
                      </div>
                      <p className="lab text-white/30 mt-0.5" style={{ fontSize: "0.52rem" }}>{entry.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Works by Category */}
            <div className="border border-rule">
              <div className="flex items-center justify-between border-b border-rule px-5 py-3">
                <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Content Breakdown</span>
              </div>
              <div className="divide-y divide-rule">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                    <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>Works</span>
                  </div>
                  <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{works.length} total · {categories.length} categories</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                    <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>Journal Posts</span>
                  </div>
                  <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{journalPosts.length} total · {draftCount} drafts</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                    <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>Services</span>
                  </div>
                  <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{serviceCount} offerings</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                    <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>Clients</span>
                  </div>
                  <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{clientCount} collaborations</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                    <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>Media Files</span>
                  </div>
                  <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{mediaCount} files · {formatBytes(totalMediaSize)}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                    <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>CV Entries</span>
                  </div>
                  <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{cvEntries.length} entries</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "create" && (
        <div className="space-y-6">
          {/* Create Type Selector - Interactive Cards */}
          {createTab === null && (
            <div className="space-y-4">
              <p className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Select what you want to create:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Work Card */}
                <button
                  onClick={() => setCreateTab("work")}
                  className="group border border-rule p-6 text-left hover:border-signal transition-all hover:bg-signal/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "1.2rem" }}>Work</span>
                    <span className="text-2xl">▣</span>
                  </div>
                  <p className="lab text-white/40 mb-4" style={{ fontSize: "0.58rem" }}>Client projects, commissioned work, commercial projects</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>3D</span>
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>Animation</span>
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>Motion</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-rule">
                    <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>+ Create Work →</span>
                  </div>
                </button>

                {/* Personal Work Card */}
                <button
                  onClick={() => setCreateTab("personal")}
                  className="group border border-rule p-6 text-left hover:border-signal transition-all hover:bg-signal/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "1.2rem" }}>Personal</span>
                    <span className="text-2xl">◇</span>
                  </div>
                  <p className="lab text-white/40 mb-4" style={{ fontSize: "0.58rem" }}>Self-initiated projects, creative exploration, practice work</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>Personal</span>
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>Series</span>
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>Experiments</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-rule">
                    <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>+ Create Personal →</span>
                  </div>
                </button>

                {/* Journal Card */}
                <button
                  onClick={() => setCreateTab("journal")}
                  className="group border border-rule p-6 text-left hover:border-signal transition-all hover:bg-signal/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "1.2rem" }}>Journal</span>
                    <span className="text-2xl">◈</span>
                  </div>
                  <p className="lab text-white/40 mb-4" style={{ fontSize: "0.58rem" }}>Blog posts, tutorials, process insights, creative writing</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>Blog</span>
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>Tutorial</span>
                    <span className="lab text-white/20 border border-rule px-2 py-1" style={{ fontSize: "0.45rem" }}>Process</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-rule">
                    <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>+ Write Post →</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Back button when a form is selected */}
          {createTab !== null && (
            <button
              onClick={() => setCreateTab(null)}
              className="flex items-center gap-2 lab text-white/40 hover:text-white transition-colors mb-4"
              style={{ fontSize: "0.6rem" }}
            >
              ← Back to selection
            </button>
          )}

          {createTab === "work" && (
            <InlineWorkForm
              onCancel={() => setCreateTab(null)}
              onSuccess={() => { loadData(); setCreateTab(null); }}
            />
          )}
          {createTab === "personal" && (
            <InlinePersonalWorkForm
              onCancel={() => setCreateTab(null)}
              onSuccess={() => { loadData(); setCreateTab(null); }}
            />
          )}
          {createTab === "journal" && (
            <InlineJournalForm
              onCancel={() => setCreateTab(null)}
              onSuccess={() => { loadData(); setCreateTab(null); }}
            />
          )}
        </div>
      )}

      {activeTab === "works" && (
        <div className="space-y-6">
          {/* Works Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Total Works</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{works.length}</p>
            </div>
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Featured</p>
              <p className="dis text-signal" style={{ fontSize: "2rem", lineHeight: 1 }}>{featured.length}</p>
            </div>
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Client Work</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{clientWorks.length}</p>
            </div>
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Personal</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{personalWorks.length}</p>
            </div>
          </div>

          {/* Works by Category */}
          <div className="border border-rule">
            <div className="border-b border-rule px-5 py-3">
              <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>By Category</span>
            </div>
            <div className="divide-y divide-rule">
              {categories.length === 0 ? (
                <EmptyState message="No works yet" action={{ label: "+ Add Work", onClick: () => setActiveTab("create") }} />
              ) : (
                categories.map((cat) => {
                  const catWorks = works.filter((p) => p.category === cat);
                  return (
                    <div key={cat} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                        <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>{cat}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{catWorks.length} works</span>
                        <Link href={`/admin/works?category=${cat}`} className="lab text-signal hover:text-white" style={{ fontSize: "0.5rem" }}>Manage →</Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Works by Year */}
          <div className="border border-rule">
            <div className="border-b border-rule px-5 py-3">
              <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>By Year</span>
            </div>
            <div className="divide-y divide-rule">
              {years.length === 0 ? (
                <EmptyState message="No works yet" />
              ) : (
                years.map((year) => {
                  const yearWorks = works.filter((p) => p.year === year);
                  return (
                    <div key={year} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                        <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>{year}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{yearWorks.length} works</span>
                        <Link href={`/admin/works?year=${year}`} className="lab text-signal hover:text-white" style={{ fontSize: "0.5rem" }}>Manage →</Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => { setCreateTab("work"); setActiveTab("create"); }} className="lab px-4 py-2 bg-signal text-white hover:bg-signal/80 transition-colors" style={{ fontSize: "0.55rem" }}>
              + New Work
            </button>
            <button onClick={() => { setCreateTab("personal"); setActiveTab("create"); }} className="lab px-4 py-2 border border-rule text-white/70 hover:border-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>
              + New Personal Work
            </button>
            <Link href="/admin/works" className="lab px-4 py-2 border border-rule text-white/70 hover:border-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>
              Full Works Editor →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "journal" && (
        <div className="space-y-6">
          {/* Journal Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Total Posts</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{journalPosts.length}</p>
            </div>
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Published</p>
              <p className="dis text-signal" style={{ fontSize: "2rem", lineHeight: 1 }}>{journalCount}</p>
            </div>
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Drafts</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{draftCount}</p>
            </div>
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Categories</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{[...new Set(journalPosts.flatMap((p: any) => p.tags || []))].length}</p>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="border border-rule">
            <div className="flex items-center justify-between border-b border-rule px-5 py-3">
              <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Recent Posts</span>
              <Link href="/admin/journal" className="lab text-signal hover:text-white transition-colors" style={{ fontSize: "0.52rem" }}>
                Manage →
              </Link>
            </div>
            <div className="divide-y divide-rule">
              {recentPosts.length === 0 ? (
                <EmptyState message="No posts yet" action={{ label: "+ New Post", onClick: () => setActiveTab("create") }} />
              ) : (
                recentPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/admin/journal?edit=${post.slug}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                      <div>
                        <p className="lab text-white" style={{ fontSize: "0.6rem" }}>{post.title}</p>
                        <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{post.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {post.status === "draft" && (
                        <span className="lab text-white/40" style={{ fontSize: "0.48rem", background: "rgba(255,255,255,0.1)", padding: "2px 6px" }}>
                          Draft
                        </span>
                      )}
                      <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>→</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => { setCreateTab("journal"); setActiveTab("create"); }} className="lab px-4 py-2 bg-signal text-white hover:bg-signal/80 transition-colors" style={{ fontSize: "0.55rem" }}>
              + New Post
            </button>
            <Link href="/admin/journal?ai=true" className="lab px-4 py-2 border border-signal text-signal hover:bg-signal hover:text-black transition-colors" style={{ fontSize: "0.55rem" }}>
              AI Generate Post
            </Link>
            <Link href="/admin/journal" className="lab px-4 py-2 border border-rule text-white/70 hover:border-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>
              Full Journal Editor →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Media Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Total Files</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{mediaCount}</p>
            </div>
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Total Size</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{formatBytes(totalMediaSize)}</p>
            </div>
            <div className="border border-rule p-4">
              <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Avg Size</p>
              <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{mediaCount > 0 ? formatBytes(totalMediaSize / mediaCount) : "0 B"}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-rule">
            <div className="border-b border-rule px-5 py-3">
              <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Media Management</span>
            </div>
            <div className="p-5 flex flex-wrap gap-3">
              <Link href="/admin/upload" className="lab px-4 py-2 bg-signal text-white hover:bg-signal/80 transition-colors" style={{ fontSize: "0.55rem" }}>
                Upload Files
              </Link>
              <Link href="/admin/upload" className="lab px-4 py-2 border border-rule text-white/70 hover:border-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>
                Browse Library →
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tools" && (
        <div className="space-y-6">
          {/* Admin Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group border border-rule p-5 hover:border-signal transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="dis text-white/30 group-hover:text-signal transition-colors" style={{ fontSize: "1.5rem" }}>{tool.icon}</span>
                  <span className="lab text-white/20 group-hover:text-white transition-colors" style={{ fontSize: "0.52rem" }}>→</span>
                </div>
                <p className="lab text-white group-hover:text-signal transition-colors" style={{ fontSize: "0.65rem" }}>{tool.label}</p>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.52rem" }}>{tool.desc}</p>
              </Link>
            ))}
          </div>

          {/* Activity Stats */}
          <div className="border border-rule">
            <div className="border-b border-rule px-5 py-3">
              <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Activity Statistics</span>
            </div>
            <div className="grid grid-cols-3 gap-px bg-rule">
              <div className="bg-black p-5 text-center">
                <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{activityStats.total}</p>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.5rem" }}>Total Events</p>
              </div>
              <div className="bg-black p-5 text-center">
                <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{activityStats.thisMonth}</p>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.5rem" }}>This Month</p>
              </div>
              <div className="bg-black p-5 text-center">
                <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{activityStats.thisWeek}</p>
                <p className="lab text-white/30 mt-1" style={{ fontSize: "0.5rem" }}>This Week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="mt-6 border border-rule p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>System Status: All services operational</span>
          </div>
          <div className="flex gap-6 flex-wrap">
            <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>JSONBin: Connected</span>
            <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Formspree: Active</span>
            <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Next.js 16.2.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}
