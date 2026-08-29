"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TransportOperatorNavbar } from "@/components/layout/TransportOperatorNavbar";
import { api } from "@/lib/api";
import { AlertTriangle, Plus, CheckCircle, X, Loader2, Wrench, Clock, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const inputClass = "h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-rose-500";
const severityColors: Record<string, string> = { low: "bg-slate-600/40 text-slate-400", medium: "bg-amber-500/20 text-amber-400", high: "bg-rose-500/20 text-rose-400" };

export default function OperatorDisruptionsPage() {
  const [disruptions, setDisruptions] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ routeId: "", type: "delay", severity: "medium", title: "", description: "" });

  const load = () => Promise.all([api.get("/transport/disruptions"), api.get("/transport/routes")]).then(([d, r]) => { setDisruptions(d.data); setRoutes(r.data); }).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post("/transport/disruptions", form); toast.success("Disruption alert created."); setShowModal(false); load(); }
    catch { toast.error("Could not create alert."); }
  };

  const handleResolve = async (id: string) => {
    try { await api.patch(`/transport/disruptions/${id}/resolve`); toast.success("Marked as resolved."); load(); }
    catch { toast.error("Could not resolve."); }
  };

  const active = disruptions.filter((d) => d.status === "active");
  const resolved = disruptions.filter((d) => d.status === "resolved");

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <TransportOperatorNavbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 ring-1 ring-rose-500/40"><AlertTriangle className="h-6 w-6 text-rose-400" /></div>
            <div><p className="text-xs font-bold uppercase tracking-widest text-rose-400">Service Control</p><h1 className="text-2xl font-black text-white">Disruption Management</h1></div>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition"><RefreshCw className="h-4 w-4" /></button>
            <button onClick={() => { setForm({ routeId: "", type: "delay", severity: "medium", title: "", description: "" }); setShowModal(true); }}
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition"><Plus className="h-4 w-4" /> Add Alert</button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center"><p className="text-xs text-rose-400/70 font-bold uppercase">Active</p><p className="text-3xl font-black text-rose-400 mt-1">{active.length}</p></div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center"><p className="text-xs text-emerald-400/70 font-bold uppercase">Resolved</p><p className="text-3xl font-black text-emerald-400 mt-1">{resolved.length}</p></div>
        </div>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-rose-500" /></div> : (
          <div className="space-y-8">
            {/* Active */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-4 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse inline-block" /> Active Disruptions</h2>
              {active.length === 0 ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
                  <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
                  <p className="font-bold text-emerald-400">All services running normally</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {active.map((d) => {
                    const route = routes.find((r) => r.id === d.routeId);
                    return (
                      <div key={d.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700">{d.type === "breakdown" ? <Wrench className="h-5 w-5 text-amber-400" /> : <Clock className="h-5 w-5 text-rose-400" />}</div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black uppercase ${severityColors[d.severity]}`}>{d.severity}</span>
                                <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-300 capitalize">{d.type}</span>
                                {route && <span className="text-xs font-bold" style={{ color: route.color }}>{route.id}</span>}
                              </div>
                              <h3 className="font-black text-white">{d.title}</h3>
                              <p className="text-sm text-slate-400 mt-1">{d.description}</p>
                              <p className="text-xs text-slate-600 mt-2">{new Date(d.reportedAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <button onClick={() => handleResolve(d.id)} className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition shrink-0">
                            <CheckCircle className="h-4 w-4" /> Resolve
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Resolved history */}
            {resolved.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Resolved History</h2>
                <div className="space-y-2">
                  {resolved.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-800/30 px-5 py-3.5">
                      <div><p className="font-bold text-slate-400 text-sm">{d.title}</p><p className="text-xs text-slate-600">{d.routeId} · {d.type}</p></div>
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-xs font-bold">Resolved</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4 bg-slate-900/50">
              <h2 className="text-xl font-black text-white">Add Disruption Alert</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Affected Route</label>
                <select className={inputClass} value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} required>
                  <option value="">Select route...</option>
                  {routes.map((r) => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Type</label>
                  <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="delay">Delay</option><option value="breakdown">Breakdown</option><option value="disruption">Disruption</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Severity</label>
                  <select className={inputClass} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Title</label><input className={inputClass} placeholder="Brief title..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Description</label><textarea className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-rose-500 resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-400">Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-sm font-bold text-white transition"><AlertTriangle className="h-4 w-4" /> Publish Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
