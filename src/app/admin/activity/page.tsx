"use client";

import { useState, useEffect, useCallback } from "react";

type ActivityEntry = {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  user?: string;
};

type FilterPeriod = "all" | "today" | "week" | "month";

const ACTION_CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "work", label: "Works" },
  { id: "journal", label: "Journal" },
  { id: "cv", label: "CV" },
  { id: "design", label: "Design" },
  { id: "upload", label: "Upload" },
  { id: "media", label: "Media" },
];

const ACTION_COLORS: Record<string, string> = {
  "add": "#39ff14",
  "update": "#ff3500",
  "delete": "#ff3500",
  "upload": "#39ff14",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

function getActionInfo(action: string) {
  const parts = action.split(".");
  const type = parts[0] || "";
  const verb = parts[1] || "";
  const color = ACTION_COLORS[verb] || "rgba(240,240,238,0.4)";

  const labels: Record<string, string> = {
    "work.add": "Work Added",
    "work.update": "Work Updated",
    "work.delete": "Work Deleted",
    "journal.add": "Post Added",
    "journal.update": "Post Updated",
    "journal.delete": "Post Deleted",
    "cv.add": "CV Added",
    "cv.update": "CV Updated",
    "cv.delete": "CV Deleted",
    "design.update": "Design Updated",
    "upload": "Image Uploaded",
    "media.delete": "Media Deleted",
  };

  return {
    label: labels[action] || action,
    color,
    icon: verb === "add" ? "+" : verb === "delete" ? "✕" : "◉",
  };
}

function getDateRangeFilter(period: FilterPeriod): Date | null {
  const now = new Date();
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week":
      return new Date(now.getTime() - 7 * 86400000);
    case "month":
      return new Date(now.getTime() - 30 * 86400000);
    default:
      return null;
  }
}

