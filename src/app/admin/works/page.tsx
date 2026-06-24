"use client";

import { useState, useEffect, useTransition } from "react";
import { addWork, updateWork, deleteWork, toggleFeatured, reorderWorks } from "@/app/admin/actions";
import type { Project } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CATEGORIES = ["3D", "Illustration", "Graphic Design", "Animation"] as const;
const PAGE_SIZE = 15;
const EMPTY: Project = {
  slug: "", title: "", year: new Date().getFullYear().toString(),
  category: "3D", client: "", summary: "", description: "",
  tags: [], cover: "", gallery: [], featured: false, type: "client",
};

type SortKey = "newest" | "oldest" | "az" | "za" | "category";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "category", label: "Category" },
];

interface SortableItemProps {
  p: Project;
  isPending: boolean;
  selected: Set<string>;
  onToggleSelect: (slug: string) => void;
  onStartEdit: (work: Project) => void;
  onDelete: (slug: string, title: string) => void;
  onToggleFeatured: (slug: string) => void;
}

function SortableItem({ p, isPending, selected, onToggleSelect, onStartEdit, onDelete, onToggleFeatured }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.slug });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 border-b border-rule px-5 py-3 transition-colors ${isDragging ? "bg-signal/10" : "hover:bg-white/[0.02]"}`}
    >
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          {...attributes}
          {...listeners}
          className="text-white/20 hover:text-signal transition-colors cursor-grab active:cursor-grabbing"
          style={{ fontSize: "1rem", touchAction: "none" }}
        >
          ⠿
        </button>
        <input type="checkbox" checked={selected.has(p.slug)} onChange={() => onToggleSelect(p.slug)} className="accent-signal" />
        <div className="relative w-12 h-10 md:w-16 md:h-12 bg-rule overflow-hidden shrink-0 rounded-sm">
          {p.cover ? <Image src={p.cover} alt="" fill className="object-cover" unoptimized /> : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="lab text-white/15" style={{ fontSize: "0.5rem" }}>—</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 md:hidden">
          <p className="lab text-white truncate" style={{ fontSize: "0.65rem" }}>{p.title}</p>
          <p className="lab text-white/40 truncate" style={{ fontSize: "0.5rem", marginTop: "2px" }}>{p.client}</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-4 flex-1">
        <div className="flex-1 min-w-0">
          <p className="lab text-white truncate" style={{ fontSize: "0.65rem" }}>{p.title}</p>
          <p className="lab text-white/40 truncate" style={{ fontSize: "0.55rem", marginTop: "2px" }}>{p.client}</p>
        </div>
        <span className="lab text-white/50 shrink-0" style={{ fontSize: "0.55rem", width: "100px" }}>{p.category}</span>
        <span className="lab text-white/50 shrink-0" style={{ fontSize: "0.55rem", width: "60px" }}>{p.year}</span>
        <button onClick={() => onToggleFeatured(p.slug)} disabled={isPending} style={{ fontSize: "1rem", width: "32px", color: p.featured ? "#ff3500" : "rgba(240,240,238,0.15)" }}>
          {p.featured ? "★" : "☆"}
        </button>
        <div className="flex items-center gap-3" style={{ width: "120px" }}>
          <button onClick={() => onStartEdit(p)} className="lab text-white/40 hover:text-signal transition-colors" style={{ fontSize: "0.55rem" }}>Edit</button>
          <Link href={`/works/${p.slug}`} target="_blank" className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>↗</Link>
          <button onClick={() => onDelete(p.slug, p.title)} disabled={isPending} className="lab text-white/30 hover:text-red-400 transition-colors" style={{ fontSize: "0.55rem" }}>Del</button>
        </div>
      </div>
      <div className="flex md:hidden items-center gap-3 w-full pl-4">
        <span className="lab text-white/40" style={{ fontSize: "0.5rem" }}>{p.category}</span>
        <span className="lab text-white/40" style={{ fontSize: "0.5rem" }}>{p.year}</span>
        <button onClick={() => onToggleFeatured(p.slug)} disabled={isPending} style={{ fontSize: "0.9rem", color: p.featured ? "#ff3500" : "rgba(240,240,238,0.15)" }}>
          {p.featured ? "★" : "☆"}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => onStartEdit(p)} className="lab text-white/40 hover:text-signal transition-colors" style={{ fontSize: "0.5rem" }}>Edit</button>
          <Link href={`/works/${p.slug}`} target="_blank" className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>↗</Link>
          <button onClick={() => onDelete(p.slug, p.title)} disabled={isPending} className="lab text-white/30 hover:text-red-400 transition-colors" style={{ fontSize: "0.5rem" }}>Del</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminWorks() {
  const [isPending, startTransition] = useTransition();
  const [works, setWorks] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Project | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"type-client" | "type-personal" | "set-category" | "set-year" | "delete" | "">("");
  const [bulkValue, setBulkValue] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [filter, search, sort]);

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

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "newest": return Number(b.year) - Number(a.year);
      case "oldest": return Number(a.year) - Number(b.year);
      case "az": return a.title.localeCompare(b.title);
      case "za": return b.title.localeCompare(a.title);
      case "category": return a.category.localeCompare(b.category);
      default: return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = paginated.findIndex((p) => p.slug === active.id);
    const newIndex = paginated.findIndex((p) => p.slug === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setWorks((prev) => {
      const newWorks = [...prev];
      const [removed] = newWorks.splice((page - 1) * PAGE_SIZE + oldIndex, 1);
      newWorks.splice((page - 1) * PAGE_SIZE + newIndex, 0, removed);
      return newWorks;
    });

    const newOrder = works.map((w) => w.slug);
    startTransition(async () => {
      await reorderWorks(newOrder);
      notify("Order saved.");
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
    if ((bulkAction === "set-category" || bulkAction === "set-year") && !bulkValue) {
      alert("Please select a value first");
      return;
    }
    startTransition(async () => {
      if (bulkAction === "delete") {
        if (!confirm(`Delete ${selected.size} works? This cannot be undone.`)) return;
        for (const slug of selected) {
          await deleteWork(slug);
        }
        setWorks((prev) => prev.filter((w) => !selected.has(w.slug)));
        notify(`Deleted ${selected.size} works`);
      } else if (bulkAction === "type-client" || bulkAction === "type-personal") {
        const newType = bulkAction === "type-client" ? "client" : "personal";
        for (const slug of selected) {
          const work = works.find((w) => w.slug === slug);
          if (work) await updateWork(slug, { ...work, type: newType });
        }
        setWorks((prev) => prev.map((w) => selected.has(w.slug) ? { ...w, type: newType } : w));
        notify(`Updated ${selected.size} works`);
      } else if (bulkAction === "set-category") {
        for (const slug of selected) {
          const work = works.find((w) => w.slug === slug);
          if (work) await updateWork(slug, { ...work, category: bulkValue as "3D" | "Illustration" | "Graphic Design" | "Animation" });
        }
        setWorks((prev) => prev.map((w) => selected.has(w.slug) ? { ...w, category: bulkValue as "3D" | "Illustration" | "Graphic Design" | "Animation" } : w));
        notify(`Set category to "${bulkValue}" for ${selected.size} works`);
      } else if (bulkAction === "set-year") {
        for (const slug of selected) {
          const work = works.find((w) => w.slug === slug);
          if (work) await updateWork(slug, { ...work, year: bulkValue });
        }
        setWorks((prev) => prev.map((w) => selected.has(w.slug) ? { ...w, year: bulkValue } : w));
        notify(`Set year to "${bulkValue}" for ${selected.size} works`);
      }
      setSelected(new Set());
      setBulkAction("");
      setBulkValue("");
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
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-black border border-rule px-2 py-1.5 lab text-white"
              style={{ fontSize: "0.5rem" }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button onClick={startAdd} className="border border-signal px-3 py-1.5 hover:bg-signal transition-colors">
              <span className="lab text-white hover:text-black" style={{ fontSize: "0.55rem" }}>+ Add Work</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="shrink-0 bg-signal/10 border-b border-rule px-5 py-3 flex flex-wrap items-center gap-3">
          <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{selected.size} selected</span>
          <select
            value={bulkAction}
            onChange={(e) => { setBulkAction(e.target.value as typeof bulkAction); setBulkValue(""); }}
            className="bg-black border border-rule px-3 py-1.5 lab text-white"
            style={{ fontSize: "0.55rem" }}
          >
            <option value="">Bulk actions…</option>
            <option value="type-client">Set as Client Work</option>
            <option value="type-personal">Set as Personal Work</option>
            <option value="set-category">Set Category</option>
            <option value="set-year">Set Year</option>
            <option value="delete">Delete Selected</option>
          </select>
          {bulkAction === "set-category" && (
            <select
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              className="bg-black border border-rule px-3 py-1.5 lab text-white"
              style={{ fontSize: "0.55rem" }}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {bulkAction === "set-year" && (
            <input
              type="text"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              placeholder="Year (e.g. 2024)"
              className="bg-black border border-rule px-3 py-1.5 lab text-white"
              style={{ fontSize: "0.55rem", width: "100px" }}
            />
          )}
          <button onClick={handleBulkUpdate} disabled={!bulkAction || (bulkAction !== "delete" && bulkValue === "")} className="border border-signal px-4 py-1.5 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white" style={{ fontSize: "0.55rem" }}>Apply</span>
          </button>
          <button onClick={() => { setSelected(new Set()); setBulkAction(""); setBulkValue(""); }} className="lab text-white/50 hover:text-white" style={{ fontSize: "0.55rem" }}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {/* Table header - hidden on mobile */}
        <div className="hidden md:flex items-center gap-4 border-b border-rule px-5 py-3 sticky top-0 bg-black z-10">
          <div className="w-8"><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="accent-signal" /></div>
          <span className="lab text-white/25" style={{ fontSize: "0.48rem", width: "64px", flexShrink: 0 }}>Image</span>
          <span className="lab text-white/25" style={{ fontSize: "0.48rem", flex: 1, minWidth: 0 }}>Title / Client</span>
          <span className="lab text-white/25" style={{ fontSize: "0.48rem", width: "100px", flexShrink: 0 }}>Category</span>
          <span className="lab text-white/25" style={{ fontSize: "0.48rem", width: "60px", flexShrink: 0 }}>Year</span>
          <span className="lab text-white/25" style={{ fontSize: "0.48rem", width: "32px", flexShrink: 0 }}>★</span>
          <span className="lab text-white/25" style={{ fontSize: "0.48rem", width: "120px", flexShrink: 0 }}>Actions</span>
        </div>

        {paginated.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="lab text-white/20" style={fs}>No works found.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginated.map((p) => p.slug)} strategy={verticalListSortingStrategy}>
              {paginated.map((p) => (
                <SortableItem
                  key={p.slug}
                  p={p}
                  isPending={isPending}
                  selected={selected}
                  onToggleSelect={toggleSelect}
                  onStartEdit={startEdit}
                  onDelete={handleDelete}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </SortableContext>
          </DndContext>
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
  const [gallery, setGallery] = useState<string[]>(initial.gallery || []);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const set = (k: keyof Project) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setIsDirty(true);
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("work-submit")?.click();
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
      } else {
        alert(data.error || "Upload failed");
      }
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

  const inputCls = "w-full bg-dim border-b border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors";
  const selectCls = "w-full bg-dim border border-rule px-3 py-2 lab text-white focus:outline-none focus:border-signal transition-colors";
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
            <input required value={form.title} onChange={(e) => { set("title")(e); if (isNew && !form.slug) setForm((p) => ({ ...p, slug: generateSlug(e.target.value) })); }} className={inputCls} style={fs} placeholder="Project title" />
          </div>
          <div>
            <label className={labelCls} style={fs}>Slug {isNew && <span className="text-white/20">(auto-generated)</span>}</label>
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
            <select required value={form.category} onChange={set("category")} className={selectCls} style={fs}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={fs}>Type *</label>
            <select required value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "client" | "personal" }))} className={selectCls} style={fs}>
              <option value="client">Client Work</option>
              <option value="personal">Personal Work</option>
            </select>
          </div>

          {/* Cover Image */}
          <div>
            <label className={labelCls} style={fs}>Cover image</label>
            <div className="flex items-center gap-2">
              <input value={form.cover} onChange={set("cover")} className={inputCls} style={fs} placeholder="/images/works/project.jpg" />
              <label className="border border-rule px-4 py-2 hover:border-signal transition-colors cursor-pointer whitespace-nowrap">
                <span className="lab text-white/70" style={{ fontSize: "0.55rem" }}>{uploadingCover ? "Uploading..." : "Upload Cover"}</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            </div>
            {form.cover && (
              <div className="mt-2">
                <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Preview</span>
                <div className="relative w-48 h-32 bg-rule overflow-hidden rounded mt-1">
                  <img src={form.cover} alt="" className="object-cover w-full h-full" />
                </div>
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
              <button type="button" onClick={handleGenerateTags} disabled={generatingTags} className="border border-rule px-3 py-2 hover:border-signal transition-colors disabled:opacity-40 whitespace-nowrap">
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
              className={`border-2 border-dashed p-6 text-center transition-colors ${dragOver ? "border-signal bg-signal/5" : "border-rule hover:border-white/30"}`}
              style={{ borderRadius: "4px" }}
            >
              <input
                type="file"
                id="gallery-upload"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              <label htmlFor="gallery-upload" className="cursor-pointer">
                <span className="lab text-white/50" style={{ fontSize: "0.65rem" }}>
                  {uploadingGallery ? "Uploading..." : "Drop images here or click to upload"}
                </span>
              </label>
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {gallery.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="relative w-full h-24 bg-rule overflow-hidden rounded">
                      <img src={img} alt="" className="object-cover w-full h-full" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromGallery(img)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ fontSize: "0.65rem" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} className="accent-signal" />
            <label htmlFor="featured" className="lab text-white/50 cursor-pointer" style={fs}>Featured on homepage</label>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 border-t border-rule pt-5">
          <button type="submit" id="work-submit" disabled={isPending} className="group inline-flex items-center gap-3 border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white group-hover:text-black transition-colors" style={fs}>{isPending ? "Saving..." : "Save Work"}</span>
          </button>
          <button type="button" onClick={handleCancel} className="lab text-white/30 hover:text-white transition-colors" style={fs}>Cancel</button>
          {!isNew && <Link href={`/works/${initial.slug}`} target="_blank" className="lab text-white/20 hover:text-white ml-auto" style={{ fontSize: "0.55rem" }}>View live ↗</Link>}
          <span className="lab text-white/20 ml-auto" style={{ fontSize: "0.5rem" }}>Ctrl+S to save</span>
        </div>
      </form>
    </div>
  );
}
