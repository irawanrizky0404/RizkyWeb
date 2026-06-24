"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

const CATEGORIES = [
  { value: "works", label: "Works" },
  { value: "hero", label: "Hero" },
  { value: "services", label: "Services" },
  { value: "clients", label: "Clients" },
  { value: "journal", label: "Journal" },
  { value: "general", label: "General" },
];

const SORT_OPTIONS = [
  { value: "name", label: "Name A→Z" },
  { value: "name-desc", label: "Name Z→A" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "smallest", label: "Smallest First" },
  { value: "largest", label: "Largest First" },
];

type UploadResult = { ok: boolean; path?: string; filename?: string; error?: string };
type UploadingFile = { file: File; progress: number; result?: UploadResult };

type ViewMode = "grid" | "list";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type ImageItem = { name: string; path: string; size: number; lastModified?: number };

function ImageGridView({ images, selected, onToggleSelect, onCopy, onDelete, copiedPath }: {
  images: ImageItem[];
  selected: Set<string>;
  onToggleSelect: (path: string) => void;
  onCopy: (path: string) => void;
  onDelete: (path: string) => void;
  copiedPath: string | null;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
      {images.map((img) => (
        <div key={img.path} className="relative group">
          <button
            onClick={() => onToggleSelect(img.path)}
            className={`relative aspect-square w-full bg-rule border transition-colors overflow-hidden ${
              selected.has(img.path) ? "border-signal ring-1 ring-signal" : "border-rule hover:border-signal/50"
            }`}
          >
            <Image src={img.path} alt={img.name} fill className="object-cover" unoptimized />
            {selected.has(img.path) && (
              <div className="absolute inset-0 bg-signal/20 flex items-center justify-center">
                <span className="lab text-signal" style={{ fontSize: "0.8rem" }}>✓</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <span className="lab text-white text-center" style={{ fontSize: "0.4rem" }}>
                {copiedPath === img.path ? "✓" : "Select"}
              </span>
            </div>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(img.path); }}
            className="absolute top-1 right-1 w-5 h-5 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy path"
          >
            <span className="lab text-white" style={{ fontSize: "0.35rem" }}>📋</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(img.path); }}
            className="absolute top-1 left-1 w-5 h-5 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete"
          >
            <span className="lab text-red-400" style={{ fontSize: "0.4rem" }}>✕</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function ImageListView({ images, selected, onToggleSelect, onCopy, onDelete, copiedPath }: {
  images: ImageItem[];
  selected: Set<string>;
  onToggleSelect: (path: string) => void;
  onCopy: (path: string) => void;
  onDelete: (path: string) => void;
  copiedPath: string | null;
}) {
  return (
    <div className="border border-rule">
      {images.map((img, i) => (
        <div
          key={img.path}
          className={`flex items-center gap-4 px-4 py-3 transition-colors ${
            selected.has(img.path) ? "bg-signal/10" : "hover:bg-white/[0.02]"
          } ${i < images.length - 1 ? "border-b border-rule" : ""}`}
        >
          <button
            onClick={() => onToggleSelect(img.path)}
            className="relative w-12 h-10 bg-rule border shrink-0 overflow-hidden"
          >
            <Image src={img.path} alt={img.name} fill className="object-cover" unoptimized />
            {selected.has(img.path) && (
              <div className="absolute inset-0 bg-signal/20 flex items-center justify-center">
                <span className="lab text-signal" style={{ fontSize: "0.6rem" }}>✓</span>
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className="lab text-white truncate" style={{ fontSize: "0.6rem" }}>{img.name}</p>
            <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{img.path}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{formatSize(img.size)}</span>
            {img.lastModified && (
              <span className="lab text-white/30 hidden md:block" style={{ fontSize: "0.5rem" }}>{formatDate(new Date(img.lastModified).toISOString())}</span>
            )}
            <button
              onClick={() => onCopy(img.path)}
              className="lab text-white/30 hover:text-signal transition-colors"
              style={{ fontSize: "0.5rem" }}
            >
              {copiedPath === img.path ? "✓" : "Copy"}
            </button>
            <button
              onClick={() => onDelete(img.path)}
              className="lab text-white/20 hover:text-red-400 transition-colors"
              style={{ fontSize: "0.5rem" }}
            >
              Del
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ImagePreviewModal({ img, onClose, onCopy }: { img: ImageItem; onClose: () => void; onCopy: (path: string) => void }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" onClick={onClose}>
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="lab text-white" style={{ fontSize: "0.7rem" }}>{img.name}</p>
            <p className="lab text-white/40 mt-1" style={{ fontSize: "0.55rem" }}>{img.path}</p>
          </div>
          <button onClick={onClose} className="lab text-white/30 hover:text-white" style={{ fontSize: "0.55rem" }}>✕ Close</button>
        </div>
        <div className="relative w-full aspect-video bg-rule border border-rule overflow-hidden">
          <Image src={img.path} alt={img.name} fill className="object-contain" unoptimized />
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => { onCopy(img.path); onClose(); }}
            className="border border-signal px-4 py-2 lab text-signal hover:bg-signal/10 transition-colors"
            style={{ fontSize: "0.55rem" }}
          >
            Copy Path
          </button>
          <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{formatSize(img.size)}</span>
        </div>
      </div>
    </div>
  );
}

function LibraryPanel({ category, view, onViewChange, sortBy, onSortChange, onCopy, copiedPath, refreshKey, onBulkDelete, onDelete, onImageClick }: {
  category: string;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  onCopy: (path: string) => void;
  copiedPath: string | null;
  refreshKey: number;
  onBulkDelete: (paths: string[]) => void;
  onDelete: (path: string) => void;
  onImageClick: (img: ImageItem) => void;
}) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const fs = { fontSize: "0.58rem" };

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/upload?category=${category}`)
      .then((r) => r.json())
      .then((d) => { setImages(d.images || []); setLoading(false); setSelected(new Set()); })
      .catch(() => setLoading(false));
  }, [category]);

  useEffect(() => { load(); }, [load, refreshKey]);
  useEffect(() => { setSearch(""); setSelected(new Set()); }, [category]);

  const filtered = search
    ? images.filter((img) => img.name.toLowerCase().includes(search.toLowerCase()) || img.path.toLowerCase().includes(search.toLowerCase()))
    : images;

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "newest": return (b.lastModified || 0) - (a.lastModified || 0);
      case "oldest": return (a.lastModified || 0) - (b.lastModified || 0);
      case "smallest": return a.size - b.size;
      case "largest": return b.size - a.size;
      default: return 0;
    }
  });

  function toggleSelect(path: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map((img) => img.path)));
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <span className="lab text-white/25 animate-pulse" style={fs}>Loading…</span>
    </div>
  );

  if (images.length === 0) return (
    <div className="py-16 text-center border border-dashed border-rule">
      <p className="lab text-white/25" style={fs}>No images in /images/{category}/ yet.</p>
      <p className="lab text-white/15 mt-2" style={{ fontSize: "0.5rem" }}>Upload some images using the panel on the left.</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search images…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border border-rule px-3 py-1.5 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
            style={{ fontSize: "0.55rem", width: "160px" }}
          />
          <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>
            {sorted.length === images.length ? `${images.length}` : `${sorted.length}/${images.length}`}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center border border-rule">
            <button
              onClick={() => onViewChange("grid")}
              className="px-2 py-1.5 transition-colors"
              style={{ background: view === "grid" ? "rgba(255,53,0,0.1)" : "transparent" }}
            >
              <span className="lab" style={{ fontSize: "0.5rem", color: view === "grid" ? "#ff3500" : "rgba(240,240,238,0.35)" }}>Grid</span>
            </button>
            <button
              onClick={() => onViewChange("list")}
              className="px-2 py-1.5 transition-colors border-l border-rule"
              style={{ background: view === "list" ? "rgba(255,53,0,0.1)" : "transparent" }}
            >
              <span className="lab" style={{ fontSize: "0.5rem", color: view === "list" ? "#ff3500" : "rgba(240,240,238,0.35)" }}>List</span>
            </button>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-black border border-rule px-2 py-1.5 lab text-white/50 focus:outline-none focus:border-signal transition-colors"
            style={{ fontSize: "0.5rem" }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Actions */}
          <button onClick={selectAll} className="lab text-white/25 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>
            {selected.size === sorted.length ? "Deselect" : "Select All"}
          </button>
          {selected.size > 0 && (
            <>
              <button
                onClick={() => { onBulkDelete(Array.from(selected)); load(); }}
                className="lab text-red-400 hover:text-red-300 transition-colors"
                style={{ fontSize: "0.5rem" }}
              >
                Delete ({selected.size})
              </button>
              <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>|</span>
            </>
          )}
          <button onClick={load} className="lab text-white/25 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>
            ↺
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <ImageGridView
          images={sorted}
          selected={selected}
          onToggleSelect={toggleSelect}
          onCopy={onCopy}
          onDelete={onDelete}
          copiedPath={copiedPath}
        />
      ) : (
        <ImageListView
          images={sorted}
          selected={selected}
          onToggleSelect={toggleSelect}
          onCopy={onCopy}
          onDelete={onDelete}
          copiedPath={copiedPath}
        />
      )}
    </div>
  );
}

export default function AdminUpload() {
  const [category, setCategory] = useState("works");
  const [view, setView] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const entry: UploadingFile = { file, progress: 0 };
    setUploads((prev) => [...prev, entry]);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setUploads((prev) =>
          prev.map((u) => u.file === file ? { ...u, progress: Math.round((e.loaded / e.total) * 100) } : u)
        );
      }
    });

    const result = await new Promise<UploadResult>((resolve) => {
      xhr.onload = () => {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { resolve({ ok: false, error: "Invalid response" }); }
      };
      xhr.onerror = () => resolve({ ok: false, error: "Request failed" });
      xhr.open("POST", "/api/admin/upload");
      xhr.send(fd);
    });

    setUploads((prev) =>
      prev.map((u) => u.file === file ? { ...u, progress: 100, result } : u)
    );
    if (result.ok) setRefreshKey((k) => k + 1);
  }, [category]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(uploadFile);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  async function handleBulkDelete(paths: string[]) {
    if (!confirm(`Delete ${paths.length} image(s)? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths }),
      });
      const data = await res.json();
      const failed = data.results?.filter((r: { ok: boolean }) => !r.ok) || [];
      if (failed.length > 0) {
        alert(`Failed to delete ${failed.length} file(s)`);
      }
      setRefreshKey((k) => k + 1);
    } catch {
      alert("Bulk delete failed");
    }
  }

  async function handleDelete(path: string) {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: [path] }),
      });
      const data = await res.json();
      if (data.results?.[0]?.ok) {
        setRefreshKey((k) => k + 1);
      }
    } catch {
      alert("Delete failed");
    }
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path).then(() => {
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    });
  }

  const fs = { fontSize: "0.6rem" };

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-black border-b border-rule px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — Upload & Media</span>
            <p className="dis text-white mt-0.5" style={{ fontSize: "clamp(1.2rem, 3vw, 2.5rem)", lineHeight: 0.88 }}>Upload & Media</p>
          </div>
          <div className="flex items-center gap-3">
            {copiedPath && (
              <span className="lab text-signal animate-pulse" style={{ fontSize: "0.55rem" }}>✓ Path copied!</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-auto divide-y lg:divide-y-0 lg:divide-x divide-rule">

        {/* ── Left: Upload panel ── */}
        <div className="lg:w-80 shrink-0 p-6 flex flex-col gap-6">
          {/* Category */}
          <div>
            <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.52rem" }}>Folder / Category</label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setCategory(c.value); setUploads([]); }}
                  className="lab px-2.5 py-2 transition-colors text-left"
                  style={{
                    fontSize: "0.52rem",
                    color: category === c.value ? "#080808" : "rgba(240,240,238,0.4)",
                    background: category === c.value ? "#ff3500" : "transparent",
                    border: `1px solid ${category === c.value ? "#ff3500" : "rgba(240,240,238,0.12)"}`,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="lab text-white/20 mt-2" style={{ fontSize: "0.48rem" }}>
              → /images/{category}/
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center py-10 gap-2"
            style={{
              borderColor: dragOver ? "#ff3500" : "rgba(240,240,238,0.15)",
              background: dragOver ? "rgba(255,53,0,0.04)" : "transparent",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <span className="lab text-white/30" style={fs}>
              {dragOver ? "Drop to upload" : "Drag & drop or click"}
            </span>
            <span className="lab text-white/15" style={{ fontSize: "0.48rem" }}>
              JPEG PNG WebP GIF SVG
            </span>
            <span className="lab text-white/10" style={{ fontSize: "0.42rem" }}>
              Max 10MB per file
            </span>
          </div>

          {/* Upload queue */}
          {uploads.length > 0 && (
            <div className="border border-rule">
              <div className="border-b border-rule px-3 py-2 flex items-center justify-between">
                <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>
                  {uploads.filter((u) => u.result?.ok).length}/{uploads.length} uploaded
                </span>
                <button
                  onClick={() => setUploads([])}
                  className="lab text-white/20 hover:text-white transition-colors"
                  style={{ fontSize: "0.48rem" }}
                >
                  Clear
                </button>
              </div>
              <div className="max-h-64 overflow-auto">
                {uploads.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-rule last:border-b-0">
                    <div className="w-10 h-8 bg-rule shrink-0 overflow-hidden">
                      {u.result?.ok ? (
                        <Image src={u.result.path || ""} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="lab" style={{ fontSize: "0.4rem", color: u.result?.error ? "#f87171" : "rgba(240,240,238,0.3)" }}>
                            {u.progress < 100 ? `${u.progress}%` : u.result?.error ? "✕" : "…"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="lab text-white truncate" style={{ fontSize: "0.55rem" }}>{u.file.name}</p>
                      {u.result?.ok ? (
                        <button
                          onClick={() => copyPath(u.result!.path!)}
                          className="lab text-white/30 hover:text-signal transition-colors"
                          style={{ fontSize: "0.45rem" }}
                        >
                          {copiedPath === u.result.path ? "✓ Copied!" : "Copy path"}
                        </button>
                      ) : u.result?.error ? (
                        <p className="lab text-red-400" style={{ fontSize: "0.45rem" }}>{u.result.error}</p>
                      ) : (
                        <div className="mt-1 h-0.5 bg-rule w-full">
                          <div className="h-full bg-signal transition-all" style={{ width: `${u.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="border border-rule p-4">
            <p className="lab text-white/40 mb-2" style={{ fontSize: "0.52rem" }}>Tips</p>
            <ul className="space-y-1">
              <li className="lab text-white/20" style={{ fontSize: "0.48rem" }}>• Click image to preview</li>
              <li className="lab text-white/20" style={{ fontSize: "0.48rem" }}>• Hover for quick actions</li>
              <li className="lab text-white/20" style={{ fontSize: "0.48rem" }}>• Use Grid/List views</li>
              <li className="lab text-white/20" style={{ fontSize: "0.48rem" }}>• Select multiple to bulk delete</li>
            </ul>
          </div>
        </div>

        {/* ── Right: Library ── */}
        <div className="flex-1 p-6 overflow-auto">
          <LibraryPanel
            category={category}
            view={view}
            onViewChange={setView}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onCopy={copyPath}
            copiedPath={copiedPath}
            refreshKey={refreshKey}
            onBulkDelete={handleBulkDelete}
            onDelete={handleDelete}
            onImageClick={setPreviewImage}
          />
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          img={previewImage}
          onClose={() => setPreviewImage(null)}
          onCopy={copyPath}
        />
      )}
    </div>
  );
}
