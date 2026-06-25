"use client";

import { useState, useEffect, useTransition } from "react";
import type { SkillGroup } from "@/lib/types";
import { addToolGroup, updateToolGroup, deleteToolGroup } from "@/app/admin/actions";

const EMPTY_TOOL: SkillGroup = { category: "", items: [] };

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
        <FormField label="Items (comma separated)"><Textarea value={itemsStr} onChange={setItemsStr} placeholder="Blender, ZBrush, Cinema 4D..." rows={3} /></FormField>
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

export function ToolsManager({ 
  tools, 
  onUpdate 
}: { 
  tools: SkillGroup[]; 
  onUpdate: (newTools: SkillGroup[]) => void;
}) {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  async function handleSaveTool(tool: SkillGroup, oldCategory: string) {
    if (!tool.category) return;
    setMsg("Saving...");
    startTransition(async () => {
      try {
        if (oldCategory) {
          await updateToolGroup(oldCategory, tool);
          onUpdate(tools.map((g) => g.category === oldCategory ? tool : g));
        } else {
          await addToolGroup(tool);
          onUpdate([...tools, tool]);
        }
        setMode("list");
        setEditing(null);
        setMsg("Saved!");
        setTimeout(() => setMsg(""), 2000);
      } catch { setMsg("Failed to save"); }
    });
  }

  async function handleDeleteTool(category: string) {
    if (!confirm(`Delete ${category}?`)) return;
    startTransition(async () => {
      try {
        await deleteToolGroup(category);
        onUpdate(tools.filter((g) => g.category !== category));
      } catch { alert("Failed to delete"); }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>{tools.length} categories</span>
        <div className="flex items-center gap-4">
          {msg && <span className="lab text-signal" style={{ fontSize: "0.5rem" }}>{msg}</span>}
          <button onClick={() => { setMode("add"); setEditing(null); }} className="border border-signal px-3 py-1 hover:bg-signal transition-colors">
            <span className="lab text-white" style={{ fontSize: "0.52rem" }}>+ Add</span>
          </button>
        </div>
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
        {tools.map((g) => (
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
  );
}
