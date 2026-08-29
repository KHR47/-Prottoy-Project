"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { BarChart2, TrendingUp, Map, Droplets, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ConsumptionAnalysisPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [loading, setLoading] = useState(true);
  const [meters, setMeters] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isReady) {
      const fetchMeters = async () => {
        try {
          const res = await api.get("/water/meters");
          setMeters(res.data.filter((m: any) => m.status === "active"));
        } catch (err: any) {
          if (err?.code !== "ERR_NETWORK") console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMeters();
      const interval = setInterval(fetchMeters, 10000); // refresh every 10s
      return () => clearInterval(interval);
    }
  }, [isReady]);

  if (!isReady) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  // --- Process Data for Charts ---

  // 1. Consumption by Zone
  const zoneMap: Record<string, number> = {};
  meters.forEach(m => {
    const zone = m.district || m.zone || "Unknown";
    zoneMap[zone] = (zoneMap[zone] || 0) + (m.lastReading || 0);
  });
  
  const zoneData = Object.keys(zoneMap).map(zone => ({
    name: zone,
    value: zoneMap[zone]
  })).sort((a, b) => b.value - a.value);

  // 2. City-Wide Trend over Time
  // Aggregate all readings by date
  const trendMap: Record<string, number> = {};
  meters.forEach(m => {
    m.readings?.forEach((r: any) => {
      trendMap[r.date] = (trendMap[r.date] || 0) + r.value;
    });
  });

  const trendData = Object.keys(trendMap)
    .sort() // Sort by date ascending
    .map(date => {
      const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: formattedDate,
        total: trendMap[date]
      };
    });

  // 3. Top Consumers
  const topConsumers = [...meters]
    .sort((a, b) => (b.lastReading || 0) - (a.lastReading || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <BarChart2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold uppercase text-indigo-700">Analytics Hub</p>
            </div>
            <h1 className="text-3xl font-black text-slate-950">Consumption Analysis</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Monitor city-wide water usage trends, identify high-consumption districts, and track extreme outliers.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100 font-bold text-sm">
            <Droplets className="h-4 w-4" />
            Total Active Meters: {meters.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Trend Chart (Takes up 2 cols on large screens) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                City-Wide Usage Trend
              </h3>
            </div>
            <div className="h-[300px] w-full min-h-[300px]">
              {!mounted ? (
                <div className="h-full w-full rounded-xl bg-slate-100 animate-pulse" />
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '3 3' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#4f46e5" 
                      strokeWidth={4}
                      dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium border-2 border-dashed rounded-xl">
                  Not enough historical reading data.
                </div>
              )}
            </div>
          </section>

          {/* Zone Pie Chart */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                <Map className="h-5 w-5 text-indigo-500" />
                Usage by District
              </h3>
            </div>
            <div className="h-[250px] w-full min-h-[250px]">
              {!mounted ? (
                <div className="h-full w-full rounded-xl bg-slate-100 animate-pulse" />
              ) : zoneData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={zoneData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {zoneData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium">
                  No data
                </div>
              )}
            </div>
            {/* Custom Legend */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {zoneData.slice(0, 4).map((zone, i) => (
                <div key={zone.name} className="flex items-center gap-1.5 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-slate-600 font-medium">{zone.name}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Top Consumers List */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-lg">Top High-Consumption Nodes</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Meter ID</th>
                  <th className="px-6 py-4 font-semibold">Citizen</th>
                  <th className="px-6 py-4 font-semibold">District</th>
                  <th className="px-6 py-4 font-semibold">Max Limit</th>
                  <th className="px-6 py-4 font-semibold text-right">Latest Reading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topConsumers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No active meters with readings.
                    </td>
                  </tr>
                ) : (
                  topConsumers.map((meter) => {
                    const isExceeded = meter.maxLimit && meter.lastReading > meter.maxLimit;
                    return (
                      <tr key={meter.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {meter.id}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {meter.citizenName}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {meter.district || meter.zone}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {meter.maxLimit ? `${meter.maxLimit} L` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold ${isExceeded ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                            {meter.lastReading} L
                            {isExceeded && <AlertTriangle className="h-3 w-3" />}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
