"use client";

import { useState, useEffect, useTransition } from "react";
import { addWork, updateWork, deleteWork, toggleFeatured } from "@/app/admin/actions";
import type { Project } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["3D", "Illustration", "Graphic Design", "Animation"] as const;
const EMPTY: Project = {
  slug: "", title: "", year: new Date().getFullYear().toString(),
  category: "3D", client: "", summary: "", description: "",
  tags: [], cover: "", gallery: [], featured: false, type: "personal", videoUrl: "", hoverVideoUrl: "",
};

type SortKey = "newest" | "oldest" | "az" | "za";
const PAGE_SIZE = 12;

export default function AdminPersonalWorks() {
  const [isPending, startTransition] = useTransition();
  const [works, setWorks] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"content" | "form">("content");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editing, setEditing] = useState<Project | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/works?t=" + Date.now()).then((r) => r.json()).then((data) => {
      const personalWorks = (data as Project[]).filter((w: Project) => w.type === "personal");
      setWorks(personalWorks);
      setLoaded(true);
    });
  }, []);

  useEffect(() => { setPage(1); setSelected(new Set()); }, [filter, search, sort]);
  useEffect(() => { setSelected(new Set()); }, [page]);

  function notify(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  const filtered = works.filter((p) => {
    const matchCat = filter === "All" || p.category === filter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "newest": return Number(b.year) - Number(a.year);
      case "oldest": return Number(a.year) - Number(b.year);
      case "az": return a.title.localeCompare(b.title);
      case "za": return b.title.localeCompare(a.title);
      default: return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleSave(work: Project) {
    work.type = "personal";
    startTransition(async () => {
      const result = editing ? await updateWork(editing.slug, work) : await addWork(work);
      if (result.ok) {
        notify(editing ? "Work updated!" : "Work added!");
        setView("content");
        setEditing(null);
        setFilter("All");
        const data = await fetch("/api/admin/works?t=" + Date.now()).then((r) => r.json());
        const personalWorks = (data as Project[]).filter((w: Project) => w.type === "personal");
        setWorks(personalWorks);
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

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(paginated.map((w) => w.slug)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} selected work(s)?`)) return;
    startTransition(async () => {
      for (const slug of selected) {
        await deleteWork(slug);
      }
      setWorks((prev) => prev.filter((w) => !selected.has(w.slug)));
      clearSelection();
      notify(`${selected.size} works deleted.`);
    });
  }

  async function handleBulkCategory() {
    if (!bulkCategory) return;
    startTransition(async () => {
      for (const slug of selected) {
        const work = works.find((w) => w.slug === slug);
        if (work) await updateWork(slug, { ...work, category: bulkCategory as Project["category"] });
      }
      setWorks((prev) => prev.map((w) => selected.has(w.slug) ? { ...w, category: bulkCategory as Project["category"] } : w));
      notify(`Category updated for ${selected.size} works.`);
      clearSelection();
      setBulkCategory("");
    });
  }

  async function handleBulkToggleFeatured() {
    startTransition(async () => {
      for (const slug of selected) {
        await toggleFeatured(slug);
      }
      setWorks((prev) => prev.map((w) => selected.has(w.slug) ? { ...w, featured: !w.featured } : w));
      notify(`Toggled featured for ${selected.size} works.`);
      clearSelection();
    });
  }

  function startAdd() {
    setEditing(null);
    setView("form");
  }

  function startEdit(work: Project) {
    setEditing(work);
    setView("form");
  }

  function goBack() {
    setView("content");
    setEditing(null);
  }

  if (!loaded) return <div className="p-6"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  // ── Form View ──────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <PersonalWorkEditor
        work={editing || EMPTY}
        isNew={!editing}
        onSave={handleSave}
        onCancel={goBack}
        isPending={isPending}
        msg={msg}
      />
    );
  }

  // ── Content View ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 bg-black border-b border-rule px-5 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — Personal Works</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 0.88 }}>Personal Works</p>
          </div>
          <div className="flex items-center gap-2">
            {msg && <span className="lab text-signal animate-pulse" style={{ fontSize: "0.52rem" }}>{msg}</span>}
            <button onClick={startAdd} className="border border-signal px-4 py-2 hover:bg-signal transition-colors">
              <span className="lab text-white hover:text-black" style={{ fontSize: "0.6rem" }}>+ Add Work</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3">
          <input
            type="text"
            placeholder="Search works..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border border-rule px-3 py-2 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors w-full md:w-auto"
            style={{ fontSize: "0.55rem", minWidth: "0", maxWidth: "200px" }}
          />
          <div className="flex gap-1 flex-wrap">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className="lab px-3 py-1.5 transition-colors"
                style={{
                  fontSize: "0.5rem",
                  color: filter === c ? "var(--black)" : "color-mix(in srgb, var(--white) 40%, transparent)",
                  background: filter === c ? "var(--signal)" : "transparent",
                  border: `1px solid ${filter === c ? "var(--signal)" : "color-mix(in srgb, var(--white) 12%, transparent)"}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-black border border-rule px-3 py-2 lab text-white"
            style={{ fontSize: "0.5rem" }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
          <span className="lab text-white/30 ml-auto" style={{ fontSize: "0.5rem" }}>{sorted.length} works</span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="shrink-0 px-5 py-3 border-b border-rule flex items-center gap-2 bg-black">
        <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>View:</span>
        <button
          onClick={() => setViewMode("grid")}
          className="lab px-3 py-1 border transition-colors"
          style={{
            fontSize: "0.5rem",
            color: viewMode === "grid" ? "var(--black)" : "color-mix(in srgb, var(--white) 40%, transparent)",
            background: viewMode === "grid" ? "var(--signal)" : "transparent",
            borderColor: viewMode === "grid" ? "var(--signal)" : "color-mix(in srgb, var(--white) 12%, transparent)",
          }}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode("list")}
          className="lab px-3 py-1 border transition-colors"
          style={{
            fontSize: "0.5rem",
            color: viewMode === "list" ? "var(--black)" : "color-mix(in srgb, var(--white) 40%, transparent)",
            background: viewMode === "list" ? "var(--signal)" : "transparent",
            borderColor: viewMode === "list" ? "var(--signal)" : "color-mix(in srgb, var(--white) 12%, transparent)",
          }}
        >
          List
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={selected.size === paginated.length && paginated.length > 0 ? clearSelection : selectAll}
            className="lab px-3 py-1 border border-rule hover:border-signal transition-colors"
            style={{ fontSize: "0.5rem", color: "color-mix(in srgb, var(--white) 50%, transparent)" }}
          >
            {selected.size === paginated.length && paginated.length > 0 ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="dis text-white/20" style={{ fontSize: "3rem" }}>—</p>
            <p className="lab text-white/30 mt-3" style={{ fontSize: "0.6rem" }}>No personal works found</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((work) => (
              <PersonalWorkCard
                key={work.slug}
                work={work}
                onEdit={() => startEdit(work)}
                onDelete={() => handleDelete(work.slug, work.title)}
                onToggleFeatured={() => handleToggleFeatured(work.slug)}
                isPending={isPending}
                isSelected={selected.has(work.slug)}
                onToggleSelect={() => toggleSelect(work.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((work) => (
              <PersonalWorkListItem
                key={work.slug}
                work={work}
                onEdit={() => startEdit(work)}
                onDelete={() => handleDelete(work.slug, work.title)}
                onToggleFeatured={() => handleToggleFeatured(work.slug)}
                isPending={isPending}
                isSelected={selected.has(work.slug)}
                onToggleSelect={() => toggleSelect(work.slug)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-t border-rule bg-black" style={{ paddingBottom: selected.size > 0 ? "3.5rem" : undefined }}>
          <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>{sorted.length} works · page {page}/{totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="lab px-2 py-1 border border-rule hover:border-signal transition-colors disabled:opacity-30"
              style={{ fontSize: "0.5rem", color: "color-mix(in srgb, var(--white) 50%, transparent)" }}
            >
              ←
            </button>
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
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="lab px-2 py-1 border transition-colors"
                  style={{
                    fontSize: "0.5rem",
                    color: p === page ? "var(--black)" : "color-mix(in srgb, var(--white) 50%, transparent)",
                    background: p === page ? "var(--signal)" : "transparent",
                    border: `1px solid ${p === page ? "var(--signal)" : "color-mix(in srgb, var(--white) 12%, transparent)"}`,
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="lab px-2 py-1 border border-rule hover:border-signal transition-colors disabled:opacity-30"
              style={{ fontSize: "0.5rem", color: "color-mix(in srgb, var(--white) 50%, transparent)" }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-rule z-50 px-5 py-3 flex items-center gap-4">
          <span className="lab" style={{ fontSize: "0.55rem", color: "var(--signal)" }}>{selected.size} selected</span>
          <button
            onClick={handleBulkDelete}
            disabled={isPending}
            className="lab px-3 py-1.5 border border-rule hover:border-red-400 hover:text-red-400 transition-colors disabled:opacity-40"
            style={{ fontSize: "0.5rem", color: "color-mix(in srgb, var(--white) 50%, transparent)" }}
          >
            Delete selected
          </button>
          <div className="flex items-center gap-2">
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="bg-black border border-rule px-3 py-1.5 lab text-white focus:outline-none focus:border-signal"
              style={{ fontSize: "0.5rem" }}
            >
              <option value="">Change category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {bulkCategory && (
              <button
                onClick={handleBulkCategory}
                disabled={isPending}
                className="lab px-3 py-1.5 border border-rule hover:border-signal transition-colors disabled:opacity-40"
                style={{ fontSize: "0.5rem", color: "color-mix(in srgb, var(--white) 50%, transparent)" }}
              >
                Apply
              </button>
            )}
          </div>
          <button
            onClick={handleBulkToggleFeatured}
            disabled={isPending}
            className="lab px-3 py-1.5 border border-rule hover:border-signal transition-colors disabled:opacity-40"
            style={{ fontSize: "0.5rem", color: "color-mix(in srgb, var(--white) 50%, transparent)" }}
          >
            Toggle featured
          </button>
          <button
            onClick={clearSelection}
            className="lab ml-auto px-2 py-1.5 border border-rule hover:border-signal transition-colors"
            style={{ fontSize: "0.55rem", color: "color-mix(in srgb, var(--white) 40%, transparent)" }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// ── Personal Work List Item ────────────────────────────────────────────────────
function PersonalWorkListItem({ work, onEdit, onDelete, onToggleFeatured, isPending, isSelected, onToggleSelect }: {
  work: Project;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  isPending: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <div
      className="group flex items-center gap-4 border hover:border-signal/50 transition-colors cursor-pointer bg-black p-3"
      style={{ borderColor: isSelected ? "var(--signal)" : "color-mix(in srgb, var(--white) 12%, transparent)" }}
      onClick={onEdit}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 accent-[var(--signal)] w-4 h-4 cursor-pointer"
      />
      <div className="relative w-16 h-12 bg-rule overflow-hidden shrink-0">
        {work.cover ? (
          <Image src={work.cover} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="lab text-white/15" style={{ fontSize: "0.5rem" }}>—</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="lab text-white truncate" style={{ fontSize: "0.65rem" }}>{work.title}</p>
        <p className="lab text-white/40 truncate" style={{ fontSize: "0.5rem", marginTop: "2px" }}>{work.client}</p>
      </div>
      <span className="lab text-white/30 shrink-0" style={{ fontSize: "0.5rem" }}>{work.category}</span>
      <span className="lab text-white/30 shrink-0" style={{ fontSize: "0.5rem" }}>{work.year}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFeatured(); }}
        disabled={isPending}
        style={{ fontSize: "1rem", color: work.featured ? "var(--signal)" : "color-mix(in srgb, var(--white) 15%, transparent)" }}
      >
        {work.featured ? "★" : "☆"}
      </button>
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Link href={`/personal-works/${work.slug}`} target="_blank" className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>↗</Link>
        <button onClick={onDelete} disabled={isPending} className="lab text-white/30 hover:text-red-400 transition-colors" style={{ fontSize: "0.5rem" }}>Del</button>
      </div>
    </div>
  );
}

// ── Personal Work Card ─────────────────────────────────────────────────────────────────
function PersonalWorkCard({ work, onEdit, onDelete, onToggleFeatured, isPending, isSelected, onToggleSelect }: {
  work: Project;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  isPending: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <div
      className="group border hover:border-signal/50 transition-all cursor-pointer bg-black"
      style={{ borderColor: isSelected ? "var(--signal)" : "color-mix(in srgb, var(--white) 12%, transparent)" }}
      onClick={onEdit}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-rule overflow-hidden">
        {work.cover ? (
          <Image src={work.cover} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="lab text-white/15" style={{ fontSize: "2rem" }}>—</span>
          </div>
        )}
        {work.featured && (
          <div className="absolute top-2 right-2">
            <span className="lab text-signal bg-black/80 px-2 py-1" style={{ fontSize: "0.4rem" }}>★ FEATURED</span>
          </div>
        )}
        <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="accent-[var(--signal)] w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="lab text-white truncate" style={{ fontSize: "0.65rem" }}>{work.title}</p>
            <p className="lab text-white/40 truncate" style={{ fontSize: "0.5rem", marginTop: "2px" }}>{work.client}</p>
          </div>
          <span className="lab text-white/30 shrink-0" style={{ fontSize: "0.5rem" }}>{work.year}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-rule/50">
          <span className="lab text-white/30" style={{ fontSize: "0.45rem" }}>{work.category}</span>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onToggleFeatured}
              disabled={isPending}
              style={{ fontSize: "0.9rem", color: work.featured ? "var(--signal)" : "color-mix(in srgb, var(--white) 20%, transparent)" }}
            >
              {work.featured ? "★" : "☆"}
            </button>
            <Link
              href={`/personal-works/${work.slug}`}
              target="_blank"
              className="lab text-white/30 hover:text-white transition-colors"
              style={{ fontSize: "0.5rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              ↗
            </Link>
            <button
              onClick={onDelete}
              disabled={isPending}
              className="lab text-white/30 hover:text-red-400 transition-colors"
              style={{ fontSize: "0.5rem" }}
            >
              Del
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Personal Work Editor ───────────────────────────────────────────────────────────────
function PersonalWorkEditor({ work: initial, isNew, onSave, onCancel, isPending, msg }: {
  work: Project;
  isNew: boolean;
  onSave: (p: Project) => void;
  onCancel: () => void;
  isPending: boolean;
  msg: string;
}) {
  const [form, setForm] = useState<Project>(initial);
  const [tagsStr, setTagsStr] = useState(initial.tags.join(", "));
  const [gallery, setGallery] = useState<string[]>(initial.gallery || []);
  const [visualDesc, setVisualDesc] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const set = (k: keyof Project) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
      if (data.ok && data.results?.[0]?.path) setForm((p) => ({ ...p, cover: data.results[0].path }));
      else alert(data.error || "Upload failed");
    } catch { alert("Upload failed"); }
    finally { setUploadingCover(false); }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("category", "works");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok && data.results) {
        const newPaths = data.results.filter((r: any) => r.path && !r.error).map((r: any) => r.path);
        setGallery((prev) => [...prev, ...newPaths]);
      } else alert(data.error || "Upload failed");
    } catch { alert("Upload failed"); }
    finally { setUploadingGallery(false); }
  }

  async function handleGalleryDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("category", "works");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok && data.results) {
        const newPaths = data.results.filter((r: any) => r.path && !r.error).map((r: any) => r.path);
        setGallery((prev) => [...prev, ...newPaths]);
      }
    } catch { alert("Upload failed"); }
    finally { setUploadingGallery(false); }
  }

  function removeFromGallery(path: string) {
    setGallery((prev) => prev.filter((p) => p !== path));
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

  async function handleGenerateTitle() {
    if (!visualDesc.trim()) { alert("Enter a visual description first"); return; }
    setGeneratingTitle(true);
    try {
      const res = await fetch("/api/admin/ai/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: visualDesc.trim(), category: form.category }),
      });
      const data = await res.json();
      if (data.title) {
        setForm((p) => ({ ...p, title: data.title }));
        if (isNew && !form.slug) setForm((p) => ({ ...p, slug: generateSlug(data.title) }));
      } else alert(data.error || "Failed to generate");
    } catch { alert("Failed to generate title"); }
    finally { setGeneratingTitle(false); }
  }

  async function handleGenerateSummary() {
    if (!form.title.trim()) { alert("Enter a title first"); return; }
    setGeneratingDesc(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), type: "summary", category: form.category }),
      });
      const data = await res.json();
      if (data.result) setForm((p) => ({ ...p, summary: data.result }));
      else alert(data.error || "Failed to generate");
    } catch { alert("Failed to generate summary"); }
    finally { setGeneratingDesc(false); }
  }

  async function handleGenerateDescription() {
    if (!form.title.trim()) { alert("Enter a title first"); return; }
    setGeneratingDesc(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), type: "description", category: form.category }),
      });
      const data = await res.json();
      if (data.result) setForm((p) => ({ ...p, description: data.result }));
      else alert(data.error || "Failed to generate");
    } catch { alert("Failed to generate description"); }
    finally { setGeneratingDesc(false); }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsStr.trim() ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [form.category];
    const work: Project = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      tags,
      gallery,
    };
    onSave(work);
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-rule z-10">
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={onCancel} className="lab text-white/40 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>
            ← Back
          </button>
          <div className="h-4 w-px bg-rule" />
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — {isNew ? "New Work" : "Edit Work"}</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.8rem)", lineHeight: 0.88 }}>
              {isNew ? "Add New Personal Work" : `Editing — ${initial.title}`}
            </p>
          </div>
          {msg && <span className="lab text-signal animate-pulse ml-auto" style={{ fontSize: "0.52rem" }}>{msg}</span>}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="p-6 max-w-3xl">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Title *</label>
            <div className="flex gap-2">
              <input
                required
                value={form.title}
                onChange={(e) => { set("title")(e); if (isNew && !form.slug) setForm((p) => ({ ...p, slug: generateSlug(e.target.value) })); }}
                className="flex-1 bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
                placeholder="Project title"
              />
              <button type="button" onClick={handleGenerateTitle} disabled={generatingTitle || !visualDesc.trim()} className="border border-rule px-4 py-3 hover:border-signal transition-colors disabled:opacity-40" title="Generate title from visual description">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTitle ? "..." : "✨ Title"}</span>
              </button>
            </div>
          </div>

          {/* Visual Description (for Title AI) */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Visual Description <span className="text-white/20">(used by ✨ Title AI)</span></label>
            <textarea
              value={visualDesc}
              onChange={(e) => setVisualDesc(e.target.value)}
              rows={2}
              className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
              style={{ fontSize: "0.65rem" }}
              placeholder="Briefly describe the visual — colors, mood, style, subject..."
            />
          </div>

          {/* Slug & Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Slug {isNew && <span className="text-white/20">(auto)</span>}</label>
              <input
                value={form.slug}
                onChange={set("slug")}
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
                placeholder="project-slug"
              />
            </div>
            <div>
              <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Client *</label>
              <input
                required
                value={form.client}
                onChange={set("client")}
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
                placeholder="Personal"
              />
            </div>
          </div>

          {/* Year, Category, Featured */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Year *</label>
              <input
                required
                value={form.year}
                onChange={set("year")}
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
              />
            </div>
            <div>
              <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Category *</label>
              <select
                required
                value={form.category}
                onChange={set("category")}
                className="w-full bg-black border border-rule px-4 py-3 lab text-white focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Featured</label>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
                className="w-full border py-3 flex items-center justify-center gap-2 transition-colors"
                style={{ fontSize: "1.2rem", borderColor: form.featured ? "var(--signal)" : "color-mix(in srgb, var(--white) 12%, transparent)", color: form.featured ? "var(--signal)" : "color-mix(in srgb, var(--white) 30%, transparent)" }}
              >
                {form.featured ? "★" : "☆"}
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Cover Image</label>
            <div className="flex items-center gap-3">
              <input
                value={form.cover}
                onChange={set("cover")}
                className="flex-1 bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
                placeholder="/images/works/project.jpg"
              />
              <label className="border border-rule px-4 py-3 hover:border-signal transition-colors cursor-pointer">
                <span className="lab text-white/70" style={{ fontSize: "0.55rem" }}>{uploadingCover ? "..." : "Upload"}</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            </div>
            {form.cover && (
              <div className="mt-3 relative w-full max-w-xs aspect-video bg-rule overflow-hidden">
                <img src={form.cover} alt="" className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Summary * <span className="text-white/20">(80-150 chars)</span></label>
            <div className="flex gap-2">
              <input
                required
                value={form.summary}
                onChange={set("summary")}
                className="flex-1 bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
                placeholder="Brief summary"
              />
              <button type="button" onClick={handleGenerateSummary} disabled={generatingDesc || !form.title.trim()} className="border border-rule px-4 py-3 hover:border-signal transition-colors disabled:opacity-40">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingDesc ? "..." : "✨"}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Description</label>
            <div className="flex gap-2">
              <textarea
                rows={4}
                value={form.description}
                onChange={set("description")}
                className="flex-1 bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
                style={{ fontSize: "0.65rem" }}
                placeholder="Full project description"
              />
              <button type="button" onClick={handleGenerateDescription} disabled={generatingDesc || !form.title.trim()} className="border border-rule px-4 py-3 hover:border-signal transition-colors disabled:opacity-40 self-start">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingDesc ? "..." : "✨"}</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Tags <span className="text-white/20">(comma separated)</span></label>
            <div className="flex gap-2">
              <input
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="flex-1 bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
                placeholder="3D, Animation, Cinematic"
              />
              <button type="button" onClick={handleGenerateTags} disabled={generatingTags} className="border border-rule px-4 py-3 hover:border-signal transition-colors disabled:opacity-40">
                <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>{generatingTags ? "..." : "✨ AI"}</span>
              </button>
            </div>
          </div>

          {/* Gallery */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Gallery ({gallery.length} images)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleGalleryDrop}
              className={`border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-signal bg-signal/5" : "border-rule hover:border-white/30"}`}
            >
              <input
                type="file"
                id="gallery-upload-personal"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              <label htmlFor="gallery-upload-personal" className="cursor-pointer">
                <span className="lab text-white/50" style={{ fontSize: "0.6rem" }}>
                  {uploadingGallery ? "Uploading..." : "Drop images or click to upload"}
                </span>
              </label>
            </div>
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {gallery.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="relative w-full h-20 bg-rule overflow-hidden rounded">
                      <img src={img} alt="" className="object-cover w-full h-full" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromGallery(img)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Video Embed URL</label>
            <input
              value={form.videoUrl || ""}
              onChange={set("videoUrl")}
              className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.65rem" }}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>

          {/* Hover Video URL */}
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Hover Video URL <span className="text-white/20">(for grid/list preview)</span></label>
            <input
              value={form.hoverVideoUrl || ""}
              onChange={set("hoverVideoUrl")}
              className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.65rem" }}
              placeholder="/videos/preview.mp4"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-rule">
          <button type="submit" disabled={isPending} className="border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{isPending ? "Saving..." : "Save Work"}</span>
          </button>
          <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>Cancel</button>
          {!isNew && (
            <Link href={`/personal-works/${initial.slug}`} target="_blank" className="lab text-white/20 hover:text-white ml-auto" style={{ fontSize: "0.55rem" }}>
              View live ↗
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
