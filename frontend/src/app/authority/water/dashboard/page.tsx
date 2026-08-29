"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Droplets, AlertTriangle, FileText, Activity, Settings, FlaskConical, Waves, Wrench, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const waterLinks = [
  {
    href: "/authority/water/meters",
    title: "Meter Management",
    text: "Register meters, input manual readings, and view reading history.",
    icon: Activity,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    href: "/authority/water/analysis",
    title: "Consumption Analysis",
    text: "Analyze usage per zone/building and track city-wide trends.",
    icon: BarChart2,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    href: "/authority/water/leaks",
    title: "Leak Management",
    text: "Review reported leaks, detect abnormal readings, and update status.",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    href: "/authority/water/billing",
    title: "Billing System",
    text: "Generate invoices, track payments, and mark bills as paid/unpaid.",
    icon: FileText,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    href: "/authority/water/tariffs",
    title: "Tariff Management",
    text: "Define pricing rules and configure tiered billing rates.",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  {
    href: "/authority/water/quality",
    title: "Quality Monitoring",
    text: "Log water quality tests, set thresholds, and trigger alerts.",
    icon: FlaskConical,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    href: "/authority/water/supply",
    title: "Supply Monitoring",
    text: "Track water supply per zone and detect distribution shortages.",
    icon: Waves,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
  },
  {
    href: "/authority/water/maintenance",
    title: "Maintenance System",
    text: "Create work orders, assign repair tasks, and track inspections.",
    icon: Wrench,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
];

export default function WaterOperatorDashboard() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  
  const [activeMeters, setActiveMeters] = useState(0);
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [limitExceeded, setLimitExceeded] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (isReady) {
      const fetchMeters = async () => {
        try {
          const res = await api.get("/water/meters");
          const meters = res.data;
          
          setActiveMeters(meters.filter((m: any) => m.status === 'active').length);
          setPendingRequests(meters.filter((m: any) => m.status === 'pending').length);
          
          let consumption = 0;
          let anomalies = 0;
          meters.forEach((m: any) => {
             if (m.status === 'active') {
               consumption += (m.lastReading || 0);
               if (m.maxLimit && m.lastReading > m.maxLimit) {
                 anomalies++;
               }
             }
          });
          
          setTotalConsumption(consumption);
          setLimitExceeded(anomalies);
        } catch (err) {
          console.error("Failed to fetch meters", err);
        }
      };
      
      fetchMeters();
      const interval = setInterval(fetchMeters, 5000);
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Droplets className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-blue-700">Water & Utilities</p>
              <h1 className="text-3xl font-black text-slate-950">Operator Dashboard</h1>
            </div>
          </div>
          <p className="mt-4 text-slate-600 max-w-2xl">
            Central command for the city's water infrastructure. Monitor consumption, manage billing, and respond to leaks.
          </p>
        </div>

        {/* High-level metrics dynamic */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Active Meters</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{activeMeters}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total Recorded (L)</p>
            <p className="mt-2 text-3xl font-black text-blue-700">{totalConsumption}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Limit Exceeded</p>
            <p className="mt-2 text-3xl font-black text-amber-700">{limitExceeded}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Pending Requests</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{pendingRequests}</p>
          </div>
        </section>

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {waterLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-black text-slate-950 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 flex-1">
                  {item.text}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
