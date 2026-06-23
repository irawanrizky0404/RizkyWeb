"use client";

import { useState, useEffect, useCallback } from "react";

type ActivityEntry = {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  user?: string;
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  "work.add": { label: "Work Added", color: "#39ff14" },
  "work.update": { label: "Work Updated", color: "#ff3500" },
  "work.delete": { label: "Work Deleted", color: "#ff3500" },
  "journal.add": { label: "Post Added", color: "#39ff14" },
  "journal.update": { label: "Post Updated", color: "#ff3500" },
  "journal.delete": { label: "Post Deleted", color: "#ff3500" },
  "cv.add": { label: "CV Added", color: "#39ff14" },
  "cv.update": { label: "CV Updated", color: "#ff3500" },
  "cv.delete": { label: "CV Deleted", color: "#ff3500" },
  "design.update": { label: "Design Updated", color: "#ff3500" },
  "upload": { label: "Image Uploaded", color: "#39ff14" },
  "media.delete": { label: "Media Deleted", color: "#ff3500" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export default function AdminActivity() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/activity")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === "All" ? entries : entries.filter((e) => e.action.startsWith(filter));

  const fontSize = { fontSize: "0.6rem" };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 border-b border-rule pb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Activity</span>
          <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Activity Log</h1>
          <p className="lab text-white/30 mt-2" style={fontSize}>
            {entries.length} event{entries.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <button
          onClick={load}
          className="group inline-flex items-center gap-3 border border-rule px-4 py-2 hover:border-signal transition-colors"
        >
          <span className="lab text-white/50 group-hover:text-white transition-colors" style={fontSize}>↺ Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["All", "work", "journal", "cv", "design", "upload", "media"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="lab px-3 py-1.5 transition-colors"
            style={{
              fontSize: "0.52rem",
              color: filter === f ? "#080808" : "rgba(240,240,238,0.35)",
              background: filter === f ? "#ff3500" : "transparent",
              border: `1px solid ${filter === f ? "#ff3500" : "rgba(240,240,238,0.1)"}`,
            }}
          >
            {f === "All" ? "All Events" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="lab text-white/30 py-16" style={fontSize}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-rule p-16 text-center">
          <p className="lab text-white/30" style={fontSize}>
            {filter === "All" ? "No activity recorded yet." : `No ${filter} events found.`}
          </p>
        </div>
      ) : (
        <div className="border border-rule">
          {filtered.map((entry, i) => {
            const info = ACTION_LABELS[entry.action] || { label: entry.action, color: "rgba(240,240,238,0.4)" };
            return (
              <div
                key={entry.id}
                className="flex items-start gap-5 px-5 py-4 border-b border-rule last:border-b-0 hover:bg-white/[0.02] transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(240,240,238,0.06)" : undefined }}
              >
                <div className="shrink-0 mt-0.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: info.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="lab text-white" style={{ fontSize: "0.62rem" }}>{info.label}</span>
                    <span className="lab text-white/50" style={{ fontSize: "0.52rem" }}>{formatDate(entry.timestamp)}</span>
                    <span className="lab text-white/25" style={{ fontSize: "0.5rem" }}>{formatTime(entry.timestamp)}</span>
                  </div>
                  <p className="lab text-white/40 mt-1" style={{ fontSize: "0.58rem" }}>{entry.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
