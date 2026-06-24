"use client";

import { useState, useEffect, useTransition } from "react";
import { addExperience, updateExperience, deleteExperience, addSkillGroup, updateSkillGroup, deleteSkillGroup, addToolGroup, updateToolGroup, deleteToolGroup, addEducation, updateEducation, deleteEducation, addAward, updateAward, deleteAward } from "@/app/admin/actions";
import type { Experience, SkillGroup, Education, Award } from "@/lib/types";
import type { CVData } from "@/lib/store";

const EMPTY_CV: CVData = { experiences: [], skillGroups: [], tools: [], education: [], awards: [] };

type Tab = "experience" | "skills" | "tools" | "education" | "awards" | "preview";

const EMPTY_EXP: Experience = { role: "", organization: "", period: "", description: "", highlights: [] };
const EMPTY_SKILL: SkillGroup = { category: "", items: [] };
const EMPTY_TOOL: SkillGroup = { category: "", items: [] };
const EMPTY_EDU: Education = { degree: "", institution: "", period: "", description: "" };
const EMPTY_AWARD: Award = { title: "", organization: "", year: "", description: "" };

const TABS: { id: Tab; label: string }[] = [
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "tools", label: "Tools" },
  { id: "education", label: "Education" },
  { id: "awards", label: "Awards" },
  { id: "preview", label: "Preview" },
];

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="lab text-white/30 block mb-1" style={{ fontSize: "0.58rem" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-rule py-2 lab text-white placeholder:text-white/15 focus:outline-none focus:border-signal transition-colors"
      style={{ fontSize: "0.6rem" }}
      {...props}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3, ...props }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> & { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-transparent border-b border-rule py-2 lab text-white placeholder:text-white/15 focus:outline-none focus:border-signal transition-colors resize-none"
      style={{ fontSize: "0.6rem" }}
      {...props}
    />
  );
}

function ExperienceForm({ initial, onSave, onCancel, isNew }: { initial: Experience; onSave: (e: Experience) => void; onCancel: () => void; isNew: boolean }) {
  const [form, setForm] = useState(initial);
  const [highlightsStr, setHighlightsStr] = useState(initial.highlights.join("\n"));
  const [isDirty, setIsDirty] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingHighlights, setGeneratingHighlights] = useState(false);

  const set = (k: keyof Experience) => (v: string) => { setIsDirty(true); setForm((p) => ({ ...p, [k]: v })); };

  async function handleGenerateDescription() {
    if (!form.role.trim()) { alert("Enter a role title first"); return; }
    setGeneratingDesc(true);
    try {
      const res = await fetch("/api/admin/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${form.role} at ${form.organization || "Company"}`, type: "description", category: "work experience" }),
      });
      const data = await res.json();
      if (data.result) {
        setForm((p) => ({ ...p, description: data.result }));
        setIsDirty(true);
      } else alert(data.error || "Failed to generate");
    } catch { alert("Failed to generate description"); }
    finally { setGeneratingDesc(false); }
  }

  async function handleGenerateHighlights() {
    if (!form.role.trim() || !form.description.trim()) { alert("Enter role and description first"); return; }
    setGeneratingHighlights(true);
    try {
      const res = await fetch("/api/admin/ai/utils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "highlights", text: `${form.role} at ${form.organization}: ${form.description}` }),
      });
      const data = await res.json();
      if (data.result) {
        setHighlightsStr(data.result);
        setIsDirty(true);
      } else alert("Failed to generate highlights");
    } catch { alert("Failed to generate highlights"); }
    finally { setGeneratingHighlights(false); }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("exp-submit")?.click();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (!isDirty || confirm("You have unsaved changes. Discard them?")) onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, onCancel]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...form, highlights: highlightsStr.split("\n").map((h) => h.trim()).filter(Boolean) });
  }

  return (
    <form onSubmit={submit} className="border border-signal p-6 mt-4">
      <h2 className="dis text-white mb-6" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 0.9 }}>
        {isNew ? "Add Experience" : `Edit — ${initial.role}`}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="Role / Title *"><Input value={form.role} onChange={set("role")} placeholder="Freelance Visual Artist" required /></FormField>
        <FormField label="Organization *"><Input value={form.organization} onChange={set("organization")} placeholder="Independent" required /></FormField>
        <FormField label="Period *"><Input value={form.period} onChange={set("period")} placeholder="2022 — Present" required /></FormField>
        <FormField label="Description"><Textarea value={form.description} onChange={set("description")} placeholder="Brief description" rows={2} /></FormField>
        <div className="md:col-span-2">
          <FormField label="Highlights (one per line)"><Textarea value={highlightsStr} onChange={setHighlightsStr} placeholder="Delivered 20+ client projects..." rows={4} /></FormField>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="submit" id="exp-submit" className="group inline-flex items-center gap-4 border border-signal px-5 py-3 hover:bg-signal transition-colors">
          <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>Save</span>
        </button>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>Cancel</button>
      </div>
    </form>
  );
}

