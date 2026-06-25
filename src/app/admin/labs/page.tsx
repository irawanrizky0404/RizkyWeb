"use client";

import { useState, useEffect, useTransition } from "react";
import { addLab, updateLab, deleteLab } from "@/app/admin/actions";
import type { LabExperiment } from "@/lib/types";
import Link from "next/link";

const EMPTY: LabExperiment = {
  slug: "", title: "", year: new Date().getFullYear().toString(),
  description: "", componentName: "FluidSim",
};

export default function AdminLabs() {
  const [isPending, startTransition] = useTransition();
  const [labs, setLabs] = useState<LabExperiment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"content" | "form">("content");
  const [editing, setEditing] = useState<LabExperiment | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/labs?t=" + Date.now()).then((r) => r.json()).then((data) => {
      setLabs(data || []);
      setLoaded(true);
    });
  }, []);

  function notify(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleSave(lab: LabExperiment) {
    startTransition(async () => {
      const result = editing ? await updateLab(editing.slug, lab) : await addLab(lab);
      if (result.ok) {
        notify(editing ? "Lab updated!" : "Lab added!");
        setView("content");
        setEditing(null);
        const data = await fetch("/api/admin/labs?t=" + Date.now()).then((r) => r.json());
        setLabs(data);
      } else {
        notify(`Error: ${result.error}`);
      }
    });
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      await deleteLab(slug);
      setLabs((prev) => prev.filter((l) => l.slug !== slug));
      notify("Lab deleted.");
    });
  }

  function startAdd() {
    setEditing(null);
    setView("form");
  }

  function startEdit(lab: LabExperiment) {
    setEditing(lab);
    setView("form");
  }

  function goBack() {
    setView("content");
    setEditing(null);
  }

  if (!loaded) return <div className="p-6"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  if (view === "form") {
    return (
      <LabEditor
        lab={editing || EMPTY}
        isNew={!editing}
        onSave={handleSave}
        onCancel={goBack}
        isPending={isPending}
        msg={msg}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="shrink-0 bg-black border-b border-rule px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — Labs</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 0.88 }}>Labs</p>
          </div>
          <div className="flex items-center gap-2">
            {msg && <span className="lab text-signal animate-pulse" style={{ fontSize: "0.52rem" }}>{msg}</span>}
            <button onClick={startAdd} className="border border-signal px-4 py-2 hover:bg-signal transition-colors">
              <span className="lab text-white hover:text-black" style={{ fontSize: "0.6rem" }}>+ Add Lab</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {labs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="dis text-white/20" style={{ fontSize: "3rem" }}>—</p>
            <p className="lab text-white/30 mt-3" style={{ fontSize: "0.6rem" }}>No labs found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {labs.map((lab) => (
              <div key={lab.slug} className="group flex items-center gap-4 border border-rule hover:border-signal/50 transition-colors cursor-pointer bg-black p-4" onClick={() => startEdit(lab)}>
                <div className="flex-1 min-w-0">
                  <p className="lab text-white truncate" style={{ fontSize: "0.65rem" }}>{lab.title}</p>
                  <p className="lab text-white/40 truncate" style={{ fontSize: "0.5rem", marginTop: "2px" }}>{lab.componentName}</p>
                </div>
                <span className="lab text-white/30 shrink-0" style={{ fontSize: "0.5rem" }}>{lab.year}</span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/labs/${lab.slug}`} target="_blank" className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.5rem" }}>↗</Link>
                  <button onClick={() => handleDelete(lab.slug, lab.title)} disabled={isPending} className="lab text-white/30 hover:text-red-400 transition-colors" style={{ fontSize: "0.5rem" }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LabEditor({ lab: initial, isNew, onSave, onCancel, isPending, msg }: {
  lab: LabExperiment;
  isNew: boolean;
  onSave: (l: LabExperiment) => void;
  onCancel: () => void;
  isPending: boolean;
  msg: string;
}) {
  const [form, setForm] = useState<LabExperiment>(initial);

  const set = (k: keyof LabExperiment) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const lab: LabExperiment = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    };
    onSave(lab);
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 bg-black border-b border-rule z-10">
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={onCancel} className="lab text-white/40 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>
            ← Back
          </button>
          <div className="h-4 w-px bg-rule" />
          <div>
            <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.ADM — {isNew ? "New Lab" : "Edit Lab"}</span>
            <p className="dis text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.8rem)", lineHeight: 0.88 }}>
              {isNew ? "Add New Lab" : `Editing — ${initial.title}`}
            </p>
          </div>
          {msg && <span className="lab text-signal animate-pulse ml-auto" style={{ fontSize: "0.52rem" }}>{msg}</span>}
        </div>
      </div>

      <form onSubmit={submit} className="p-6 max-w-3xl">
        <div className="space-y-6">
          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => { set("title")(e); if (isNew && !form.slug) setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })); }}
              className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.65rem" }}
              placeholder="Lab title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Slug {isNew && <span className="text-white/20">(auto)</span>}</label>
              <input
                value={form.slug}
                onChange={set("slug")}
                className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
                style={{ fontSize: "0.65rem" }}
                placeholder="lab-slug"
              />
            </div>
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
          </div>

          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>React Component Name *</label>
            <input
              required
              value={form.componentName}
              onChange={set("componentName")}
              className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors"
              style={{ fontSize: "0.65rem" }}
              placeholder="FluidSim"
            />
            <p className="lab text-white/30 mt-2" style={{ fontSize: "0.5rem" }}>Must match a component configured in lab-canvas.tsx</p>
          </div>

          <div>
            <label className="lab text-white/40 block mb-2" style={{ fontSize: "0.55rem" }}>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={set("description")}
              className="w-full bg-transparent border border-rule px-4 py-3 lab text-white placeholder:text-white/20 focus:outline-none focus:border-signal transition-colors resize-none"
              style={{ fontSize: "0.65rem" }}
              placeholder="Lab description"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-rule">
          <button type="submit" disabled={isPending} className="border border-signal px-6 py-3 hover:bg-signal transition-colors disabled:opacity-40">
            <span className="lab text-white" style={{ fontSize: "0.6rem" }}>{isPending ? "Saving..." : "Save Lab"}</span>
          </button>
          <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>Cancel</button>
          {!isNew && (
            <Link href={`/labs/${initial.slug}`} target="_blank" className="lab text-white/20 hover:text-white ml-auto" style={{ fontSize: "0.55rem" }}>
              View live ↗
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
