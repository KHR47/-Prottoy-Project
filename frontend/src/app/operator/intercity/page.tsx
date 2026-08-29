"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TransportOperatorNavbar } from "@/components/layout/TransportOperatorNavbar";
import { api } from "@/lib/api";
import {
  Navigation, Plus, Pencil, Trash2, X, CheckCircle,
  Loader2, MapPin, Clock, Zap, Wind,
} from "lucide-react";
import toast from "react-hot-toast";

const inputClass = "h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
const selectClass = "h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 outline-none focus:border-emerald-500";

const DIVISIONS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];

const TYPE_BADGE: Record<string, string> = {
  ac:       "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "non-ac": "bg-slate-500/20 text-slate-300 border-slate-600/30",
};

const EMPTY_FORM = {
  operator: "", from: "", to: "", division: "Dhaka", type: "ac",
  distance: "", durationMin: "", faresSingle: "", faresAC: "",
  hours: "", color: "#059669", viaRaw: "", stopsRaw: "",
};

export default function OperatorIntercityPage() {
  const [routes, setRoutes]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<any>(null);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [search, setSearch]     = useState("");
  const [divFilter, setDivFilter] = useState("All");

  const load = () =>
    api.get("/transport/intercity")
      .then((r) => setRoutes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      operator:    r.operator ?? "",
      from:        r.from ?? "",
      to:          r.to ?? "",
      division:    r.division ?? "Dhaka",
      type:        r.type ?? "ac",
      distance:    r.distance ?? "",
      durationMin: r.durationMin ?? "",
      faresSingle: r.fare?.single ?? "",
      faresAC:     r.fare?.ac ?? "",
      hours:       r.hours ?? "",
      color:       r.color ?? "#059669",
      viaRaw:      r.via?.join(", ") ?? "",
      stopsRaw:    r.stops?.join(", ") ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      operator: form.operator,
      from: form.from,
      to: form.to,
      division: form.division,
      type: form.type,
      distance: +form.distance,
      durationMin: +form.durationMin,
      fare: { single: +form.faresSingle, ac: form.faresAC ? +form.faresAC : null },
      hours: form.hours,
      color: form.color,
      via:   form.viaRaw.split(",").map((s) => s.trim()).filter(Boolean),
      stops: form.stopsRaw.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await api.patch(`/transport/intercity/${editing.id}`, payload);
        toast.success("Intercity route updated.");
      } else {
        await api.post("/transport/intercity", payload);
        toast.success("Intercity route created.");
      }
      setShowModal(false);
      load();
    } catch {
      toast.error("Could not save route.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this intercity route?")) return;
    try {
      await api.delete(`/transport/intercity/${id}`);
      toast.success("Route deleted.");
      load();
    } catch { toast.error("Could not delete."); }
  };

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.operator?.toLowerCase().includes(q) ||
      r.from?.toLowerCase().includes(q) ||
      r.to?.toLowerCase().includes(q);
    const matchDiv = divFilter === "All" || r.division === divFilter;
    return matchSearch && matchDiv;
  });

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <TransportOperatorNavbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/40">
                <Navigation className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Operator Control</p>
                <h1 className="text-2xl font-black text-white">
                  Intercity Route Management
                  {!loading && <span className="ml-2 text-sm font-bold text-slate-500">({filtered.length} of {routes.length})</span>}
                </h1>
              </div>
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition shadow-lg shadow-emerald-500/20">
              <Plus className="h-4 w-4" /> New Intercity Route
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operator, city…"
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500 w-56"
            />
            <div className="flex flex-wrap gap-2">
              {["All", ...DIVISIONS].map((d) => (
                <button key={d} onClick={() => setDivFilter(d)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                    divFilter === d
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((route) => (
              <div key={route.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 hover:border-slate-600 transition-all">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: route.color }}>
                      <Navigation className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-slate-500">{route.id}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_BADGE[route.type] ?? TYPE_BADGE["non-ac"]}`}>
                          {route.type === "ac" ? <Zap className="h-2.5 w-2.5" /> : <Wind className="h-2.5 w-2.5" />}
                          {route.type?.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 border border-slate-700 rounded-full px-2 py-0.5">{route.division}</span>
                      </div>
                      <h2 className="font-black text-slate-100 text-sm">{route.operator}</h2>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(route)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(route.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-bold text-slate-200">{route.from}</span>
                  <div className="flex-1 border-t border-dashed border-slate-600" />
                  <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="font-bold text-emerald-300">{route.to}</span>
                </div>

                {/* Via stops */}
                {route.via?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-[10px] text-slate-600 font-bold uppercase">via</span>
                    {route.via.map((v: string) => (
                      <span key={v} className="rounded bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-400">{v}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{Math.round(route.durationMin / 60)}h {route.durationMin % 60}m</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {route.distance} km</span>
                  <span className="ml-auto font-bold text-emerald-400">
                    ৳{route.fare?.single}
                    {route.fare?.ac && <span className="text-sky-400 ml-2">AC ৳{route.fare.ac}</span>}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <Navigation className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="font-bold text-lg">No routes found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new route.</p>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl my-4">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4 bg-slate-900/50">
              <h2 className="text-xl font-black text-white">{editing ? "Edit Intercity Route" : "New Intercity Route"}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid gap-4 sm:grid-cols-2">
              {/* Operator */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Operator / Bus Name</label>
                <input className={inputClass} placeholder="e.g. Green Line Paribahan" value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} required />
              </div>
              {/* From / To */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">From</label>
                <input className={inputClass} placeholder="Origin city" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">To</label>
                <input className={inputClass} placeholder="Destination city" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required />
              </div>
              {/* Division / Type */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Division</label>
                <select className={selectClass} value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })}>
                  {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Bus Type</label>
                <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="ac">AC / Deluxe</option>
                  <option value="non-ac">Non-AC</option>
                </select>
              </div>
              {/* Distance / Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Distance (km)</label>
                <input type="number" min={0} className={inputClass} placeholder="e.g. 263" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Duration (min)</label>
                <input type="number" min={0} className={inputClass} placeholder="e.g. 330" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} required />
              </div>
              {/* Fares */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Single Fare (৳)</label>
                <input type="number" min={0} className={inputClass} placeholder="e.g. 600" value={form.faresSingle} onChange={(e) => setForm({ ...form, faresSingle: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">AC Fare (৳) — optional</label>
                <input type="number" min={0} className={inputClass} placeholder="e.g. 900" value={form.faresAC} onChange={(e) => setForm({ ...form, faresAC: e.target.value })} />
              </div>
              {/* Hours */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Operating Hours</label>
                <input className={inputClass} placeholder="e.g. 6:00 AM – 11:00 PM" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
              </div>
              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Route Color</label>
                <input type="color" className="h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-2 cursor-pointer" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
              {/* Via */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Via (comma-separated)</label>
                <input className={inputClass} placeholder="e.g. Comilla, Feni" value={form.viaRaw} onChange={(e) => setForm({ ...form, viaRaw: e.target.value })} />
              </div>
              {/* Stops */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">All Stops (comma-separated)</label>
                <textarea className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 resize-none" rows={3} placeholder="Dhaka (Sayedabad), Comilla, Feni, Chattogram" value={form.stopsRaw} onChange={(e) => setForm({ ...form, stopsRaw: e.target.value })} required />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-200">Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white transition">
                  <CheckCircle className="h-4 w-4" /> {editing ? "Update Route" : "Create Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
