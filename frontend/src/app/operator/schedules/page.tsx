"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TransportOperatorNavbar } from "@/components/layout/TransportOperatorNavbar";
import { api } from "@/lib/api";
import {
  Activity, Bus, Navigation, Plus, Pencil, Trash2, X,
  CheckCircle, Loader2, Clock,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Styles ────────────────────────────────────────────────────────────────
const iClass = "h-10 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition";
const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_COLOR: Record<string, string> = {
  Mon: "bg-sky-600", Tue: "bg-violet-600", Wed: "bg-emerald-600",
  Thu: "bg-amber-600", Fri: "bg-rose-600", Sat: "bg-teal-600", Sun: "bg-orange-600",
};

const EMPTY = {
  category: "city", routeId: "", vehicleId: "",
  departureTime: "06:00", arrivalTime: "07:00", days: [] as string[],
};

// ── ScheduleTable ─────────────────────────────────────────────────────────
function ScheduleTable({
  schedules, routes, vehicles, onEdit, onDelete,
}: {
  schedules: any[]; routes: any[]; vehicles: any[];
  onEdit: (s: any) => void; onDelete: (id: string) => void;
}) {
  if (!schedules.length)
    return <p className="py-8 text-center text-sm text-slate-500 italic">No schedules in this section. Add one above.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[740px] text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-900/40">
            {["Route", "Bus / Vehicle", "Departs", "Arrives", "Operating Days", "Status", ""].map((h) => (
              <th key={h + Math.random()} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {schedules.map((s) => {
            const route   = routes.find((r) => r.id === s.routeId);
            const vehicle = vehicles.find((v) => v.id === s.vehicleId);
            return (
              <tr key={s.id} className="hover:bg-slate-700/20 transition-colors group">
                {/* Route */}
                <td className="px-5 py-3.5">
                  {route ? (
                    <div>
                      <span className="text-[11px] font-black rounded-full px-2 py-0.5 whitespace-nowrap"
                        style={{ backgroundColor: (route.color ?? "#0ea5e9") + "25", color: route.color ?? "#0ea5e9" }}>
                        {route.id}
                      </span>
                      <p className="text-xs text-slate-300 mt-0.5 font-bold truncate max-w-[160px]">{route.operator ?? route.name}</p>
                      <p className="text-[10px] text-slate-600 truncate max-w-[160px]">{route.from} → {route.to}</p>
                    </div>
                  ) : <span className="font-mono text-xs text-slate-500">{s.routeId}</span>}
                </td>
                {/* Vehicle */}
                <td className="px-5 py-3.5">
                  {vehicle ? (
                    <div>
                      <p className="font-bold text-slate-200 text-xs whitespace-nowrap">{vehicle.busName}</p>
                      <p className="text-[10px] text-slate-600 font-mono">{vehicle.id}</p>
                    </div>
                  ) : <span className="text-xs italic text-slate-600">{s.vehicleId || "Unassigned"}</span>}
                </td>
                {/* Departs */}
                <td className="px-5 py-3.5">
                  <span className="font-mono text-base font-black text-amber-400">{s.departureTime}</span>
                </td>
                {/* Arrives */}
                <td className="px-5 py-3.5">
                  <span className="font-mono text-base font-black text-slate-300">{s.arrivalTime}</span>
                </td>
                {/* Days */}
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {DAYS.map((d) => (
                      <span key={d} className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${s.days?.includes(d) ? `${DAY_COLOR[d]} text-white` : "bg-slate-800 text-slate-600"}`}>{d}</span>
                    ))}
                  </div>
                </td>
                {/* Status */}
                <td className="px-5 py-3.5">
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold capitalize">
                    {s.status}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(s)}
                      className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-600 transition">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => onDelete(s.id)}
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
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [cityRoutes, setCityRoutes] = useState<any[]>([]);
  const [icRoutes, setIcRoutes]   = useState<any[]>([]);
  const [vehicles, setVehicles]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<any>(null);   // null = create, object = edit
  const [form, setForm]           = useState({ ...EMPTY });

  const load = () =>
    Promise.all([
      api.get("/transport/schedules"),
      api.get("/transport/routes"),
      api.get("/transport/intercity"),
      api.get("/transport/vehicles"),
    ]).then(([s, cr, ir, v]) => {
      setSchedules(s.data); setCityRoutes(cr.data); setIcRoutes(ir.data); setVehicles(v.data);
    }).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const citySchedules = schedules.filter((s) => s.category === "city"      || s.routeId?.startsWith("RT-"));
  const icSchedules   = schedules.filter((s) => s.category === "intercity" || s.routeId?.startsWith("IC-"));
  const allRoutes     = [...cityRoutes, ...icRoutes];
  const routeOptions  = form.category === "city" ? cityRoutes : icRoutes;
  const vehicleOptions = vehicles.filter((v) => (v.category ?? "city") === form.category);

  const toggleDay = (d: string) =>
    setForm((f) => ({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d] }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    const cat = s.category ?? (s.routeId?.startsWith("IC-") ? "intercity" : "city");
    setForm({
      category:      cat,
      routeId:       s.routeId ?? "",
      vehicleId:     s.vehicleId ?? "",
      departureTime: s.departureTime ?? "06:00",
      arrivalTime:   s.arrivalTime ?? "07:00",
      days:          s.days ?? [],
    });
    setModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.days.length) return toast.error("Select at least one operating day.");
    try {
      if (editing) {
        await api.patch(`/transport/schedules/${editing.id}`, form);
        toast.success("Schedule updated.");
      } else {
        await api.post("/transport/schedules", form);
        toast.success("Schedule created.");
      }
      setModal(false); load();
    } catch { toast.error("Could not save schedule."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    try { await api.delete(`/transport/schedules/${id}`); toast.success("Deleted."); load(); }
    catch { toast.error("Could not delete."); }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <TransportOperatorNavbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-500/40">
              <Activity className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Timetable</p>
              <h1 className="text-2xl font-black text-white">
                Schedule Management
                {!loading && <span className="ml-2 text-sm font-semibold text-slate-500">({schedules.length} total)</span>}
              </h1>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-colors">
            <Plus className="h-4 w-4" /> Add Schedule
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
        ) : (
          <>
            {/* City Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 ring-1 ring-sky-500/30">
                  <Bus className="h-4 w-4 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">City Schedules</h2>
                  <p className="text-xs text-slate-500">Dhaka urban bus timetables</p>
                </div>
                <span className="ml-auto text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-3 py-1">
                  {citySchedules.length} schedules
                </span>
              </div>
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                <ScheduleTable schedules={citySchedules} routes={cityRoutes} vehicles={vehicles} onEdit={openEdit} onDelete={handleDelete} />
              </div>
            </section>

            {/* Intercity Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-500/30">
                  <Navigation className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Intercity Schedules</h2>
                  <p className="text-xs text-slate-500">National routes across 8 divisions</p>
                </div>
                <span className="ml-auto text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
                  {icSchedules.length} schedules
                </span>
              </div>
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                <ScheduleTable schedules={icSchedules} routes={icRoutes} vehicles={vehicles} onEdit={openEdit} onDelete={handleDelete} />
              </div>
            </section>
          </>
        )}
      </main>

      {/* Modal — Create & Edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl my-6">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4 bg-slate-900/60 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{editing ? "Edit Schedule" : "Create Schedule"}</h2>
                  {editing && <p className="text-[10px] text-slate-500 font-mono">{editing.id}</p>}
                </div>
              </div>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Category toggle — only shown when creating */}
              {!editing && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Schedule Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[["city", "🚌  City (Dhaka)"], ["intercity", "🧭  Intercity"]].map(([v, l]) => (
                      <button key={v} type="button"
                        onClick={() => setForm({ ...form, category: v, routeId: "", vehicleId: "" })}
                        className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                          form.category === v
                            ? v === "city" ? "bg-sky-600 border-sky-500 text-white" : "bg-violet-600 border-violet-500 text-white"
                            : "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                        }`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Route */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Route <span className="normal-case font-normal text-slate-600 lowercase">— {form.category} routes</span>
                </label>
                <select className={iClass} value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} required>
                  <option value="">Select route…</option>
                  {routeOptions.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.id} — {r.operator ?? r.name} ({r.from} → {r.to})</option>
                  ))}
                </select>
              </div>

              {/* Vehicle */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Bus / Vehicle <span className="normal-case font-normal text-slate-600 lowercase">— {form.category} fleet</span>
                </label>
                <select className={iClass} value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">No vehicle assigned</option>
                  {vehicleOptions.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.id} — {v.busName} ({v.registration})</option>
                  ))}
                </select>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Departure</label>
                  <input type="time" className={iClass} value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Arrival</label>
                  <input type="time" className={iClass} value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} required />
                </div>
              </div>

              {/* Days */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Operating Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button type="button" key={d} onClick={() => toggleDay(d)}
                      className={`rounded-xl w-12 py-2 text-xs font-bold transition ${
                        form.days.includes(d)
                          ? `${DAY_COLOR[d]} text-white shadow`
                          : "border border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
                {form.days.length > 0 && (
                  <p className="text-[10px] text-slate-500 mt-1.5">{form.days.length} day{form.days.length > 1 ? "s" : ""} selected</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700/50">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-colors">
                  <CheckCircle className="h-4 w-4" />
                  {editing ? "Save Changes" : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
