"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Flame, Gauge, Receipt, Settings, Activity, AlertTriangle, ChevronRight, Wrench, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const gasLinks = [
  {
    href: "/authority/gas/meters",
    title: "Meter Management",
    text: "Approve new gas connections, assign hardware IDs, and monitor live readings.",
    icon: Gauge,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    href: "/authority/gas/billing",
    title: "Billing System",
    text: "Review automated invoices based on cubic meter usage and dispatch to citizens.",
    icon: Receipt,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    href: "/authority/gas/tariffs",
    title: "Tariff Management",
    text: "Configure tiered pricing per cubic meter and set flat-fee over-limit penalties.",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  {
    href: "/authority/gas/supply",
    title: "Supply Monitoring",
    text: "Monitor distribution node pressure vs actual metered demand to detect pipeline leaks.",
    icon: Activity,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
  },
  {
    href: "/authority/gas/safety",
    title: "Safety & Pressure",
    text: "Monitor methane levels and high-pressure anomalies across the city.",
    icon: ShieldAlert,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    href: "/authority/gas/maintenance",
    title: "Maintenance System",
    text: "Create work orders, assign repair tasks, and track engineering dispatches.",
    icon: Wrench,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
];

export default function AuthorityGasDashboard() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [metrics, setMetrics] = useState({
    activeMeters: 0,
    pendingRequests: 0,
    totalConsumption: 0,
    limitExceeded: 0
  });

  useEffect(() => {
    if (isReady) {
      const fetchMeters = async () => {
        try {
          const res = await api.get("/gas/meters");
          const meters = res.data;
          
          let active = 0;
          let pending = 0;
          let consumption = 0;
          let exceeded = 0;

          meters.forEach((m: any) => {
            if (m.status === "active") active++;
            if (m.status === "pending") pending++;
            if (m.lastReading) consumption += m.lastReading;
            if (m.maxLimit && m.lastReading > m.maxLimit) exceeded++;
          });

          setMetrics({
            activeMeters: active,
            pendingRequests: pending,
            totalConsumption: consumption,
            limitExceeded: exceeded
          });
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-orange-700">Utility Operations</p>
              <h1 className="text-3xl font-black text-slate-950">Gas Management Hub</h1>
            </div>
          </div>
          <p className="mt-4 text-slate-600 max-w-2xl">
            Centralized control for the city's line gas distribution network. Monitor live meter readings, manage tariffs, track physical grid supply, and dispatch safety teams.
          </p>
        </div>

        {/* Live Metrics */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Gas Meters</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{metrics.activeMeters}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Consumption</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{metrics.totalConsumption} <span className="text-lg text-slate-500">m³</span></p>
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
          {gasLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-lg relative overflow-hidden"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-950 group-hover:text-orange-700 transition-colors">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 flex-1">
                  {item.text}
                </p>
                <div className="mt-6 flex items-center text-sm font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
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
