"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import type { Report } from "@/types/report";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Dynamically import map to avoid SSR window is not defined errors
const TransparencyMap = dynamic(() => import("@/components/map/TransparencyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center border border-slate-200">
      <p className="text-slate-500 font-bold">Loading Live Heatmap...</p>
    </div>
  ),
});

const COLORS = ['#0d9488', '#eab308', '#f97316', '#ef4444', '#64748b'];

export default function TransparencyDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // We fetch public reports. The backend limits this to Civic reports currently.
    // If the user wants Crime, we could use the generic endpoint, but public is safer for MVP.
    api
      .get("/reports/public")
      .then((res) => {
        setReports(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  // Calculate stats
  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;
  const inProgressReports = reports.filter(r => r.status === 'in_progress').length;
  
  // Resolution Rate
  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  // Chart 1: Status Distribution
  const statusData = [
    { name: 'Submitted', value: reports.filter(r => r.status === 'submitted').length },
    { name: 'Assigned', value: reports.filter(r => r.status === 'assigned').length },
    { name: 'In Progress', value: inProgressReports },
    { name: 'Resolved', value: resolvedReports },
    { name: 'Rejected', value: reports.filter(r => r.status === 'rejected').length },
  ].filter(d => d.value > 0);

  // Chart 2: Top Districts
  const districtCounts: Record<string, number> = {};
  reports.forEach(r => {
    const distName = r.districtName || (r as any).district?.name;
    if (distName) {
      districtCounts[distName] = (districtCounts[distName] || 0) + 1;
    }
  });
  
  const districtData = Object.entries(districtCounts)
    .map(([name, count]) => ({ name: name.replace(' District', ''), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-teal-700">CivicWatch Analytics</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Public Transparency Portal</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Live insights into city infrastructure, public reports, and resolution statistics. We believe in open data for a better city.
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 uppercase">Total Reports</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{totalReports}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 uppercase">Resolved Issues</p>
            <p className="mt-2 text-4xl font-black text-teal-600">{resolvedReports}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 uppercase">Currently Active</p>
            <p className="mt-2 text-4xl font-black text-amber-500">{inProgressReports}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 uppercase">Resolution Rate</p>
            <p className="mt-2 text-4xl font-black text-blue-600">{resolutionRate}%</p>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Live Incident Heatmap</h2>
          <TransparencyMap reports={reports} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Pie Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[400px]">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Report Status Overview</h2>
            {!mounted ? (
              <div className="h-[320px] rounded-xl bg-slate-100 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* District Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[400px]">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Most Active Districts</h2>
            {!mounted ? (
              <div className="h-[320px] rounded-xl bg-slate-100 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={districtData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
