"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Activity, AlertTriangle, CheckCircle, Zap, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Station = { id: string; name: string; zone: string; outputMW: number; demandMW: number; status: "normal" | "warning" | "critical"; lastUpdated: string };

const INITIAL_STATIONS: Station[] = [];

export default function ElectricityGridMonitoringPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStation, setNewStation] = useState({ name: "", zone: "", outputMW: 50, demandMW: 45 });

  useEffect(() => {
    if (isReady) {
      const saved = localStorage.getItem("electricity_grid_stations");
      setStations(saved ? JSON.parse(saved) : INITIAL_STATIONS);
      setLoading(false);
      const interval = setInterval(() => {
        setStations((prev) => {
          const updated = prev.map((s) => {
            const fluctuation = (Math.random() - 0.5) * 4;
            const demandMW = Math.max(5, s.demandMW + fluctuation);
            const loss = ((demandMW - s.outputMW) / s.outputMW) * 100;
            const status: Station["status"] = loss > 15 ? "critical" : loss > 8 ? "warning" : "normal";
            return { ...s, demandMW: Math.round(demandMW * 10) / 10, status, lastUpdated: new Date().toLocaleTimeString() };
          });
          localStorage.setItem("electricity_grid_stations", JSON.stringify(updated));
          return updated;
        });
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isReady]);

  const handleAddStation = (e: React.FormEvent) => {
    e.preventDefault();
    const loss = ((newStation.demandMW - newStation.outputMW) / newStation.outputMW) * 100;
    const status: Station["status"] = loss > 15 ? "critical" : loss > 8 ? "warning" : "normal";
    const station: Station = {
      id: `SUB-E-${Math.floor(Math.random() * 1000)}`,
      name: newStation.name, zone: newStation.zone,
      outputMW: newStation.outputMW, demandMW: newStation.demandMW,
      status, lastUpdated: new Date().toLocaleTimeString(),
    };
    const updated = [station, ...stations];
    setStations(updated);
    localStorage.setItem("electricity_grid_stations", JSON.stringify(updated));
    toast.success(`Substation "${station.name}" added to grid monitoring.`);
    setShowAddModal(false);
    setNewStation({ name: "", zone: "", outputMW: 50, demandMW: 45 });
  };

  const criticalCount = stations.filter((s) => s.status === "critical").length;
  const warningCount = stations.filter((s) => s.status === "warning").length;

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-cyan-700">Live Monitoring</p>
              <h1 className="text-3xl font-black text-slate-950">Electricity Grid Monitoring</h1>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm">
            <Plus className="h-5 w-5" /> Add Substation
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle className="h-6 w-6" /></div>
            <div><p className="text-sm font-bold text-slate-500">Grid Status</p>
              <p className={`text-2xl font-black ${criticalCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>{criticalCount > 0 ? "CRITICAL" : "STABLE"}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600"><Zap className="h-6 w-6" /></div>
            <div><p className="text-sm font-bold text-slate-500">Active Substations</p><p className="text-3xl font-black text-slate-900">{stations.length}</p></div>
          </div>
          <div className={`rounded-xl border p-5 shadow-sm flex items-center gap-4 ${criticalCount > 0 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"}`}>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${criticalCount > 0 ? "bg-rose-200 text-rose-700" : "bg-amber-100 text-amber-600"}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div><p className={`text-sm font-bold ${criticalCount > 0 ? "text-rose-700" : "text-slate-500"}`}>Active Alerts</p>
              <p className={`text-3xl font-black ${criticalCount > 0 ? "text-rose-900" : "text-slate-900"}`}>{criticalCount + warningCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold"><Zap className="h-5 w-5 text-yellow-400" /> Substation Grid Status</div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><span className="animate-pulse h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Live — refreshes every 8s</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Substation</th>
                  <th className="px-6 py-4 font-semibold text-right">Output (MW)</th>
                  <th className="px-6 py-4 font-semibold text-right">Demand (MW)</th>
                  <th className="px-6 py-4 font-semibold text-right">Grid Loss (%)</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading grid data...</td></tr>
                ) : stations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Activity className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="font-bold text-slate-700">No Substations Registered</p>
                      <p className="text-sm text-slate-500 mt-1">Add a substation above to begin monitoring.</p>
                    </td>
                  </tr>
                ) : stations.map((s) => {
                  const loss = ((s.demandMW - s.outputMW) / s.outputMW) * 100;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.zone} · {s.id} · {s.lastUpdated}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">{s.outputMW}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">{s.demandMW}</td>
                      <td className={`px-6 py-4 text-right font-bold ${loss > 15 ? "text-rose-600" : loss > 8 ? "text-amber-600" : "text-emerald-600"}`}>
                        {loss.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.status === "normal" ? "bg-emerald-100 text-emerald-700" : s.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                          {s.status === "critical" && <AlertTriangle className="h-3 w-3" />}{s.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-black text-slate-900">Add Substation</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddStation} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Substation Name</label>
                <input required value={newStation.name} onChange={(e) => setNewStation({ ...newStation, name: e.target.value })} placeholder="e.g. Gulshan Grid Node A"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-cyan-500" />
              </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Zone</label>
                <input required value={newStation.zone} onChange={(e) => setNewStation({ ...newStation, zone: e.target.value })} placeholder="e.g. Gulshan"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Output (MW)</label>
                  <input type="number" min={1} value={newStation.outputMW} onChange={(e) => setNewStation({ ...newStation, outputMW: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-cyan-500 font-mono" />
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Demand (MW)</label>
                  <input type="number" min={1} value={newStation.demandMW} onChange={(e) => setNewStation({ ...newStation, demandMW: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-cyan-500 font-mono" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-lg transition">Add Substation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
