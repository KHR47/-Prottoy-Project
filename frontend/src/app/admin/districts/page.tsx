"use client";

import { FormEvent, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { MapPin, Plus, Pencil, Trash2, X, CheckCircle, AlertTriangle, Search } from "lucide-react";

type District = { id: number; name: string; division?: { id: number; name: string } };
type Division = { id: number; name: string };

const inputClass = "h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/20";

export default function AdminDistrictsPage() {
  const { isReady } = useRequireRole(["admin"]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [name, setName] = useState(""); const [divisionId, setDivisionId] = useState(""); const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  async function loadData() {
    const [d, v] = await Promise.all([api.get("/locations/districts"), api.get("/locations/divisions")]);
    setDistricts(d.data); setDivisions(v.data);
  }

  useEffect(() => {
    if (!isReady) return;
    let active = true;
    Promise.all([api.get("/locations/districts"), api.get("/locations/divisions")])
      .then(([d, v]) => { if (active) { setDistricts(d.data); setDivisions(v.data); } })
      .catch((e) => setError(getErrorMessage(e, "Could not load data.")));
    return () => { active = false; };
  }, [isReady]);

  function resetForm() { setName(""); setDivisionId(""); setEditingId(null); setShowModal(false); }

  function editDistrict(d: District) { setEditingId(d.id); setName(d.name); setDivisionId(d.division ? String(d.division.id) : ""); setShowModal(true); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const payload = { name, divisionId: divisionId ? Number(divisionId) : undefined };
      if (editingId) { await api.patch(`/locations/districts/${editingId}`, payload); setMessage("District updated."); }
      else { await api.post("/locations/districts", payload); setMessage("District created."); }
      resetForm(); await loadData();
    } catch (e: unknown) { setError(getErrorMessage(e, "Could not save district.")); }
  }

  async function deleteDistrict(id: number) {
    if (!window.confirm("Delete this district? This cannot be undone.")) return;
    setError(""); setMessage("");
    try { await api.delete(`/locations/districts/${id}`); setMessage("District deleted."); await loadData(); }
    catch (e: unknown) { setError(getErrorMessage(e, "Could not delete. It may be in use.")); }
  }

  const filtered = districts.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q);
    const matchDiv = divisionFilter === "all" || (d.division && String(d.division.id) === divisionFilter);
    return matchSearch && matchDiv;
  });

  if (!isReady) return null;

  return (
    <div className="min-h-screen transition-colors" style={{ background: 'var(--bg-background)' }}>
      <Navbar />

      <div className="border-b transition-colors" style={{ background: "var(--bg-surface)", borderColor: "var(--border-strong)" }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/10 ring-1 ring-rose-200 dark:ring-rose-500/20">
              <MapPin className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Location Data</p>
              <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>District Management</h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{districts.length} districts across {divisions.length} divisions</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition shadow-lg shrink-0">
            <Plus className="h-4 w-4" /> Add District
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400"><AlertTriangle className="h-4 w-4" />{error}</div>}
        {message && <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle className="h-4 w-4" />{message}</div>}

        {/* Division Filters */}
        <div className="mb-5 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setDivisionFilter("all")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition border ${divisionFilter === "all" ? "bg-rose-600 text-white border-rose-600" : "hover:opacity-80"}`}
              style={{ borderColor: divisionFilter === "all" ? undefined : "var(--border-strong)", background: divisionFilter === "all" ? undefined : "var(--bg-elevated)", color: divisionFilter === "all" ? undefined : "var(--text-secondary)" }}>
              All Divisions <span className="ml-1 text-xs opacity-70">{districts.length}</span>
            </button>
            {divisions.map((div) => (
              <button key={div.id} onClick={() => setDivisionFilter(String(div.id))}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition border ${divisionFilter === String(div.id) ? "bg-rose-600 text-white border-rose-600" : "hover:opacity-80"}`}
                style={{ borderColor: divisionFilter === String(div.id) ? undefined : "var(--border-strong)", background: divisionFilter === String(div.id) ? undefined : "var(--bg-elevated)", color: divisionFilter === String(div.id) ? undefined : "var(--text-secondary)" }}>
                {div.name}
                <span className="ml-1 text-xs opacity-70">{districts.filter((d) => d.division?.id === div.id).length}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search district..."
              className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-rose-500"
              style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }} />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: "var(--border-strong)", background: "var(--bg-elevated)" }}>
          <div className="px-6 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{filtered.length} districts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b" style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)" }}>
                <tr>
                  {["#", "District Name", "Division", "Actions"].map((h) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`} style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-strong)" }}>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-12 text-center" style={{ color: "var(--text-muted)" }}>No districts found.</td></tr>
                ) : filtered.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>#{d.id}</td>
                    <td className="px-5 py-4 font-bold" style={{ color: "var(--text-primary)" }}>{d.name}</td>
                    <td className="px-5 py-4">
                      {d.division ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: "var(--border-strong)", color: "var(--text-primary)" }}>{d.division.name}</span>
                      ) : <span className="italic" style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => editDistrict(d)} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
                          style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface)", color: "var(--text-primary)" }}>
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => deleteDistrict(d.id)} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:opacity-80">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}>
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)" }}>
              <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{editingId ? "Edit District" : "Add New District"}</h2>
              <button onClick={resetForm} className="rounded-lg p-2 transition hover:opacity-70" style={{ color: "var(--text-muted)" }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>District Name</label>
                <input className={inputClass} placeholder="e.g. Dhaka" value={name} onChange={(e) => setName(e.target.value)} required 
                  style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Division</label>
                <select className={inputClass} value={divisionId} onChange={(e) => setDivisionId(e.target.value)} required
                  style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
                  <option value="">Select Division...</option>
                  {divisions.map((div) => <option key={div.id} value={div.id}>{div.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--border-strong)" }}>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-bold transition hover:opacity-80" style={{ color: "var(--text-secondary)" }}>Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-sm font-bold text-white transition">
                  <CheckCircle className="h-4 w-4" /> {editingId ? "Update" : "Add District"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
