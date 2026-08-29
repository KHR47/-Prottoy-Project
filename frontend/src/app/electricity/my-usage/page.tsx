"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { TrendingUp, AlertTriangle, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";

export default function MyElectricityUsagePage() {
  const { isReady, user } = useRequireRole(["citizen"]);
  const [meter, setMeter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isReady && user) {
      const fetch = async () => {
        try {
          const res = await api.get("/electricity/meters");
          const citizenNameLower = user.name?.trim().toLowerCase();
          const myMeter = res.data.find((m: any) => m.citizenName?.trim().toLowerCase() === citizenNameLower && m.status === 'active')
            || res.data.find((m: any) => m.citizenName?.trim().toLowerCase() === citizenNameLower);
          setMeter(myMeter || null);
        } catch (err: any) {
          if (err?.code !== "ERR_NETWORK") console.error(err);
        } finally { setLoading(false); }
      };
      fetch();
    }
  }, [isReady, user]);

  if (!isReady) return null;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-yellow-500" /></div>
    </div>
  );

  if (!meter) return (
    <div className="min-h-screen bg-slate-50 pb-12"><Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Info className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">No Electricity Meter Found</h2>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">You don't have an active smart meter registered to your account.</p>
          <Link href="/electricity/request-meter" className="inline-flex rounded-lg bg-yellow-500 px-6 py-3 font-bold text-white hover:bg-yellow-600 transition">
            Request Smart Meter
          </Link>
        </div>
      </main>
    </div>
  );

  const sortedReadings = [...(meter.readings || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const usageData = sortedReadings.map((r: any, i: number) => {
    const prev = sortedReadings[i - 1];
    const consumption = (prev && r.value >= prev.value) ? (r.value - prev.value) : r.value;
    return {
      id: r.id,
      month: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      usage: consumption, rawValue: r.value,
      isAnomaly: meter.maxLimit ? r.value > meter.maxLimit : false,
    };
  }).slice(-12);

  const hasAnomaly = usageData.some((d: any) => d.isAnomaly);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-bold uppercase text-yellow-700">Electricity Services</p>
          <h1 className="text-3xl font-black text-slate-950">My Electricity Usage</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">Track your household kWh consumption and detect unusual spikes that may indicate faults.</p>
        </div>

        {hasAnomaly && (
          <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 p-5 flex gap-4 shadow-sm items-start">
            <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-900">Usage Limit Exceeded</h3>
              <p className="text-sm text-rose-700 mt-1">
                Your usage exceeded the monthly threshold of <strong>{meter.maxLimit} kWh</strong> set by the authority. You may face penalty charges on your next invoice.
              </p>
            </div>
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-950">Consumption History (kWh)</h3>
              <p className="text-sm text-slate-500 font-mono mt-1">Meter ID: {meter.id} · Zone: {meter.zone}</p>
            </div>
            {usageData.length > 1 && (
              <div className="flex items-center gap-2 text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
                <TrendingUp className="h-4 w-4" /> Tracking Active
              </div>
            )}
          </div>
          <div className="h-80 w-full min-h-[320px]">
            {!mounted ? (
              <div className="h-full w-full rounded-xl bg-slate-100 animate-pulse" />
            ) : usageData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium border-2 border-dashed rounded-xl">
                No readings available yet. Ask the authority to log your first reading.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: any) => [`${value} kWh`, "Consumed"]}
                    labelFormatter={(label) => `Period: ${label}`} />
                  {meter.maxLimit && <ReferenceLine y={meter.maxLimit} label="Max Limit" stroke="#e11d48" strokeDasharray="3 3" />}
                  <Bar dataKey="usage" radius={[4, 4, 0, 0]} barSize={40}>
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isAnomaly ? "#e11d48" : "#eab308"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Reading History</h3>
            <span className="text-xs text-slate-400 font-medium">Consumed = delta between consecutive readings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold text-right">Meter Reading</th>
                  <th className="px-6 py-3 font-semibold text-right">Consumed</th>
                  <th className="px-6 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usageData.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No readings logged yet.</td></tr>
                ) : [...usageData].reverse().map((record: any, index: number) => (
                  <tr key={record.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{record.month}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-600">{record.rawValue} kWh</td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${record.isAnomaly ? "text-rose-600" : "text-slate-800"}`}>{record.usage} kWh</td>
                    <td className="px-6 py-4 text-right">
                      {record.isAnomaly
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Limit Exceeded</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Normal</span>}
                    </td>
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
