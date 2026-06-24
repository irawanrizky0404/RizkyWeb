"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  category?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
};

export function ImageUpload({
  value,
  onChange,
  category = "general",
  label,
  placeholder = "/images/...",
  className = "",
  inputClassName = "",
  style,
  inputStyle,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setMsg("Only images allowed");
      setTimeout(() => setMsg(""), 2000);
      return;
    }
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("category", category);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok && data.results?.[0]?.path) {
        onChange(data.results[0].path);
        setMsg("Uploaded!");
        setShowPreview(true);
      } else {
        setMsg(data.error || "Upload failed");
      }
    } catch {
      setMsg("Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(""), 2000);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  return (
    <div className={className} style={style}>
      {label && (
        <label className="lab text-white/50 block mb-1" style={{ fontSize: "0.58rem" }}>
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
          style={inputStyle}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border border-signal/40 text-signal hover:bg-signal/10 px-3 py-2 lab transition-colors disabled:opacity-40 shrink-0"
          style={{ fontSize: "0.55rem" }}
        >
          {uploading ? "..." : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="border border-rule text-white/30 hover:text-white px-2 py-2 lab transition-colors shrink-0"
            style={{ fontSize: "0.55rem" }}
            title="Toggle preview"
          >
            {showPreview ? "Hide" : "Preview"}
          </button>
        )}
      </div>
      {msg && (
        <p className="lab mt-1" style={{ fontSize: "0.5rem", color: msg.includes("failed") || msg.includes("Only") ? "#f87171" : "#ff3500" }}>
          {msg}
        </p>
      )}
      {showPreview && value && (
        <div className="mt-3 relative h-40 w-full border border-rule overflow-hidden">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
            onError={() => setShowPreview(false)}
          />
        </div>
      )}
    </div>
  );
}

type ImageUploadDropzoneProps = {
  value: string;
  onChange: (url: string) => void;
  category?: string;
  label?: string;
  className?: string;
};

export function ImageUploadDropzone({
  value,
  onChange,
  category = "general",
  label,
  className = "",
}: ImageUploadDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setMsg("Only images allowed");
      setTimeout(() => setMsg(""), 2000);
      return;
    }
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("category", category);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok && data.results?.[0]?.path) {
        onChange(data.results[0].path);
        setMsg("Uploaded!");
      } else {
        setMsg(data.error || "Upload failed");
      }
    } catch {
      setMsg("Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(""), 2000);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  return (
    <div className={className}>
      {label && (
        <label className="lab text-white/50 block mb-2" style={{ fontSize: "0.58rem" }}>
          {label}
        </label>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
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
        {uploading ? (
          <span className="lab text-white/50" style={{ fontSize: "0.6rem" }}>Uploading...</span>
        ) : value ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-20 h-16 border border-rule overflow-hidden mb-2">
              <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
            </div>
            <span className="lab text-white/50" style={{ fontSize: "0.5rem" }}>Click or drop to replace</span>
          </div>
        ) : (
          <>
            <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>
              {dragOver ? "Drop to upload" : "Click or drag image here"}
            </span>
            <span className="lab text-white/15" style={{ fontSize: "0.48rem" }}>
              JPEG PNG WebP GIF SVG
            </span>
          </>
        )}
      </div>
      {msg && (
        <p className="lab mt-1" style={{ fontSize: "0.5rem", color: msg.includes("failed") || msg.includes("Only") ? "#f87171" : "#ff3500" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
