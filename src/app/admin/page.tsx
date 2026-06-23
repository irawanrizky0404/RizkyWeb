"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

const quickLinks = [
  { label: "View homepage", href: "/", external: true },
  { label: "View works", href: "/works", external: true },
  { label: "View labs", href: "/labs", external: true },
  { label: "Formspree inbox", href: "https://formspree.io/forms/xrewgrkl/submissions", external: true },
];

const adminTools = [
  { label: "Media Library", href: "/admin/upload", desc: "Manage images & uploads" },
  { label: "AI Tools", href: "/admin/tools", desc: "Content & visual AI generation" },
  { label: "SEO & Clients", href: "/admin/settings", desc: "Site metadata & client list" },
  { label: "Design Config", href: "/admin/design", desc: "Colors, hero, social links" },
];

export default function AdminDashboard() {
  const [works, setWorks] = useState<Project[]>([]);
  const [journalCount, setJournalCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [totalMediaSize, setTotalMediaSize] = useState(0);
  const [activity, setActivity] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/works").then((r) => r.json()),
      fetch("/api/admin/journal").then((r) => r.json()),
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch("/api/admin/services").then((r) => r.json()),
      fetch("/api/admin/media").then((r) => r.json()),
      fetch("/api/admin/activity").then((r) => r.json()),
    ]).then(([worksData, journalData, clientsData, servicesData, mediaData, activityData]) => {
      setWorks(worksData);
      setJournalCount(journalData.filter((p: any) => p.status !== "draft").length);
      setDraftCount(journalData.filter((p: any) => p.status === "draft").length);
      setClientCount(clientsData.length);
      setServiceCount(servicesData.length);
      setMediaCount(mediaData.images?.length || 0);
      const total = (mediaData.images || []).reduce((acc: number, img: any) => acc + img.size, 0);
      setTotalMediaSize(total);
      setActivity(activityData.entries?.slice(0, 8) || []);
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return <div className="p-8"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;
  }

  const featured = works.filter((p) => p.featured);
  const recent = works.slice(0, 5);
  const categories = [...new Set(works.map((p) => p.category))];
  const years = [...new Set(works.map((p) => p.year))].sort((a, b) => b - a);

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

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 border-b border-rule pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Overview</span>
            <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.88 }}>Dashboard</h1>
            <p className="lab text-white/30 mt-3" style={{ fontSize: "0.6rem" }}>Rizky Irawan · Visual Archive Admin</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/works?new=true" className="lab px-4 py-2 bg-signal text-white hover:bg-signal/80 transition-colors" style={{ fontSize: "0.55rem" }}>
              + New Work
            </Link>
            <Link href="/admin/journal?new=true" className="lab px-4 py-2 border border-rule text-white/70 hover:border-white/30 hover:text-white transition-colors" style={{ fontSize: "0.55rem" }}>
              + New Post
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        <Link href="/admin/works" className="group border border-rule p-4 hover:border-signal transition-colors">
          <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Works</p>
          <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{works.length}</p>
          <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>{featured.length} featured</p>
        </Link>
        <Link href="/admin/journal" className="group border border-rule p-4 hover:border-signal transition-colors">
          <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Journal</p>
          <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{journalCount}</p>
          <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>{draftCount} drafts</p>
        </Link>
        <Link href="/admin/services" className="group border border-rule p-4 hover:border-signal transition-colors">
          <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Services</p>
          <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{serviceCount}</p>
          <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>offerings</p>
        </Link>
        <Link href="/admin/settings" className="group border border-rule p-4 hover:border-signal transition-colors">
          <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Clients</p>
          <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{clientCount}</p>
          <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>collaborations</p>
        </Link>
        <Link href="/admin/upload" className="group border border-rule p-4 hover:border-signal transition-colors">
          <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Media</p>
          <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2rem", lineHeight: 1 }}>{mediaCount}</p>
          <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>{formatBytes(totalMediaSize)}</p>
        </Link>
        <div className="border border-rule p-4">
          <p className="lab text-white/30 mb-1" style={{ fontSize: "0.5rem" }}>Works Categories</p>
          <p className="dis text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>{categories.length}</p>
          <p className="lab text-white/20 mt-1" style={{ fontSize: "0.48rem" }}>{years.length} years</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Works */}
        <div className="lg:col-span-2 border border-rule">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3">
            <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Recent Works</span>
            <Link href="/admin/works" className="lab text-signal hover:text-white transition-colors" style={{ fontSize: "0.52rem" }}>
              View all →
            </Link>
          </div>
          <div className="divide-y divide-rule">
            {recent.map((p) => (
              <Link
                key={p.slug}
                href={`/admin/works?edit=${p.slug}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                  <div>
                    <p className="lab text-white" style={{ fontSize: "0.6rem" }}>{p.title}</p>
                    <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{p.category} · {p.year}</p>
                  </div>
                </div>
                {p.featured && (
                  <span className="lab text-signal shrink-0" style={{ fontSize: "0.48rem", background: "rgba(255,53,0,0.1)", padding: "2px 6px" }}>
                    Featured
                  </span>
                )}
              </Link>
            ))}
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
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="lab text-white/50 hover:text-white transition-colors" style={{ fontSize: "0.58rem" }}>{l.label}</span>
                  <span className="lab text-white/20" style={{ fontSize: "0.52rem" }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* Admin Tools */}
          <div className="border border-rule">
            <div className="border-b border-rule px-5 py-3">
              <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Admin Tools</span>
            </div>
            <div className="divide-y divide-rule">
              {adminTools.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div>
                    <p className="lab text-white/50 hover:text-white transition-colors" style={{ fontSize: "0.58rem" }}>{t.label}</p>
                    <p className="lab text-white/20" style={{ fontSize: "0.48rem" }}>{t.desc}</p>
                  </div>
                  <span className="lab text-white/20" style={{ fontSize: "0.52rem" }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Activity Log */}
        <div className="border border-rule">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3">
            <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Recent Activity</span>
            <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>This session</span>
          </div>
          <div className="divide-y divide-rule">
            {activity.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <p className="lab text-white/30" style={{ fontSize: "0.58rem" }}>No activity recorded</p>
              </div>
            ) : (
              activity.map((entry: any) => (
                <div key={entry.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>{entry.action}</span>
                    <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>{formatTime(entry.timestamp)}</span>
                  </div>
                  <p className="lab text-white/30 mt-1" style={{ fontSize: "0.52rem" }}>{entry.detail}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Works by Category */}
        <div className="border border-rule">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3">
            <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Works by Category</span>
            <span className="lab text-white/20" style={{ fontSize: "0.48rem" }}>{works.length} total</span>
          </div>
          <div className="divide-y divide-rule">
            {categories.map((cat) => {
              const count = works.filter((p) => p.category === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                    <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>{cat}</span>
                  </div>
                  <span className="lab text-white/30" style={{ fontSize: "0.52rem" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 border border-rule p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>System Status: All services operational</span>
          </div>
          <div className="flex gap-6">
            <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>JSONBin: Connected</span>
            <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Formspree: Active</span>
            <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Next.js 16.2.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}
