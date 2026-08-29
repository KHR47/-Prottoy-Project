"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TransportOperatorNavbar } from "@/components/layout/TransportOperatorNavbar";
import { api } from "@/lib/api";
import {
  Bus, Navigation, Plus, Pencil, Trash2, X,
  CheckCircle, Loader2, Search, Radio, Wrench, CircleDot,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Helpers ────────────────────────────────────────────────────────────────
const iClass = "h-10 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition";
const sClass = "h-10 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition";

const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  on_route:    { label: "On Route",    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  depot:       { label: "In Depot",    cls: "bg-slate-600/40   text-slate-400   border-slate-600/30",   dot: "bg-slate-500"  },
  maintenance: { label: "Maintenance", cls: "bg-amber-500/15   text-amber-400   border-amber-500/30",   dot: "bg-amber-400"  },
};
const CAT: Record<string, { label: string; cls: string }> = {
  city:       { label: "City",       cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  intercity:  { label: "Intercity",  cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
};

const EMPTY = {
  category: "city", busName: "", type: "bus",
  registration: "", routeId: "", capacity: "44",
  driver: "", status: "depot",
};

// ── Page ───────────────────────────────────────────────────────────────────
export default function VehiclesPage() {
  const [vehicles, setVehicles]   = useState<any[]>([]);
  const [cityR, setCityR]         = useState<any[]>([]);
  const [icR, setIcR]             = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<any>(null);
  const [form, setForm]           = useState({ ...EMPTY });
  const [search, setSearch]       = useState("");
  const [cat, setCat]             = useState("all");
  const [status, setStatus]       = useState("all");

  const load = () =>
    Promise.all([
      api.get("/transport/vehicles"),
      api.get("/transport/routes"),
      api.get("/transport/intercity"),
    ]).then(([v, cr, ir]) => {
      setVehicles(v.data); setCityR(cr.data); setIcR(ir.data);
    }).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const allRoutes    = [...cityR, ...icR];
  const findRoute    = (id: string) => allRoutes.find((r) => r.id === id);
  const routeOptions = form.category === "city" ? cityR : icR;

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setModal(true); };
  const openEdit   = (v: any) => {
    setEditing(v);
    setForm({ category: v.category || "city", busName: v.busName || "", type: v.type || "bus", registration: v.registration || "", routeId: v.routeId || "", capacity: String(v.capacity || 44), driver: v.driver || "", status: v.status || "depot" });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, capacity: +form.capacity };
    try {
      if (editing) { await api.patch(`/transport/vehicles/${editing.id}`, body); toast.success("Vehicle updated."); }
      else { await api.post("/transport/vehicles", body); toast.success("Vehicle registered."); }
      setModal(false); load();
    } catch { toast.error("Could not save."); }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this vehicle?")) return;
    try { await api.delete(`/transport/vehicles/${id}`); toast.success("Removed."); load(); }
    catch { toast.error("Could not remove."); }
  };

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      (v.busName?.toLowerCase().includes(q) || v.registration?.toLowerCase().includes(q) || v.driver?.toLowerCase().includes(q) || v.routeId?.toLowerCase().includes(q)) &&
      (cat === "all" || v.category === cat) &&
      (status === "all" || v.status === status)
    );
  });

  const city  = vehicles.filter((v) => v.category === "city");
  const ic    = vehicles.filter((v) => v.category === "intercity");
  const kpis  = [
    { label: "Total Fleet",  value: vehicles.length, color: "text-white",       bg: "bg-slate-700/40" },
    { label: "City Buses",   value: city.length,      color: "text-sky-400",     bg: "bg-sky-500/10" },
    { label: "Intercity",    value: ic.length,         color: "text-violet-400",  bg: "bg-violet-500/10" },
    { label: "On Route",     value: vehicles.filter((v) => v.status === "on_route").length,    color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Maintenance",  value: vehicles.filter((v) => v.status === "maintenance").length, color: "text-amber-400",   bg: "bg-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <TransportOperatorNavbar />

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-7">
          {/* Title row */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 ring-1 ring-sky-500/40">
                <Bus className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Fleet Control</p>
                <h1 className="text-2xl font-black text-white leading-tight">
                  Vehicle Management
                  {!loading && <span className="ml-2 text-sm font-semibold text-slate-500">({filtered.length} / {vehicles.length})</span>}
                </h1>
              </div>
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-colors">
              <Plus className="h-4 w-4" /> Register Vehicle
            </button>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Bus name, registration, driver…"
                className="h-9 w-64 rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500 transition" />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 p-1">
              {[["all","All"], ["city","City"], ["intercity","Intercity"]].map(([v, l]) => (
                <button key={v} onClick={() => setCat(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${cat === v ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                  {l}
                </button>
              ))}
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 p-1">
              {[["all","All Status"],["on_route","On Route"],["depot","Depot"],["maintenance","Maint."]].map(([v, l]) => (
                <button key={v} onClick={() => setStatus(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${status === v ? "bg-slate-600 text-white shadow" : "text-slate-500 hover:text-slate-300"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-7 space-y-5">

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {kpis.map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border border-slate-700/50 ${bg} p-4 text-center`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <p className={`text-3xl font-black ${color} mt-1`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>
        ) : (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-900/50">
                    {["Bus Name", "Registration", "Cat.", "Status", "Route", "Driver", "Cap.", ""].map((h) => (
                      <th key={h + Math.random()} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filtered.map((v) => {
                    const route = findRoute(v.routeId);
                    const st    = STATUS[v.status] ?? STATUS.depot;
                    const ct    = CAT[v.category ?? "city"] ?? CAT.city;
                    return (
                      <tr key={v.id} className="hover:bg-slate-700/25 transition-colors group">
                        {/* Bus Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${v.category === "intercity" ? "bg-violet-500/15" : "bg-sky-500/15"}`}>
                              {v.category === "intercity"
                                ? <Navigation className="h-4 w-4 text-violet-400" />
                                : <Bus className="h-4 w-4 text-sky-400" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-100 whitespace-nowrap leading-tight">{v.busName || "—"}</p>
                              <p className="text-[10px] text-slate-600 font-mono">{v.id}</p>
                            </div>
                          </div>
                        </td>
                        {/* Registration */}
                        <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap font-mono">{v.registration}</td>
                        {/* Category */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap ${ct.cls}`}>{ct.label}</span>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${st.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot} ${v.status === "on_route" ? "animate-pulse" : ""}`} />
                            {st.label}
                          </span>
                        </td>
                        {/* Route */}
                        <td className="px-5 py-3.5">
                          {route ? (
                            <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: (route.color ?? "#0ea5e9") + "22", color: route.color ?? "#0ea5e9" }}>
                              {route.id} — {route.from} → {route.to}
                            </span>
                          ) : <span className="text-xs italic text-slate-600">Unassigned</span>}
                        </td>
                        {/* Driver */}
                        <td className="px-5 py-3.5 text-sm text-slate-300 whitespace-nowrap">
                          {v.driver || <span className="text-xs italic text-slate-600">—</span>}
                        </td>
                        {/* Capacity */}
                        <td className="px-5 py-3.5 text-center text-slate-400 font-bold">{v.capacity}</td>
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(v)}
                              className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-600 transition">
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                            <button onClick={() => remove(v.id)}
                              className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && !loading && (
                <div className="py-16 text-center">
                  <Bus className="mx-auto h-10 w-10 text-slate-700 mb-3" />
                  <p className="font-bold text-slate-500">No vehicles match your filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl my-6">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4 bg-slate-900/60 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20">
                  <Bus className="h-5 w-5 text-sky-400" />
                </div>
                <h2 className="text-lg font-black text-white">{editing ? "Edit Vehicle" : "Register Vehicle"}</h2>
              </div>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
                  <select className={sClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, routeId: "" })}>
                    <option value="city">City Bus (Dhaka)</option>
                    <option value="intercity">Intercity Bus</option>
                  </select>
                </div>
                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Type</label>
                  <select className={sClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="bus">Bus</option>
                    <option value="coach">Coach (AC)</option>
                    <option value="minibus">Minibus</option>
                  </select>
                </div>
              </div>

              {/* Bus Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Bus / Operator Name</label>
                <input className={iClass} placeholder="e.g. Green Line Paribahan" value={form.busName} onChange={(e) => setForm({ ...form, busName: e.target.value })} required />
              </div>

              {/* Registration */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Registration No.</label>
                <input className={iClass} placeholder="e.g. Dhaka Metro GL-021" value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} required />
              </div>

              {/* Route */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Assigned Route <span className="normal-case font-normal text-slate-600 lowercase">— {form.category === "city" ? "city" : "intercity"} routes shown</span>
                </label>
                <select className={sClass} value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
                  <option value="">— No assignment —</option>
                  {routeOptions.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.id} — {r.operator ?? r.name} ({r.from} → {r.to})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Capacity */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Capacity</label>
                  <input type="number" min={1} className={iClass} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
                  <select className={sClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="on_route">On Route</option>
                    <option value="depot">In Depot</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Driver */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Driver Name <span className="normal-case font-normal text-slate-600 lowercase">— optional</span></label>
                <input className={iClass} placeholder="Assigned driver" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700/50">
                <button type="button" onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-colors">
                  <CheckCircle className="h-4 w-4" />
                  {editing ? "Update Vehicle" : "Register Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
