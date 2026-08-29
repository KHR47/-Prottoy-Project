"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Droplets, TrendingUp, AlertTriangle, DollarSign, Users,
  BarChart3, Activity, CheckCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => { setM(true); }, []);
  return m;
}

export default function AdminWaterUtilityPage() {
  const { isReady } = useRequireRole(["admin"]);
  const mounted = useMounted();
  const [meters, setMeters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      api.get("/water/meters")
        .then((r) => setMeters(r.data))
        .catch((e: any) => { if (e?.code !== "ERR_NETWORK") console.error(e); })
        .finally(() => setLoading(false));
    }
  }, [isReady]);

  const active = meters.filter((m) => m.status === "active");
  const pending = meters.filter((m) => m.status === "pending");
  const exceeded = active.filter((m) => m.maxLimit && (m.lastReading || 0) > m.maxLimit);
  const totalUsage = active.reduce((s, m) => s + (m.lastReading || 0), 0);

  const TARIFF = { t1: 12, t2: 20, t3: 35, t1Max: 10, t2Max: 30, penalty: 50 };
  const calcBill = (u: number, max?: number) => {
    let b = u <= TARIFF.t1Max ? u * TARIFF.t1 : u <= TARIFF.t2Max
      ? TARIFF.t1Max * TARIFF.t1 + (u - TARIFF.t1Max) * TARIFF.t2
      : TARIFF.t1Max * TARIFF.t1 + (TARIFF.t2Max - TARIFF.t1Max) * TARIFF.t2 + (u - TARIFF.t2Max) * TARIFF.t3;
    return Math.round(b + (max && u > max ? (u - max) * TARIFF.penalty : 0));
  };
  const totalRevenue = active.reduce((s, m) => s + calcBill(m.lastReading || 0, m.maxLimit), 0);
  const efficiency = meters.length > 0 ? Math.round((active.length / meters.length) * 100) : 0;

  const zoneData = useMemo(() => {
    const zones: Record<string, { usage: number; meters: number; revenue: number }> = {};
    active.forEach((m) => {
      const z = m.zone || "Unknown";
      if (!zones[z]) zones[z] = { usage: 0, meters: 0, revenue: 0 };
      zones[z].usage += m.lastReading || 0;
      zones[z].meters += 1;
      zones[z].revenue += calcBill(m.lastReading || 0, m.maxLimit);
    });
    return Object.entries(zones).map(([zone, d]) => ({ zone, ...d })).sort((a, b) => b.usage - a.usage);
  }, [active]);

  const inputClass = "h-10 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  if (!isReady) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 ring-1 ring-blue-500/40">
            <Droplets className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Admin · Utility Analytics</p>
            <h1 className="text-2xl font-black text-white">Water Network Control</h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Payment Received", value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Total Usage", value: `${totalUsage} m³`, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Active Meters", value: active.length, icon: Users, color: "text-sky-400", bg: "bg-sky-500/10" },
            { label: "Limit Violations", value: exceeded.length, icon: AlertTriangle, color: exceeded.length > 0 ? "text-rose-400" : "text-slate-500", bg: exceeded.length > 0 ? "bg-rose-500/10" : "bg-slate-700/30" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 relative overflow-hidden">
              <div className={`absolute top-4 right-4 h-9 w-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
              <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500 font-bold uppercase">Pending Requests</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{pending.length}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500 font-bold uppercase">Network Efficiency</p>
            <p className="text-2xl font-black text-teal-400 mt-1">{efficiency}%</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500 font-bold uppercase">Avg Usage/Meter</p>
            <p className="text-2xl font-black text-blue-400 mt-1">{active.length > 0 ? Math.round(totalUsage / active.length) : 0} m³</p>
          </div>
        </div>

        {/* Zone Chart */}
        <section className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
          <h3 className="text-lg font-black text-white mb-1">Usage by Zone</h3>
          <p className="text-xs text-slate-500 mb-6">Total m³ consumption per district zone</p>
          <div className="h-72 min-h-[288px]">
            {!mounted ? (
              <div className="h-full rounded-xl bg-slate-700/30 animate-pulse" />
            ) : zoneData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">No zone data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={zoneData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="zone" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "#1e293b" }} contentStyle={{ borderRadius: "12px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" }} />
                  <Bar dataKey="usage" name="Usage (m³)" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Revenue by Zone Table */}
        <section className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/40">
            <h3 className="font-black text-white">Zone Payment Received Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700/50 bg-slate-900/20">
                <tr>
                  {["Zone", "Meters", "Total Usage", "Estimated Payment Received"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-xs font-bold uppercase text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {zoneData.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">No data yet.</td></tr>
                ) : zoneData.map((z) => (
                  <tr key={z.zone} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{z.zone}</td>
                    <td className="px-6 py-4 text-slate-400">{z.meters}</td>
                    <td className="px-6 py-4 font-mono text-blue-400">{z.usage} m³</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">৳{z.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
