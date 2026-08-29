"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TransportOperatorNavbar } from "@/components/layout/TransportOperatorNavbar";
import { api } from "@/lib/api";
import { Bus, Plus, Pencil, Trash2, X, CheckCircle, Loader2, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";

const inputClass = "h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

export default function OperatorRoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", from: "", to: "", distance: "", durationMin: "", color: "#0ea5e9", faresSingle: "", faresPass: "", stopsRaw: "" });

  const load = () => api.get("/transport/routes").then((r) => setRoutes(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", from: "", to: "", distance: "", durationMin: "", color: "#0ea5e9", faresSingle: "", faresPass: "", stopsRaw: "" }); setShowModal(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ name: r.name, from: r.from, to: r.to, distance: r.distance, durationMin: r.durationMin, color: r.color, faresSingle: r.fare?.single, faresPass: r.fare?.pass, stopsRaw: r.stops?.join(", ") }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, from: form.from, to: form.to, distance: +form.distance, durationMin: +form.durationMin, color: form.color, fare: { single: +form.faresSingle, pass: +form.faresPass }, stops: form.stopsRaw.split(",").map((s) => s.trim()).filter(Boolean) };
    try {
      if (editing) { await api.patch(`/transport/routes/${editing.id}`, payload); toast.success("Route updated."); }
      else { await api.post("/transport/routes", payload); toast.success("Route created."); }
      setShowModal(false); load();
    } catch { toast.error("Could not save route."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this route?")) return;
    try { await api.delete(`/transport/routes/${id}`); toast.success("Route deleted."); load(); }
    catch { toast.error("Could not delete."); }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <TransportOperatorNavbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 ring-1 ring-sky-500/40"><MapPin className="h-6 w-6 text-sky-400" /></div>
            <div><p className="text-xs font-bold uppercase tracking-widest text-sky-400">Operator Control</p><h1 className="text-2xl font-black text-white">Route Management</h1></div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-sm font-bold text-white transition">
            <Plus className="h-4 w-4" /> New Route
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div> : (
          <div className="grid gap-4 md:grid-cols-2">
            {routes.map((route) => (
              <div key={route.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: route.color }}><Bus className="h-5 w-5 text-white" /></div>
                    <div>
                      <p className="font-mono text-xs text-slate-500">{route.id}</p>
                      <h2 className="font-black text-slate-100">{route.name}</h2>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(route)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(route.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm mb-3">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: route.color }} />
                  <span className="text-slate-300">{route.from} → {route.to}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {route.durationMin} min</span>
                  <span>{route.distance} km</span>
                  <span>{route.stops?.length} stops</span>
                  <span className="ml-auto font-bold text-emerald-400">৳{route.fare?.single} single / ৳{route.fare?.pass} pass</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl my-4">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4 bg-slate-900/50">
              <h2 className="text-xl font-black text-white">{editing ? "Edit Route" : "Create Route"}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Route Name</label><input className={inputClass} placeholder="e.g. Mirpur - Motijheel Express" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">From</label><input className={inputClass} placeholder="Origin stop" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">To</label><input className={inputClass} placeholder="Destination stop" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Distance (km)</label><input type="number" min={0} className={inputClass} value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} required /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Duration (min)</label><input type="number" min={0} className={inputClass} value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} required /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Single Fare (৳)</label><input type="number" min={0} className={inputClass} value={form.faresSingle} onChange={(e) => setForm({ ...form, faresSingle: e.target.value })} required /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Pass Fare (৳)</label><input type="number" min={0} className={inputClass} value={form.faresPass} onChange={(e) => setForm({ ...form, faresPass: e.target.value })} required /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Route Color</label><input type="color" className="h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-2 cursor-pointer" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Stops (comma-separated)</label><textarea className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 resize-none" rows={3} placeholder="Stop 1, Stop 2, Stop 3..." value={form.stopsRaw} onChange={(e) => setForm({ ...form, stopsRaw: e.target.value })} required /></div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-200">Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-sm font-bold text-white transition"><CheckCircle className="h-4 w-4" /> {editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
