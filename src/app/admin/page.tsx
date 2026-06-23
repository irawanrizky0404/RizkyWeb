"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

const quickLinks = [
  { label: "View homepage", href: "/", external: true },
  { label: "View works", href: "/works", external: true },
  { label: "View contact", href: "/contact", external: true },
  { label: "Formspree inbox", href: "https://formspree.io/forms/xrewgrkl/submissions", external: true },
];

export default function AdminDashboard() {
  const [works, setWorks] = useState<Project[]>([]);
  const [journalCount, setJournalCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/works").then((r) => r.json()),
      fetch("/api/admin/journal").then((r) => r.json()),
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch("/api/admin/services").then((r) => r.json()),
    ]).then(([worksData, journalData, clientsData, servicesData]) => {
      setWorks(worksData);
      setJournalCount(journalData.length);
      setClientCount(clientsData.length);
      setServiceCount(servicesData.length);
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return <div className="p-8"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;
  }

  const stats = [
    { label: "Works", value: works.length, href: "/admin/works" },
    { label: "Journal Posts", value: journalCount, href: "/admin/journal" },
    { label: "Clients", value: clientCount, href: "/admin/settings" },
    { label: "Services", value: serviceCount, href: "/admin/services" },
  ];

  const featured = works.filter((p) => p.featured);
  const recent = works.slice(0, 5);

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-10 border-b border-rule pb-6">
        <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Overview</span>
        <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Dashboard</h1>
        <p className="lab text-white/30 mt-3" style={{ fontSize: "0.6rem" }}>Rizky Irawan · Visual Archive Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group border border-rule p-5 hover:border-signal transition-colors"
          >
            <p className="lab text-white/30 mb-2" style={{ fontSize: "0.52rem" }}>{s.label}</p>
            <p className="dis text-white group-hover:text-signal transition-colors" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Recent works */}
        <div className="border border-rule">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3">
            <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Recent Works</span>
            <Link href="/admin/works" className="lab text-signal hover:text-white transition-colors" style={{ fontSize: "0.52rem" }}>
              View all →
            </Link>
          </div>
          {recent.map((p) => (
            <Link
              key={p.slug}
              href={`/admin/works?edit=${p.slug}`}
              className="flex items-center justify-between border-b border-rule px-5 py-3 hover:bg-white/[0.03] transition-colors last:border-b-0"
            >
              <div>
                <p className="lab text-white" style={{ fontSize: "0.6rem" }}>{p.title}</p>
                <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{p.category} · {p.year}</p>
              </div>
              {p.featured && (
                <span className="lab text-signal" style={{ fontSize: "0.48rem", background: "rgba(255,53,0,0.1)", padding: "2px 6px" }}>
                  Featured
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Quick links + featured */}
        <div className="flex flex-col gap-6">
          {/* Quick links */}
          <div className="border border-rule">
            <div className="border-b border-rule px-5 py-3">
              <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Quick Links</span>
            </div>
            {quickLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center justify-between border-b border-rule px-5 py-3 hover:bg-white/[0.03] transition-colors last:border-b-0"
              >
                <span className="lab text-white/50 hover:text-white transition-colors" style={{ fontSize: "0.58rem" }}>{l.label}</span>
                <span className="lab text-white/20" style={{ fontSize: "0.52rem" }}>↗</span>
              </a>
            ))}
          </div>

          {/* Featured works */}
          <div className="border border-rule">
            <div className="border-b border-rule px-5 py-3">
              <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Featured ({featured.length})</span>
            </div>
            {featured.map((p) => (
              <div key={p.slug} className="flex items-center gap-3 border-b border-rule px-5 py-3 last:border-b-0">
                <div className="h-1 w-1 rounded-full bg-signal shrink-0" />
                <span className="lab text-white/50" style={{ fontSize: "0.58rem" }}>{p.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
