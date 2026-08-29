"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  Droplets, Flame, Zap, Activity, TrendingUp,
  AlertTriangle, DollarSign, ChevronRight, BarChart3
} from "lucide-react";

const WATER_TARIFF = { tier1: 12, tier2: 20, tier3: 35, penalty: 50 };
const GAS_TARIFF   = { tier1: 8,  tier2: 14, tier3: 22, penalty: 30 };
const ELEC_TARIFF  = { tier1: 5.5, tier2: 8, tier3: 12, penalty: 20 };

function calcRevenue(usage: number, maxLimit: number | undefined, tariff: typeof WATER_TARIFF) {
  let base = 0;
  if (usage <= 10) base = usage * tariff.tier1;
  else if (usage <= 30) base = 10 * tariff.tier1 + (usage - 10) * tariff.tier2;
  else base = 10 * tariff.tier1 + 20 * tariff.tier2 + (usage - 30) * tariff.tier3;
  const penalty = maxLimit && usage > maxLimit ? (usage - maxLimit) * tariff.penalty : 0;
  return Math.round(base + penalty);
}

export default function AdminUtilitiesHub() {
  const { isReady } = useRequireRole(["admin"]);
  const [waterMeters, setWaterMeters] = useState<any[]>([]);
  const [gasMeters, setGasMeters]     = useState<any[]>([]);
  const [elecMeters, setElecMeters]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    Promise.all([
      api.get("/water/meters"),
      api.get("/gas/meters"),
      api.get("/electricity/meters"),
    ]).then(([w, g, e]) => {
      setWaterMeters(w.data);
      setGasMeters(g.data);
      setElecMeters(e.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [isReady]);

  if (!isReady) return null;

  const activeWater = waterMeters.filter((m) => m.status === "active");
  const activeGas   = gasMeters.filter((m) => m.status === "active");
  const activeElec  = elecMeters.filter((m) => m.status === "active");

  const waterRevenue = activeWater.reduce((s, m) => s + calcRevenue(m.lastReading || 0, m.maxLimit, WATER_TARIFF), 0);
  const gasRevenue   = activeGas.reduce((s, m)   => s + calcRevenue(m.lastReading || 0, m.maxLimit, GAS_TARIFF), 0);
  const elecRevenue  = activeElec.reduce((s, m)  => s + calcRevenue(m.lastReading || 0, m.maxLimit, ELEC_TARIFF), 0);
  const totalRevenue = waterRevenue + gasRevenue + elecRevenue;

  const waterUsage = activeWater.reduce((s, m) => s + (m.lastReading || 0), 0);
  const gasUsage   = activeGas.reduce((s, m)   => s + (m.lastReading || 0), 0);
  const elecUsage  = activeElec.reduce((s, m)  => s + (m.lastReading || 0), 0);

  const waterExceeded = activeWater.filter((m) => m.maxLimit && m.lastReading > m.maxLimit).length;
  const gasExceeded   = activeGas.filter((m)   => m.maxLimit && m.lastReading > m.maxLimit).length;
  const elecExceeded  = activeElec.filter((m)  => m.maxLimit && m.lastReading > m.maxLimit).length;
  const totalAlerts   = waterExceeded + gasExceeded + elecExceeded;

  const totalMeters = waterMeters.length + gasMeters.length + elecMeters.length;
  const totalActive = activeWater.length + activeGas.length + activeElec.length;
  const efficiency  = totalMeters > 0 ? Math.round((totalActive / totalMeters) * 100) : 0;

  const utilities = [
    {
      href: "/admin/utilities/water",
      title: "Water Network",
      icon: Droplets,
      color: "text-blue-500 dark:text-blue-400",
      ring: "ring-blue-200 dark:ring-blue-500/30",
      bg: "bg-blue-100 dark:bg-blue-500/10",
      active: activeWater.length,
      pending: waterMeters.filter((m) => m.status === "pending").length,
      usage: waterUsage,
      unit: "m³",
      revenue: waterRevenue,
      exceeded: waterExceeded,
    },
    {
      href: "/admin/utilities/gas",
      title: "Gas Network",
      icon: Flame,
      color: "text-orange-500 dark:text-orange-400",
      ring: "ring-orange-200 dark:ring-orange-500/30",
      bg: "bg-orange-100 dark:bg-orange-500/10",
      active: activeGas.length,
      pending: gasMeters.filter((m) => m.status === "pending").length,
      usage: gasUsage,
      unit: "m³",
      revenue: gasRevenue,
      exceeded: gasExceeded,
    },
    {
      href: "/admin/utilities/electricity",
      title: "Power Grid",
      icon: Zap,
      color: "text-yellow-500 dark:text-yellow-400",
      ring: "ring-yellow-200 dark:ring-yellow-500/30",
      bg: "bg-yellow-100 dark:bg-yellow-500/10",
      active: activeElec.length,
      pending: elecMeters.filter((m) => m.status === "pending").length,
      usage: elecUsage,
      unit: "kWh",
      revenue: elecRevenue,
      exceeded: elecExceeded,
    },
  ];

  return (
    <div className="min-h-screen transition-colors" style={{ background: 'var(--bg-background)' }}>
      <Navbar />

      {/* Header */}
      <div className="border-b transition-colors" style={{ background: "var(--bg-surface)", borderColor: "var(--border-strong)" }}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-500/20 ring-1 ring-teal-200 dark:ring-teal-500/40">
              <Activity className="h-7 w-7 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Admin Control</p>
              <h1 className="text-3xl md:text-4xl font-black mt-1" style={{ color: "var(--text-primary)" }}>Utility Analytics & Control</h1>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>City-wide overview of all utility networks — payment received, consumption, efficiency, and alert thresholds.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* City-Wide KPIs */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Payment Received", value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", ring: "ring-emerald-200 dark:ring-emerald-500/20" },
            { label: "Total Meters", value: totalMeters, icon: BarChart3, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-500/10", ring: "ring-sky-200 dark:ring-sky-500/20" },
            { label: "Active Rate", value: `${efficiency}%`, icon: TrendingUp, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-500/10", ring: "ring-teal-200 dark:ring-teal-500/20" },
            { label: "Active Alerts", value: totalAlerts, icon: AlertTriangle, color: totalAlerts > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500", bg: totalAlerts > 0 ? "bg-rose-100 dark:bg-rose-500/10" : "bg-slate-100 dark:bg-slate-700/30", ring: totalAlerts > 0 ? "ring-rose-200 dark:ring-rose-500/20" : "ring-slate-200 dark:ring-slate-600/20" },
          ].map(({ label, value, icon: Icon, color, bg, ring }) => (
            <div key={label} className="relative overflow-hidden rounded-2xl border p-6 shadow-sm" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}>
              <div className={`absolute top-4 right-4 h-10 w-10 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        {/* Utility Cards */}
        <section className="mb-10 grid gap-6 lg:grid-cols-3">
          {utilities.map((u) => {
            const Icon = u.icon;
            return (
              <Link key={u.href} href={u.href}
                className="group rounded-2xl border p-6 transition-all hover:shadow-xl relative overflow-hidden"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}>
                <div className={`absolute top-0 right-0 h-32 w-32 rounded-bl-full opacity-5 ${u.bg}`} />
                <div className="relative z-10">
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${u.bg} ring-1 ${u.ring}`}>
                    <Icon className={`h-7 w-7 ${u.color}`} />
                  </div>
                  <h2 className={`text-xl font-black mb-1 group-hover:${u.color} transition-colors`} style={{ color: "var(--text-primary)" }}>{u.title}</h2>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 border" style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-strong)" }}>
                      <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Active</p>
                      <p className={`text-2xl font-black ${u.color}`}>{u.active}</p>
                    </div>
                    <div className="rounded-xl p-3 border" style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-strong)" }}>
                      <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Pending</p>
                      <p className="text-2xl font-black text-amber-500 dark:text-amber-400">{u.pending}</p>
                    </div>
                    <div className="rounded-xl p-3 border" style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-strong)" }}>
                      <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Usage</p>
                      <p className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{u.usage} <span className="text-xs" style={{ color: "var(--text-muted)" }}>{u.unit}</span></p>
                    </div>
                    <div className="rounded-xl p-3 border" style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-strong)" }}>
                      <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Payment Received</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">৳{u.revenue.toLocaleString()}</p>
                    </div>
                  </div>

                  {u.exceeded > 0 && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{u.exceeded} meter{u.exceeded > 1 ? "s" : ""} exceeding limit</p>
                    </div>
                  )}

                  <div className={`mt-5 flex items-center text-sm font-bold ${u.color} opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all`}>
                    Manage & Configure <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