function SkillGroupForm({ initial, onSave, onCancel, isNew }: { initial: SkillGroup; onSave: (s: SkillGroup) => void; onCancel: () => void; isNew: boolean }) {
  const [form, setForm] = useState(initial);
  const [itemsStr, setItemsStr] = useState(initial.items.join(", "));
  const [isDirty, setIsDirty] = useState(false);

  const set = (k: keyof SkillGroup) => (v: string) => { setIsDirty(true); setForm((p) => ({ ...p, [k]: v })); };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("skill-submit")?.click();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (!isDirty || confirm("You have unsaved changes. Discard them?")) onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, onCancel]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...form, items: itemsStr.split(",").map((i) => i.trim()).filter(Boolean) });
  }

  return (
    <form onSubmit={submit} className="border border-signal p-6 mt-4">
      <h2 className="dis text-white mb-6" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 0.9 }}>
        {isNew ? "Add Category" : `Edit — ${initial.category}`}
      </h2>
      <div className="space-y-6">
        <FormField label="Category *"><Input value={form.category} onChange={set("category")} placeholder="3D" required /></FormField>
        <FormField label="Items (comma separated)"><Textarea value={itemsStr} onChange={setItemsStr} placeholder="Archviz Interior, Product Render..." rows={3} /></FormField>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="submit" id="skill-submit" className="group inline-flex items-center gap-4 border border-signal px-5 py-3 hover:bg-signal transition-colors">
          <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>Save</span>
        </button>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>Cancel</button>
      </div>
    </form>
  );
}

function EducationForm({ initial, onSave, onCancel, isNew }: { initial: Education; onSave: (e: Education) => void; onCancel: () => void; isNew: boolean }) {
  const [form, setForm] = useState(initial);
  const [isDirty, setIsDirty] = useState(false);

  const set = (k: keyof Education) => (v: string) => { setIsDirty(true); setForm((p) => ({ ...p, [k]: v })); };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("edu-submit")?.click();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (!isDirty || confirm("You have unsaved changes. Discard them?")) onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, onCancel]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={submit} className="border border-signal p-6 mt-4">
      <h2 className="dis text-white mb-6" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 0.9 }}>
        {isNew ? "Add Education" : `Edit — ${initial.degree}`}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="Degree *"><Input value={form.degree} onChange={set("degree")} placeholder="Multidisciplinary Visual Arts" required /></FormField>
        <FormField label="Institution *"><Input value={form.institution} onChange={set("institution")} placeholder="Self-directed Practice" required /></FormField>
        <FormField label="Period *"><Input value={form.period} onChange={set("period")} placeholder="2019 — Present" required /></FormField>
        <div className="md:col-span-2">
          <FormField label="Description"><Textarea value={form.description ?? ""} onChange={set("description")} placeholder="Description..." rows={2} /></FormField>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="submit" id="edu-submit" className="group inline-flex items-center gap-4 border border-signal px-5 py-3 hover:bg-signal transition-colors">
          <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>Save</span>
        </button>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>Cancel</button>
      </div>
    </form>
  );
}

