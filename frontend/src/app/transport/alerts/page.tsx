"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { AlertTriangle, Wifi, Wrench, RefreshCw, Loader2, Clock, Bus } from "lucide-react";

const typeIcons: Record<string, any> = { delay: Clock, breakdown: Wrench, disruption: AlertTriangle };
const severityColors: Record<string, string> = {
  low: "border-slate-600/50 bg-slate-800/40",
  medium: "border-amber-500/30 bg-amber-500/5",
  high: "border-rose-500/30 bg-rose-500/5",
};
const severityBadge: Record<string, string> = {
  low: "bg-slate-600/40 text-slate-400",
  medium: "bg-amber-500/20 text-amber-400",
  high: "bg-rose-500/20 text-rose-400",
};

export default function AlertsPage() {
  const [disruptions, setDisruptions] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/transport/disruptions"), api.get("/transport/routes")])
      .then(([d, r]) => { setDisruptions(d.data); setRoutes(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const active = disruptions.filter((d) => d.status === "active");
  const resolved = disruptions.filter((d) => d.status === "resolved");

  const getRoute = (id: string) => routes.find((r) => r.id === id);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 ring-1 ring-rose-500/40">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-rose-400">Live Service</p>
              <h1 className="text-2xl font-black text-white">Disruptions & Alerts</h1>
            </div>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
            <p className="text-xs text-rose-400/70 font-bold uppercase">Active Alerts</p>
            <p className="text-3xl font-black text-rose-400 mt-1">{active.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
            <p className="text-xs text-emerald-400/70 font-bold uppercase">Resolved</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{resolved.length}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
            <p className="text-3xl font-black text-white mt-1">{disruptions.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-rose-500" /></div>
        ) : (
          <>
            {/* Active */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse inline-block" /> Active Disruptions
              </h2>
              {active.length === 0 ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
                  <Wifi className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
                  <p className="font-bold text-emerald-400">All services running normally</p>
                  <p className="text-sm text-slate-500 mt-1">No active disruptions on any route.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {active.map((d) => {
                    const Icon = typeIcons[d.type] || AlertTriangle;
                    const route = getRoute(d.routeId);
                    return (
                      <div key={d.id} className={`rounded-2xl border p-5 ${severityColors[d.severity]}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                            <Icon className={`h-5 w-5 ${d.severity === "high" ? "text-rose-400" : d.severity === "medium" ? "text-amber-400" : "text-slate-400"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-black uppercase ${severityBadge[d.severity]}`}>{d.severity}</span>
                              <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-300 capitalize">{d.type}</span>
                              {route && (
                                <span className="flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-bold" style={{ color: route.color }}>
                                  <Bus className="h-3 w-3" /> {route.id}
                                </span>
                              )}
                            </div>
                            <h3 className="font-black text-white">{d.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">{d.description}</p>
                            <p className="text-xs text-slate-600 mt-2">Reported: {new Date(d.reportedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Resolved */}
            {resolved.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Recently Resolved</h2>
                <div className="space-y-3">
                  {resolved.map((d) => (
                    <div key={d.id} className="rounded-xl border border-slate-700/40 bg-slate-800/30 px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-400 text-sm">{d.title}</p>
                        <p className="text-xs text-slate-600">{d.routeId} · {d.type}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-xs font-bold shrink-0">Resolved</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
