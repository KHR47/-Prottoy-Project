"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Zap, Gauge, Receipt, Settings, Activity, AlertTriangle, ChevronRight, Wrench, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const electricityLinks = [
  {
    href: "/authority/electricity/meters",
    title: "Meter Management",
    text: "Approve new electricity connections, assign hardware IDs, and monitor live kWh readings.",
    icon: Gauge,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    href: "/authority/electricity/billing",
    title: "Billing System",
    text: "Review automated invoices based on kWh usage and dispatch to citizens.",
    icon: Receipt,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    href: "/authority/electricity/tariffs",
    title: "Tariff Management",
    text: "Configure tiered pricing per kWh and set flat-fee over-limit penalties.",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  {
    href: "/authority/electricity/supply",
    title: "Grid Monitoring",
    text: "Monitor substation output vs actual metered demand to detect grid losses.",
    icon: Activity,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
  },
  {
    href: "/authority/electricity/outage",
    title: "Outage & Safety",
    text: "Log power outages, monitor voltage anomalies, and dispatch safety teams.",
    icon: ShieldAlert,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    href: "/authority/electricity/maintenance",
    title: "Maintenance System",
    text: "Create work orders, assign repair tasks, and track field engineering dispatches.",
    icon: Wrench,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
];

export default function AuthorityElectricityDashboard() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [metrics, setMetrics] = useState({
    activeMeters: 0,
    pendingRequests: 0,
    totalConsumption: 0,
    limitExceeded: 0,
  });

  useEffect(() => {
    if (isReady) {
      const fetchMeters = async () => {
        try {
          const res = await api.get("/electricity/meters");
          const meters = res.data;
          let active = 0, pending = 0, consumption = 0, exceeded = 0;
          meters.forEach((m: any) => {
            if (m.status === "active") active++;
            if (m.status === "pending") pending++;
            if (m.lastReading) consumption += m.lastReading;
            if (m.maxLimit && m.lastReading > m.maxLimit) exceeded++;
          });
          setMetrics({ activeMeters: active, pendingRequests: pending, totalConsumption: consumption, limitExceeded: exceeded });
        } catch (err: any) {
          if (err?.code !== "ERR_NETWORK") console.error(err);
        }
      };
      fetchMeters();
      const interval = setInterval(fetchMeters, 10000);
      return () => clearInterval(interval);
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-white shadow-sm">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-yellow-700">Utility Operations</p>
              <h1 className="text-3xl font-black text-slate-950">Power Grid Management Hub</h1>
            </div>
          </div>
          <p className="mt-4 text-slate-600 max-w-2xl">
            Centralized control for the city's electricity distribution network. Monitor live meter readings, manage tariffs, track substation supply, and dispatch safety teams.
          </p>
        </div>

        {/* Live Metrics */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Meters</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{metrics.activeMeters}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Consumption</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{metrics.totalConsumption} <span className="text-lg text-slate-500">kWh</span></p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <p className="text-sm font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Limit Exceeded
            </p>
            <p className="mt-2 text-4xl font-black text-rose-900">{metrics.limitExceeded}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
              <Gauge className="h-4 w-4" /> Pending Requests
            </p>
            <p className="mt-2 text-4xl font-black text-amber-900">{metrics.pendingRequests}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {electricityLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-yellow-300 hover:shadow-lg relative overflow-hidden"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-950 group-hover:text-yellow-700 transition-colors">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 flex-1">{item.text}</p>
                <div className="mt-6 flex items-center text-sm font-bold text-yellow-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  Open Module <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