function AwardForm({ initial, onSave, onCancel, isNew }: { initial: Award; onSave: (a: Award) => void; onCancel: () => void; isNew: boolean }) {
  const [form, setForm] = useState(initial);
  const [isDirty, setIsDirty] = useState(false);

  const set = (k: keyof Award) => (v: string) => { setIsDirty(true); setForm((p) => ({ ...p, [k]: v })); };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("award-submit")?.click();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (!isDirty || confirm("You have unsaved changes. Discard them?")) onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, onCancel]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={submit} className="border border-signal p-6 mt-4">
      <h2 className="dis text-white mb-6" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 0.9 }}>
        {isNew ? "Add Award" : `Edit — ${initial.title}`}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormField label="Title *"><Input value={form.title} onChange={set("title")} placeholder="Winner — Space Tech Art Challenge" required /></FormField>
        </div>
        <FormField label="Organization *"><Input value={form.organization} onChange={set("organization")} placeholder="NASA" required /></FormField>
        <FormField label="Year *"><Input value={form.year} onChange={set("year")} placeholder="2024" required /></FormField>
        <div className="md:col-span-2">
          <FormField label="Description"><Textarea value={form.description} onChange={set("description")} placeholder="Description..." rows={2} /></FormField>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="submit" id="award-submit" className="group inline-flex items-center gap-4 border border-signal px-5 py-3 hover:bg-signal transition-colors">
          <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>Save</span>
        </button>
        <button type="button" onClick={onCancel} className="lab text-white/30 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminCV() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("experience");
  const [cv, setCV] = useState<CVData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setCV(EMPTY_CV);
    fetch("/api/admin/cv")
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((d) => { 
        if (d && typeof d === 'object' && Array.isArray(d.experiences)) {
          setCV(d); 
        } else {
          setCV(EMPTY_CV);
        }
        setLoaded(true); 
      })
      .catch(() => { setCV(EMPTY_CV); setLoaded(true); });
  }, []);

  function notify(text: string) { setMsg(text); setTimeout(() => setMsg(""), 3000); }

  if (!loaded || !cv) return <div className="p-8"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  if (error || !cv) {
    return (
      <div className="p-8">
        <div className="border border-rule p-6 text-center">
          <p className="lab text-white/50 mb-4" style={{ fontSize: "0.7rem" }}>Failed to load CV data</p>
          <button onClick={() => window.location.reload()} className="border border-signal px-4 py-2">
            <span className="lab text-white" style={{ fontSize: "0.6rem" }}>Reload</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Experience ──────────────────────────────────────────────
  async function handleSaveExp(exp: Experience, key: string) {
    startTransition(async () => {
      const result: { ok: boolean; error?: string } = mode === "edit" && editing
        ? await updateExperience(key, exp)
        : await addExperience(exp);
      if (result.ok) {
        notify(mode === "add" ? "Experience added!" : "Experience updated!");
        setMode("list"); setEditing(null);
        setTimeout(() => window.location.reload(), 500);
      } else { notify(`Error: ${result.error}`); }
    });
  }
  async function handleDeleteExp(role: string) {
    if (!confirm(`Delete "${role}"?`)) return;
    startTransition(async () => {
      await deleteExperience(role);
      setCV((p) => p ? { ...p, experiences: p.experiences.filter((e) => e.role !== role) } : p);
      notify("Deleted.");
    });
  }

  // ── Skills ─────────────────────────────────────────────────
  async function handleSaveSkill(group: SkillGroup, key: string) {
    startTransition(async () => {
      const result: { ok: boolean; error?: string } = mode === "edit" && editing
        ? await updateSkillGroup(key, group)
        : await addSkillGroup(group);
      if (result.ok) {
        notify(mode === "add" ? "Skill added!" : "Skill updated!");
        setMode("list"); setEditing(null);
        setTimeout(() => window.location.reload(), 500);
      } else { notify(`Error: ${result.error}`); }
    });
  }
  async function handleDeleteSkill(category: string) {
    if (!confirm(`Delete "${category}"?`)) return;
    startTransition(async () => {
      await deleteSkillGroup(category);
      setCV((p) => p ? { ...p, skillGroups: p.skillGroups.filter((g) => g.category !== category) } : p);
      notify("Deleted.");
    });
  }

  // ── Tools ──────────────────────────────────────────────────
  async function handleSaveTool(group: SkillGroup, key: string) {
    startTransition(async () => {
      const result: { ok: boolean; error?: string } = mode === "edit" && editing
        ? await updateToolGroup(key, group)
        : await addToolGroup(group);
      if (result.ok) {
        notify(mode === "add" ? "Tool group added!" : "Tool group updated!");
        setMode("list"); setEditing(null);
        setTimeout(() => window.location.reload(), 500);
      } else { notify(`Error: ${result.error}`); }
    });
  }
  async function handleDeleteTool(category: string) {
    if (!confirm(`Delete "${category}"?`)) return;
    startTransition(async () => {
      await deleteToolGroup(category);
      setCV((p) => p ? { ...p, tools: p.tools.filter((g) => g.category !== category) } : p);
      notify("Deleted.");
    });
  }

  // ── Education ───────────────────────────────────────────────
  async function handleSaveEdu(edu: Education, key: string) {
    startTransition(async () => {
      const result: { ok: boolean; error?: string } = mode === "edit" && editing
        ? await updateEducation(key, edu)
        : await addEducation(edu);
      if (result.ok) {
        notify(mode === "add" ? "Education added!" : "Education updated!");
        setMode("list"); setEditing(null);
        setTimeout(() => window.location.reload(), 500);
      } else { notify(`Error: ${result.error}`); }
    });
  }
  async function handleDeleteEdu(degree: string) {
    if (!confirm(`Delete "${degree}"?`)) return;
    startTransition(async () => {
      await deleteEducation(degree);
      setCV((p) => p ? { ...p, education: p.education.filter((e) => e.degree !== degree) } : p);
      notify("Deleted.");
    });
  }

  // ── Awards ─────────────────────────────────────────────────
  async function handleSaveAward(award: Award, key: string) {
    startTransition(async () => {
      const result: { ok: boolean; error?: string } = mode === "edit" && editing
        ? await updateAward(key, award)
        : await addAward(award);
      if (result.ok) {
        notify(mode === "add" ? "Award added!" : "Award updated!");
        setMode("list"); setEditing(null);
        setTimeout(() => window.location.reload(), 500);
      } else { notify(`Error: ${result.error}`); }
    });
  }
  async function handleDeleteAward(title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      await deleteAward(title);
      setCV((p) => p ? { ...p, awards: p.awards.filter((a) => a.title !== title) } : p);
      notify("Deleted.");
    });
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 border-b border-rule pb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — CV</span>
          <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>CV</h1>
          <p className="lab text-white/30 mt-2" style={{ fontSize: "0.55rem" }}>
            {cv.experiences.length} experiences · {cv.skillGroups.length} skill categories · {cv.tools.length} tools · {cv.education.length} education · {cv.awards.length} awards
          </p>
        </div>
        {msg && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>{msg}</span>}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 flex-wrap border-b border-rule pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setMode("list"); setEditing(null); }}
            className="lab px-4 py-2 transition-colors"
            style={{
              fontSize: "0.58rem",
              color: tab === t.id ? "var(--signal)" : "color-mix(in srgb, var(--white) 40%, transparent)",
              background: tab === t.id ? "color-mix(in srgb, var(--signal) 8%, transparent)" : "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Experience ──────────────────────────────────────── */}
      {tab === "experience" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>{cv.experiences.length} entries</span>
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>Add your work history, freelance projects, and relevant positions.</p>
            </div>
            <button onClick={() => { setMode("add"); setEditing(null); }} className="border border-signal px-3 py-1 hover:bg-signal transition-colors">
              <span className="lab text-white group-hover:text-black" style={{ fontSize: "0.52rem" }}>+ Add</span>
            </button>
          </div>
          {mode === "add" && (
            <ExperienceForm
              initial={EMPTY_EXP}
              onSave={(e) => handleSaveExp(e, "")}
              onCancel={() => { setMode("list"); }}
              isNew={true}
            />
          )}
          <div className="border border-rule">
            {cv.experiences.map((exp) => (
              <div key={exp.role} className="border-b border-rule last:border-b-0">
                {editing === exp.role && mode === "edit" ? (
                  <ExperienceForm
                    initial={exp}
                    onSave={(e) => handleSaveExp(e, exp.role)}
                    onCancel={() => { setMode("list"); setEditing(null); }}
                    isNew={false}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="lab text-white mb-1" style={{ fontSize: "0.62rem" }}>{exp.role}</p>
                      <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{exp.organization} · {exp.period}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => { setEditing(exp.role); setMode("edit"); }} className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.52rem" }}>Edit</button>
                      <button onClick={() => handleDeleteExp(exp.role)} disabled={isPending} className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.52rem" }}>Del</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Skills ──────────────────────────────────────────── */}
      {tab === "skills" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>{cv.skillGroups.length} categories</span>
            <button onClick={() => { setMode("add"); setEditing(null); }} className="border border-signal px-3 py-1 hover:bg-signal transition-colors">
              <span className="lab text-white" style={{ fontSize: "0.52rem" }}>+ Add</span>
            </button>
          </div>
          {mode === "add" && (
            <SkillGroupForm
              initial={EMPTY_SKILL}
              onSave={(g) => handleSaveSkill(g, "")}
              onCancel={() => { setMode("list"); }}
              isNew={true}
            />
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {cv.skillGroups.map((g) => (
              <div key={g.category} className="border border-rule p-5">
                {editing === g.category && mode === "edit" ? (
                  <SkillGroupForm
                    initial={g}
                    onSave={(sg) => handleSaveSkill(sg, g.category)}
                    onCancel={() => { setMode("list"); setEditing(null); }}
                    isNew={false}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="dis text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.8rem)", lineHeight: 0.9 }}>{g.category}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => { setEditing(g.category); setMode("edit"); }} className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.48rem" }}>Edit</button>
                        <button onClick={() => handleDeleteSkill(g.category)} disabled={isPending} className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.48rem" }}>Del</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((item) => (
                        <span key={item} className="lab text-white/50 border border-rule px-2 py-1" style={{ fontSize: "0.48rem" }}>{item}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Tools ────────────────────────────────────────────── */}
      {tab === "tools" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>{cv.tools.length} categories</span>
            <button onClick={() => { setMode("add"); setEditing(null); }} className="border border-signal px-3 py-1 hover:bg-signal transition-colors">
              <span className="lab text-white" style={{ fontSize: "0.52rem" }}>+ Add</span>
            </button>
          </div>
          {mode === "add" && (
            <SkillGroupForm
              initial={EMPTY_TOOL}
              onSave={(g) => handleSaveTool(g, "")}
              onCancel={() => { setMode("list"); }}
              isNew={true}
            />
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {cv.tools.map((g) => (
              <div key={g.category} className="border border-rule p-5">
                {editing === g.category && mode === "edit" ? (
                  <SkillGroupForm
                    initial={g}
                    onSave={(sg) => handleSaveTool(sg, g.category)}
                    onCancel={() => { setMode("list"); setEditing(null); }}
                    isNew={false}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="dis text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.8rem)", lineHeight: 0.9 }}>{g.category}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => { setEditing(g.category); setMode("edit"); }} className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.48rem" }}>Edit</button>
                        <button onClick={() => handleDeleteTool(g.category)} disabled={isPending} className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.48rem" }}>Del</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((item) => (
                        <span key={item} className="lab text-white/50 border border-rule px-2 py-1" style={{ fontSize: "0.48rem" }}>{item}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Education ───────────────────────────────────────── */}
      {tab === "education" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>{cv.education.length} entries</span>
            <button onClick={() => { setMode("add"); setEditing(null); }} className="border border-signal px-3 py-1 hover:bg-signal transition-colors">
              <span className="lab text-white" style={{ fontSize: "0.52rem" }}>+ Add</span>
            </button>
          </div>
          {mode === "add" && (
            <EducationForm
              initial={EMPTY_EDU}
              onSave={(e) => handleSaveEdu(e, "")}
              onCancel={() => { setMode("list"); }}
              isNew={true}
            />
          )}
          <div className="border border-rule">
            {cv.education.map((edu) => (
              <div key={edu.degree} className="border-b border-rule last:border-b-0">
                {editing === edu.degree && mode === "edit" ? (
                  <EducationForm
                    initial={edu}
                    onSave={(e) => handleSaveEdu(e, edu.degree)}
                    onCancel={() => { setMode("list"); setEditing(null); }}
                    isNew={false}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="lab text-white mb-1" style={{ fontSize: "0.62rem" }}>{edu.degree}</p>
                      <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{edu.institution} · {edu.period}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => { setEditing(edu.degree); setMode("edit"); }} className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.52rem" }}>Edit</button>
                      <button onClick={() => handleDeleteEdu(edu.degree)} disabled={isPending} className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.52rem" }}>Del</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Awards ──────────────────────────────────────────── */}
      {tab === "awards" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>{cv.awards.length} entries</span>
            <button onClick={() => { setMode("add"); setEditing(null); }} className="border border-signal px-3 py-1 hover:bg-signal transition-colors">
              <span className="lab text-white" style={{ fontSize: "0.52rem" }}>+ Add</span>
            </button>
          </div>
          {mode === "add" && (
            <AwardForm
              initial={EMPTY_AWARD}
              onSave={(a) => handleSaveAward(a, "")}
              onCancel={() => { setMode("list"); }}
              isNew={true}
            />
          )}
          <div className="border border-rule">
            {cv.awards.map((award) => (
              <div key={award.title} className="border-b border-rule last:border-b-0">
                {editing === award.title && mode === "edit" ? (
                  <AwardForm
                    initial={award}
                    onSave={(a) => handleSaveAward(a, award.title)}
                    onCancel={() => { setMode("list"); setEditing(null); }}
                    isNew={false}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="lab text-white mb-1" style={{ fontSize: "0.62rem" }}>{award.title}</p>
                      <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>{award.organization} · {award.year}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => { setEditing(award.title); setMode("edit"); }} className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.52rem" }}>Edit</button>
                      <button onClick={() => handleDeleteAward(award.title)} disabled={isPending} className="lab text-white/20 hover:text-red-400 transition-colors" style={{ fontSize: "0.52rem" }}>Del</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Preview ─────────────────────────────────────────────── */}
      {tab === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Live Preview</span>
              <p className="lab text-white/20 mt-1" style={{ fontSize: "0.5rem" }}>See how your CV will appear on the homepage and CV page.</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/cv"
                target="_blank"
                className="border border-rule px-3 py-1 lab text-white/30 hover:text-white hover:border-white/30 transition-colors"
                style={{ fontSize: "0.52rem" }}
              >
                View CV Page ↗
              </a>
              <a
                href="/about"
                target="_blank"
                className="border border-rule px-3 py-1 lab text-white/30 hover:text-white hover:border-white/30 transition-colors"
                style={{ fontSize: "0.52rem" }}
              >
                View About Page ↗
              </a>
            </div>
          </div>

          {/* Mini CV Preview */}
          <div className="border border-rule overflow-hidden">
            {/* Header Preview */}
            <div className="border-b border-rule px-5 py-4 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)", lineHeight: 0.9 }}>Rizky Irawan</p>
                  <p className="lab text-white/30 mt-1" style={{ fontSize: "0.55rem" }}>Multidisciplinary Visual Artist · Indonesia · Est. 2017</p>
                </div>
                <span className="lab text-signal border border-signal px-2 py-1" style={{ fontSize: "0.5rem" }}>Download PDF ↓</span>
              </div>
            </div>

            {/* Experience Preview */}
            <div className="border-b border-rule">
              <div className="px-5 py-3 border-b border-rule">
                <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>FAC.CV — Experience</span>
              </div>
              {cv.experiences.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>No experience entries yet. Add some above.</p>
                </div>
              ) : (
                cv.experiences.slice(0, 3).map((exp, i) => (
                  <div key={exp.role} className="border-b border-rule last:border-b-0 px-5 py-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div className="flex-1">
                        <p className="dis text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", lineHeight: 0.9 }}>{exp.role}</p>
                        <p className="lab text-white/30 mt-1" style={{ fontSize: "0.5rem" }}>{exp.organization}</p>
                      </div>
                      <span className="lab text-signal shrink-0" style={{ fontSize: "0.5rem" }}>{exp.period}</span>
                    </div>
                    <p className="lab text-white/40 mt-2" style={{ fontSize: "0.55rem" }}>{exp.description}</p>
                  </div>
                ))
              )}
              {cv.experiences.length > 3 && (
                <div className="px-5 py-3 text-center border-t border-rule">
                  <span className="lab text-white/30" style={{ fontSize: "0.5rem" }}>+ {cv.experiences.length - 3} more on CV page</span>
                </div>
              )}
            </div>

            {/* Skills + Tools Preview */}
            <div className="border-b border-rule">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-rule">
                {/* Skills */}
                <div>
                  <div className="px-5 py-3 border-b border-rule">
                    <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>Skills</span>
                  </div>
                  {cv.skillGroups.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>No skill categories yet.</p>
                    </div>
                  ) : (
                    cv.skillGroups.slice(0, 3).map((g) => (
                      <div key={g.category} className="border-b border-rule last:border-b-0 px-5 py-4">
                        <p className="lab text-white/50 mb-2" style={{ fontSize: "0.5rem" }}>{g.category}</p>
                        <div className="flex flex-wrap gap-1">
                          {g.items.slice(0, 6).map((item) => (
                            <span key={item} className="lab text-white/60 border border-rule px-2 py-0.5" style={{ fontSize: "0.48rem" }}>{item}</span>
                          ))}
                          {g.items.length > 6 && (
                            <span className="lab text-white/30" style={{ fontSize: "0.48rem" }}>+{g.items.length - 6}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Tools */}
                <div>
                  <div className="px-5 py-3 border-b border-rule">
                    <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>Tools</span>
                  </div>
                  {cv.tools.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>No tool categories yet.</p>
                    </div>
                  ) : (
                    cv.tools.slice(0, 3).map((g) => (
                      <div key={g.category} className="border-b border-rule last:border-b-0 px-5 py-4">
                        <p className="lab text-white/50 mb-2" style={{ fontSize: "0.5rem" }}>{g.category}</p>
                        <div className="flex flex-wrap gap-1">
                          {g.items.slice(0, 6).map((item) => (
                            <span key={item} className="lab text-white/60 border border-rule px-2 py-0.5" style={{ fontSize: "0.48rem" }}>{item}</span>
                          ))}
                          {g.items.length > 6 && (
                            <span className="lab text-white/30" style={{ fontSize: "0.48rem" }}>+{g.items.length - 6}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Education + Awards Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-rule">
              {/* Education */}
              <div>
                <div className="px-5 py-3 border-b border-rule">
                  <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>Education</span>
                </div>
                {cv.education.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>No education entries yet.</p>
                  </div>
                ) : (
                  cv.education.slice(0, 2).map((edu) => (
                    <div key={edu.degree} className="border-b border-rule last:border-b-0 px-5 py-4">
                      <p className="dis text-white" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.3rem)", lineHeight: 0.9 }}>{edu.degree}</p>
                      <p className="lab text-white/30 mt-1" style={{ fontSize: "0.5rem" }}>{edu.institution} · {edu.period}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Awards */}
              <div>
                <div className="px-5 py-3 border-b border-rule">
                  <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>Recognition</span>
                </div>
                {cv.awards.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="lab text-white/30" style={{ fontSize: "0.55rem" }}>No awards yet.</p>
                  </div>
                ) : (
                  cv.awards.slice(0, 2).map((award) => (
                    <div key={award.title} className="border-b border-rule last:border-b-0 px-5 py-4">
                      <p className="dis text-white" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.3rem)", lineHeight: 0.9 }}>{award.title}</p>
                      <p className="lab text-white/30 mt-1" style={{ fontSize: "0.5rem" }}>{award.organization} · {award.year}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTA Preview */}
            <div className="border-t-2 border-signal px-5 py-6">
              <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)", lineHeight: 0.88 }}>Let&apos;s work together.</p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="border border-rule p-4 text-center">
              <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 0.9 }}>{cv.experiences.length}</p>
              <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Experiences</p>
            </div>
            <div className="border border-rule p-4 text-center">
              <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 0.9 }}>{cv.skillGroups.length}</p>
              <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Skill Groups</p>
            </div>
            <div className="border border-rule p-4 text-center">
              <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 0.9 }}>{cv.tools.length}</p>
              <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Tool Groups</p>
            </div>
            <div className="border border-rule p-4 text-center">
              <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 0.9 }}>{cv.education.length}</p>
              <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Education</p>
            </div>
            <div className="border border-rule p-4 text-center">
              <p className="dis text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 0.9 }}>{cv.awards.length}</p>
              <p className="lab text-white/30" style={{ fontSize: "0.5rem" }}>Awards</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
