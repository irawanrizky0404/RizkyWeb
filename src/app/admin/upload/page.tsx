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

type UploadResult = { ok: boolean; path?: string; filename?: string; error?: string };
type UploadingFile = { file: File; progress: number; result?: UploadResult };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function LibraryGrid({ category, onCopy, copiedPath, refreshKey, onBulkDelete }: {
  category: string;
  onCopy: (path: string) => void;
  copiedPath: string | null;
  refreshKey: number;
  onBulkDelete: (paths: string[]) => void;
}) {
  const [images, setImages] = useState<{ name: string; path: string; size: number }[]>([]);
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

  const filtered = search
    ? images.filter((img) => img.name.toLowerCase().includes(search.toLowerCase()))
    : images;

  function toggleSelect(path: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((img) => img.path)));
  }

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <span className="lab text-white/25" style={fs}>Loading…</span>
    </div>
  );

  if (images.length === 0) return (
    <div className="py-10 text-center border border-dashed border-rule">
      <p className="lab text-white/25" style={fs}>No images in /images/{category}/ yet.</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border border-rule px-2 py-1 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
            style={{ fontSize: "0.52rem", width: "120px" }}
          />
          <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>
            {filtered.length} of {images.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={selectAll} className="lab text-white/25 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>
            {selected.size === filtered.length ? "Deselect all" : "Select all"}
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => { onBulkDelete(Array.from(selected)); load(); }}
              className="lab text-red-400 hover:text-red-300 transition-colors"
              style={{ fontSize: "0.5rem" }}
            >
              Delete ({selected.size})
            </button>
          )}
          <button onClick={load} className="lab text-white/25 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>
            ↺ Refresh
          </button>
        </div>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
        {filtered.map((img) => (
          <div key={img.path} className="relative group">
            <button
              onClick={() => toggleSelect(img.path)}
              className={`relative aspect-square w-full bg-rule border transition-colors overflow-hidden ${
                selected.has(img.path) ? "border-signal ring-1 ring-signal" : "border-rule hover:border-signal/50"
              }`}
              title={`${img.name}\n${formatSize(img.size)}\n${img.path}`}
            >
              <Image src={img.path} alt={img.name} fill className="object-cover" unoptimized />
              {selected.has(img.path) && (
                <div className="absolute inset-0 bg-signal/20 flex items-center justify-center">
                  <span className="lab text-signal" style={{ fontSize: "0.7rem" }}>✓</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="lab text-white text-center" style={{ fontSize: "0.42rem" }}>
                  {copiedPath === img.path ? "✓ Copied" : "Select"}
                </span>
              </div>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCopy(img.path); }}
              className="absolute bottom-1 right-1 w-5 h-5 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="lab text-white" style={{ fontSize: "0.4rem" }}>📋</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUpload() {
  const [category, setCategory] = useState("works");
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
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
        <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — Upload & Media</span>
        <p className="dis text-white mt-0.5" style={{ fontSize: "clamp(1.2rem, 3vw, 2.5rem)", lineHeight: 0.88 }}>Upload & Media</p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-auto divide-y lg:divide-y-0 lg:divide-x divide-rule">

        {/* ── Left: Upload panel ── */}
        <div className="lg:w-72 shrink-0 p-6 flex flex-col gap-5">
          {/* Category */}
          <div>
            <label className="lab text-white/30 block mb-2" style={{ fontSize: "0.52rem" }}>Folder / Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setCategory(c.value); setUploads([]); }}
                  className="lab px-2.5 py-1 transition-colors"
                  style={{
                    fontSize: "0.52rem",
                    color: category === c.value ? "#080808" : "rgba(240,240,238,0.35)",
                    background: category === c.value ? "#ff3500" : "transparent",
                    border: `1px solid ${category === c.value ? "#ff3500" : "rgba(240,240,238,0.12)"}`,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="lab text-white/20 mt-1.5" style={{ fontSize: "0.48rem" }}>
              → /images/{category}/
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center py-8 gap-2"
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
              JPEG PNG WebP GIF SVG — max 10MB
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
          )}
        </div>

        {/* ── Right: Library ── */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>
              Media Library — /images/{category}/
            </span>
            {copiedPath && (
              <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>✓ Path copied</span>
            )}
          </div>
          <LibraryGrid
            category={category}
            onCopy={copyPath}
            copiedPath={copiedPath}
            refreshKey={refreshKey}
            onBulkDelete={handleBulkDelete}
          />
        </div>
      </div>
    </div>
  );
}
