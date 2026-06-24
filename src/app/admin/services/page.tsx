"use client";

import { useState, useEffect, useTransition } from "react";
import { addService, updateService, deleteService } from "@/app/admin/actions";
import type { Service, ServiceCategory } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DEFAULT_CATEGORIES: ServiceCategory[] = ["3D", "Animation", "Graphic Design", "Illustration"];
const EMPTY: Service = { category: "3D" as ServiceCategory, description: "", items: [] };

function ServiceForm({ initial, onSave, onCancel, isNew, existingCategories }: {
  initial: Service;
  onSave: (s: Service) => void;
  onCancel: () => void;
  isNew: boolean;
  existingCategories: string[];
}) {
  const [form, setForm] = useState<Service>(initial);
  const [itemsStr, setItemsStr] = useState(initial.items.join(", "));
  const [isDirty, setIsDirty] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(isNew);

  const set = (k: keyof Service) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setIsDirty(true);
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("service-submit")?.click();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleCancel() {
    if (isDirty && !confirm("You have unsaved changes. Discard them?")) return;
    onCancel();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category.trim()) {
      alert("Please enter a category name");
      return;
    }
    onSave({
      ...form,
      category: form.category.trim() as ServiceCategory,
      items: itemsStr.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  const inputCls = "w-full bg-dim border-b border-rule px-3 py-2 lab text-white placeholder:text-white/30 focus:outline-none focus:border-signal transition-colors";
  const selectCls = "w-full bg-dim border border-rule px-3 py-2 lab text-white focus:outline-none focus:border-signal transition-colors";
  const labelCls = "lab text-white/30 block mb-1";
  const fs = { fontSize: "0.6rem" };

  return (
    <form onSubmit={submit} className="border border-signal p-6">
      <h2 className="dis text-white mb-6" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 0.9 }}>
        {isNew ? "Add Service Category" : `Edit — ${initial.category}`}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelCls} style={fs}>Category *</label>
          <div className="flex gap-2">
            <select
              required
              value={showNewCategory ? "" : form.category}
              onChange={(e) => {
                setIsDirty(true);
                if (e.target.value === "__new__") {
                  setShowNewCategory(true);
                  setForm(prev => ({ ...prev, category: "3D" as ServiceCategory }));
                } else {
                  setShowNewCategory(false);
                  setForm((prev) => ({ ...prev, category: e.target.value as ServiceCategory }));
                }
              }}
              className={selectCls}
              style={fs}
            >
              <option value="">Select category...</option>
              {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__new__">+ Add new category</option>
            </select>
          </div>
          {showNewCategory && (
            <input
              type="text"
              value={form.category}
              onChange={(e) => { setIsDirty(true); setForm((prev) => ({ ...prev, category: e.target.value as ServiceCategory })); }}
              className={`${inputCls} mt-2`}
              style={fs}
              placeholder="Enter new category name"
              autoFocus
            />
          )}
          {!isNew && !showNewCategory && existingCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setShowNewCategory(true)}
              className="lab text-signal hover:text-white transition-colors mt-2"
              style={{ fontSize: "0.5rem" }}
            >
              + Rename to new category
            </button>
          )}
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Description *</label>
          <textarea
            rows={3}
            required
            value={form.description}
            onChange={set("description")}
            className={inputCls}
            style={{ ...fs, resize: "none" }}
            placeholder="Describe this service category"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={fs}>Services (comma separated)</label>
          <textarea
            rows={3}
            value={itemsStr}
            onChange={(e) => setItemsStr(e.target.value)}
            className={inputCls}
            style={{ ...fs, resize: "none" }}
            placeholder="Archviz Interior, Product Render, 3D Concept..."
          />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="submit" id="service-submit" className="group inline-flex items-center gap-4 border border-signal px-5 py-3 hover:bg-signal transition-colors">
          <span className="lab text-white group-hover:text-black transition-colors" style={fs}>Save service</span>
        </button>
        <button type="button" onClick={handleCancel} className="lab text-white/30 hover:text-white transition-colors" style={fs}>Cancel</button>
        <span className="lab text-white/20 ml-auto" style={{ fontSize: "0.5rem" }}>Ctrl+S to save</span>
      </div>
    </form>
  );
}

export default function AdminServices() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Service | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/services").then((r) => r.json()).then((d) => { setServices(d); setLoaded(true); });
  }, []);

  function notify(text: string) { setMsg(text); setTimeout(() => setMsg(""), 3000); }

  async function handleSave(service: Service) {
    startTransition(async () => {
      const result = mode === "edit" && editing
        ? await updateService(editing.category, service)
        : await addService(service);
      if (result.ok) {
        notify(mode === "add" ? "Service added!" : "Service updated!");
        setMode("list");
        setEditing(null);
        setTimeout(() => window.location.reload(), 500);
      } else {
        notify(`Error: ${result.error}`);
      }
    });
  }

  async function handleDelete(category: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteService(category);
      setServices((prev) => prev.filter((s) => s.category !== category));
      notify("Service deleted.");
    });
  }

  if (!loaded) return <div className="p-6"><span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>Loading…</span></div>;

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-5 border-b border-rule pb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>FAC.ADM — Services</span>
          <h1 className="dis text-white mt-1" style={{ fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 0.88 }}>Services</h1>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>{msg}</span>}
          <Link href="/services" target="_blank" className="lab text-white/30 hover:text-signal transition-colors" style={{ fontSize: "0.52rem" }}>
            View live ↗
          </Link>
          <button
            onClick={() => { setMode("add"); setEditing(null); }}
            className="group inline-flex items-center gap-3 border border-signal px-4 py-2 hover:bg-signal transition-colors"
          >
            <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.58rem" }}>+ Add Category</span>
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {(mode === "add" || mode === "edit") && (
        <div className="mb-6">
          <ServiceForm
            initial={mode === "edit" && editing ? editing : EMPTY}
            onSave={handleSave}
            onCancel={() => { setMode("list"); setEditing(null); }}
            isNew={mode === "add"}
            existingCategories={services.map(s => s.category)}
          />
        </div>
      )}

      {/* List */}
      {mode === "list" && (
        <>
          <div className="flex items-center mb-4">
            <span className="lab text-white/25" style={{ fontSize: "0.5rem" }}>{services.length} categories</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.category} className="border border-rule hover:border-signal/50 transition-colors p-5">
                <div className="flex items-baseline gap-3 mb-3">
                  <h2 className="dis text-white" style={{ fontSize: "clamp(1.2rem, 3vw, 2.2rem)", lineHeight: 0.9 }}>{s.category}</h2>
                </div>
                <p className="text-sm text-white/40 leading-relaxed mb-4">{s.description}</p>
                <div className="flex flex-col gap-2">
                  {s.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="h-px w-3 bg-signal/40 shrink-0" />
                      <span className="lab text-white/50" style={{ fontSize: "0.55rem" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-rule flex items-center gap-3">
                  <button
                    onClick={() => { setEditing(s); setMode("edit"); }}
                    className="lab text-white/30 hover:text-signal transition-colors"
                    style={{ fontSize: "0.52rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.category, s.category)}
                    disabled={isPending}
                    className="lab text-white/20 hover:text-red-400 transition-colors"
                    style={{ fontSize: "0.52rem" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
