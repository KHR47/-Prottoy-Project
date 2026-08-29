"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { TrendingUp, AlertTriangle, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";



export default function MyWaterUsagePage() {
  const { isReady, user } = useRequireRole(["citizen"]);
  const [meter, setMeter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && user) {
      const fetchMeters = async () => {
        try {
          const res = await api.get("/water/meters");
          // Find the meter matching this citizen
          const citizenNameLower = user.name?.trim().toLowerCase();
          const myMeter = res.data.find((m: any) => m.citizenName?.trim().toLowerCase() === citizenNameLower && m.status === 'active')
            || res.data.find((m: any) => m.citizenName?.trim().toLowerCase() === citizenNameLower);
          setMeter(myMeter);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchMeters();
    }
  }, [isReady, user]);

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

  if (!meter) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Info className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">No Meter Found</h2>
            <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">We couldn't find an active water connection registered to your account.</p>
            <Link href="/water/request-meter" className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700">
              Request Connection
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Parse readings for chart
  const usageData = meter.readings.slice(0, 12).reverse().map((r: any) => ({
    id: r.id,
    month: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    usage: r.value,
    isAnomaly: meter.maxLimit ? r.value > meter.maxLimit : false
  }));
  
  const hasAnomaly = usageData.some((d: any) => d.isAnomaly);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-bold uppercase text-blue-700">Water Services</p>
          <h1 className="text-3xl font-black text-slate-950">My Water Usage</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Track your household consumption trends and identify unusual spikes that might indicate leaks.
          </p>
        </div>

        {hasAnomaly && (
          <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 p-5 flex gap-4 shadow-sm items-start">
              <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                  <h3 className="font-bold text-rose-900">Limit Exceeded Warning</h3>
                  <p className="text-sm text-rose-700 mt-1">
                      Your usage has exceeded the maximum monthly threshold of <strong>{meter.maxLimit}L</strong> set by the authority. You may face penalty rates on your next billing cycle. We recommend checking your plumbing or reducing consumption.
                  </p>
              </div>
          </div>
        )}

        {/* Chart Section */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-950">Consumption History (Liters)</h3>
              <p className="text-sm text-slate-500 font-mono mt-1">Meter ID: {meter.id} • Zone: {meter.zone}</p>
            </div>
            {usageData.length > 1 && (
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                  <span>Tracking Active</span>
              </div>
            )}
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
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
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                {meter.maxLimit && (
                  <ReferenceLine y={meter.maxLimit} label="Max Limit" stroke="#e11d48" strokeDasharray="3 3" />
                )}
                <Bar 
                  dataKey="usage" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                >
                  {usageData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.isAnomaly ? "#e11d48" : "#2563eb"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        
        {/* Detail List */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Recent Readings History</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {usageData.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No readings logged yet.</div>
            ) : (
              [...usageData].reverse().map((record: any, index: number) => (
                <div key={record.id || index} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900 w-16">{record.month}</span>
                    {record.isAnomaly && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">Exceeded Limit</span>
                    )}
                  </div>
                  <span className={`font-mono font-bold ${record.isAnomaly ? 'text-rose-600' : 'text-slate-700'}`}>
                    {record.usage} L
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
