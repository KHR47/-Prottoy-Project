"use client";

import { FormEvent, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Category, ReportType } from "@/types/report";
import { FolderTree, Plus, Pencil, Trash2, X, CheckCircle, AlertTriangle } from "lucide-react";

const inputClass = "h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

export default function AdminCategoriesPage() {
  const { isReady } = useRequireRole(["admin"]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(""); const [type, setType] = useState<ReportType>("civic"); const [description, setDescription] = useState(""); const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [showModal, setShowModal] = useState(false);

  async function loadCategories() { const r = await api.get("/categories"); setCategories(r.data); }

  useEffect(() => {
    if (!isReady) return;
    let active = true;
    api.get("/categories").then((r) => { if (active) setCategories(r.data); }).catch((e) => setError(getErrorMessage(e, "Could not load categories.")));
    return () => { active = false; };
  }, [isReady]);

  function resetForm() { setName(""); setType("civic"); setDescription(""); setEditingId(null); setShowModal(false); }

  function editCategory(cat: Category) { setEditingId(cat.id); setName(cat.name); setType(cat.type); setDescription(cat.description || ""); setShowModal(true); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    const payload = { name, type, description: description || null };
    try {
      if (editingId) { await api.patch(`/categories/${editingId}`, payload); setMessage("Category updated."); }
      else { await api.post("/categories", payload); setMessage("Category created."); }
      resetForm(); await loadCategories();
    } catch (e: unknown) { setError(getErrorMessage(e, "Could not save category.")); }
  }

  async function deleteCategory(id: number) {
    setError(""); setMessage("");
    try { await api.delete(`/categories/${id}`); setMessage("Category deleted."); await loadCategories(); }
    catch (e: unknown) { setError(getErrorMessage(e, "Could not delete. It may be in use by reports.")); }
  }

  const civicCats = categories.filter((c) => c.type === "civic");
  const crimeCats = categories.filter((c) => c.type === "crime");

  if (!isReady) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-500/40">
              <FolderTree className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">System Configuration</p>
              <h1 className="text-2xl font-black text-white">Category Management</h1>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-sm font-bold text-white transition shadow-lg">
            <Plus className="h-4 w-4" /> New Category
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"><AlertTriangle className="h-4 w-4" />{error}</div>}
        {message && <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"><CheckCircle className="h-4 w-4" />{message}</div>}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Civic */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-400 ring-1 ring-teal-500/30">CIVIC</span>
              <span className="text-sm text-slate-500">{civicCats.length} categories</span>
            </div>
            <div className="space-y-3">
              {civicCats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-600">No civic categories yet.</div>
              ) : civicCats.map((cat) => (
                <div key={cat.id} className="group flex items-start justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 hover:border-teal-500/30 transition">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-200">{cat.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{cat.description || "No description"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => editCategory(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crime */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 ring-1 ring-rose-500/30">CRIME</span>
              <span className="text-sm text-slate-500">{crimeCats.length} categories</span>
            </div>
            <div className="space-y-3">
              {crimeCats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-600">No crime categories yet.</div>
              ) : crimeCats.map((cat) => (
                <div key={cat.id} className="group flex items-start justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 hover:border-rose-500/30 transition">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-200">{cat.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{cat.description || "No description"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => editCategory(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4 bg-slate-900/50">
              <h2 className="text-xl font-black text-white">{editingId ? "Edit Category" : "Create Category"}</h2>
              <button onClick={resetForm} className="rounded-lg p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Category Name</label>
                <input className={inputClass} placeholder="e.g. Road Damage" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Type</label>
                <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as ReportType)}>
                  <option value="civic">Civic</option><option value="crime">Crime</option>
                </select>
              </div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Description</label>
                <input className={inputClass} placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-200">Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-6 py-2.5 text-sm font-bold text-white transition">
                  <CheckCircle className="h-4 w-4" /> {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