function ActivityStats({ entries }: { entries: ActivityEntry[] }) {
  const counts = entries.reduce((acc, e) => {
    const category = e.action.split(".")[0] || "other";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = entries.length;
  const todayCount = entries.filter(e => {
    const d = new Date(e.timestamp);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="border border-rule p-4">
        <p className="lab text-white/30 mb-1" style={{ fontSize: "0.48rem" }}>Total Events</p>
        <p className="dis text-white" style={{ fontSize: "1.8rem", lineHeight: 1 }}>{total}</p>
      </div>
      <div className="border border-rule p-4">
        <p className="lab text-white/30 mb-1" style={{ fontSize: "0.48rem" }}>Today</p>
        <p className="dis text-signal" style={{ fontSize: "1.8rem", lineHeight: 1 }}>{todayCount}</p>
      </div>
      <div className="border border-rule p-4">
        <p className="lab text-white/30 mb-1" style={{ fontSize: "0.48rem" }}>Works</p>
        <p className="dis text-white" style={{ fontSize: "1.8rem", lineHeight: 1 }}>{counts["work"] || 0}</p>
      </div>
      <div className="border border-rule p-4">
        <p className="lab text-white/30 mb-1" style={{ fontSize: "0.48rem" }}>Journal</p>
        <p className="dis text-white" style={{ fontSize: "1.8rem", lineHeight: 1 }}>{counts["journal"] || 0}</p>
      </div>
    </div>
  );
}

function ActivityChart({ entries }: { entries: ActivityEntry[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  const countsByDay = last7Days.map(day => {
    return entries.filter(e => new Date(e.timestamp).toDateString() === day).length;
  });

  const maxCount = Math.max(...countsByDay, 1);

  return (
    <div className="border border-rule p-4 mb-6">
      <p className="lab text-white/30 mb-4" style={{ fontSize: "0.55rem" }}>Activity — Last 7 Days</p>
      <div className="flex items-end gap-2 h-24">
        {countsByDay.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-signal/60 transition-all"
              style={{
                height: `${(count / maxCount) * 80}px`,
                minHeight: count > 0 ? "4px" : "0",
              }}
            />
            <span className="lab text-white/20" style={{ fontSize: "0.4rem" }}>
              {count}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {last7Days.map((day, i) => (
          <span key={i} className="flex-1 text-center lab text-white/20" style={{ fontSize: "0.4rem" }}>
            {new Date(day).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecentActivityList({ entries, filter }: { entries: ActivityEntry[]; filter: string }) {
  const filtered = filter === "all"
    ? entries
    : entries.filter(e => e.action.startsWith(filter));

  const grouped = filtered.reduce((acc, e) => {
    const date = new Date(e.timestamp).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {} as Record<string, ActivityEntry[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (filtered.length === 0) {
    return (
      <div className="border border-rule p-16 text-center">
        <p className="lab text-white/30" style={{ fontSize: "0.6rem" }}>No activity found.</p>
      </div>
    );
  }

  return (
    <div className="border border-rule">
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="border-b border-rule px-5 py-2 bg-white/[0.02]">
            <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>
              {new Date(date).toDateString() === new Date().toDateString() ? "Today" : formatDate(date)}
            </span>
          </div>
          {grouped[date].map((entry) => {
            const info = getActionInfo(entry.action);
            return (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors border-b border-rule last:border-b-0"
              >
                <div className="shrink-0 mt-0.5">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                    style={{ background: `${info.color}20`, color: info.color, fontSize: "0.6rem" }}
                  >
                    {info.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="lab text-white" style={{ fontSize: "0.62rem" }}>{info.label}</span>
                    <span className="lab text-white/25" style={{ fontSize: "0.5rem" }}>{formatRelative(entry.timestamp)}</span>
                  </div>
                  <p className="lab text-white/40 mt-0.5" style={{ fontSize: "0.58rem" }}>{entry.detail}</p>
                </div>
                <span className="lab text-white/20 shrink-0" style={{ fontSize: "0.48rem" }}>
                  {formatTime(entry.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function AdminActivity() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState<FilterPeriod>("all");

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

  const periodStart = getDateRangeFilter(periodFilter);
  const filteredEntries = periodStart
    ? entries.filter(e => new Date(e.timestamp) >= periodStart)
    : entries;

  const handleExport = () => {
    const data = JSON.stringify(filteredEntries, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 border-b border-rule pb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Activity</span>
          <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Activity Log</h1>
          <p className="lab text-white/30 mt-2" style={{ fontSize: "0.55rem" }}>
            {filteredEntries.length} event{filteredEntries.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="border border-rule px-4 py-2 lab text-white/50 hover:text-white hover:border-white/30 transition-colors"
            style={{ fontSize: "0.55rem" }}
          >
            ↺ Refresh
          </button>
          <button
            onClick={handleExport}
            className="border border-signal/50 px-4 py-2 lab text-signal hover:bg-signal/10 transition-colors"
            style={{ fontSize: "0.55rem" }}
          >
            ↓ Export JSON
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && entries.length > 0 && (
        <>
          <ActivityStats entries={filteredEntries} />
          <ActivityChart entries={filteredEntries} />
        </>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {/* Category Filter */}
        <div className="flex items-center gap-1 border border-rule">
          {ACTION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className="lab px-3 py-2 transition-colors"
              style={{
                fontSize: "0.52rem",
                color: categoryFilter === cat.id ? "#080808" : "rgba(240,240,238,0.35)",
                background: categoryFilter === cat.id ? "#ff3500" : "transparent",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value as FilterPeriod)}
          className="bg-black border border-rule px-3 py-2 lab text-white/50 focus:outline-none focus:border-signal transition-colors"
          style={{ fontSize: "0.52rem" }}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="py-16 text-center">
          <span className="lab text-white/30 animate-pulse" style={{ fontSize: "0.6rem" }}>Loading…</span>
        </div>
      ) : (
        <RecentActivityList entries={filteredEntries} filter={categoryFilter} />
      )}
    </div>
  );
}
