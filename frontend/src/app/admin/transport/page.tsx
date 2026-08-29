"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  Bus,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Users,
  Activity,
  Ticket,
  CheckCircle2,
  Wrench,
  Radio,
  BarChart3,
} from "lucide-react";

const TYPE_COLOR: Record<string, string> = {
  government: "text-violet-600 dark:text-violet-400",
  ac: "text-sky-600 dark:text-sky-400",
  "semi-seating": "text-amber-600 dark:text-amber-400",
  private: "text-slate-600 dark:text-slate-400",
};
const TYPE_LABEL: Record<string, string> = {
  government: "BRTC / Govt",
  ac: "AC / Deluxe",
  "semi-seating": "Semi-Seating",
  private: "Private Local",
};

const SEV_STYLE: Record<string, string> = {
  high: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
  medium:
    "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  low: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
};

type Route = {
  id: string;
  type?: string;
  operator?: string;
  from?: string;
  to?: string;
};

type Vehicle = {
  id: string;
  registration?: string;
  driver?: string | null;
  routeId?: string;
  status?: string;
};

type TicketRecord = {
  fare?: number;
};

type Disruption = {
  id: string;
  routeId?: string;
  status?: string;
  severity?: string;
  title?: string;
  description?: string;
  type?: string;
};

type TransportAnalytics = {
  avgRating?: number | string;
};

export default function AdminTransportPage() {
  const { isReady } = useRequireRole(["admin"]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [analytics, setAnalytics] = useState<TransportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    Promise.all([
      api.get("/transport/routes"),
      api.get("/transport/vehicles"),
      api.get("/transport/tickets"),
      api.get("/transport/disruptions"),
      api.get("/transport/analytics"),
    ])
      .then(([r, v, t, d, a]) => {
        setRoutes(r.data as Route[]);
        setVehicles(v.data as Vehicle[]);
        setTickets(t.data as TicketRecord[]);
        setDisruptions(d.data as Disruption[]);
        setAnalytics(a.data as TransportAnalytics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady]);

  // ── Derived stats ──────────────────────────────────────────────
  const onRoute = vehicles.filter((v) => v.status === "on_route").length;
  const inDepot = vehicles.filter((v) => v.status === "depot").length;
  const maintenance = vehicles.filter((v) => v.status === "maintenance").length;
  const activeDisruptions = disruptions.filter((d) => d.status === "active");

  const byType = useMemo(() => {
    const counts: Record<string, number> = {};
    routes.forEach((r) => {
      counts[r.type ?? "private"] = (counts[r.type ?? "private"] || 0) + 1;
    });
    return counts;
  }, [routes]);

  const totalRevenue = useMemo(
    () => tickets.reduce((s, t) => s + (t.fare || 0), 0),
    [tickets],
  );

  const kpis = [
    {
      label: "Total Routes",
      value: routes.length,
      icon: Bus,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-100 dark:bg-sky-500/10",
      ring: "ring-sky-200 dark:ring-sky-500/20",
    },
    {
      label: "Fleet Size",
      value: vehicles.length,
      icon: Activity,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-100 dark:bg-teal-500/10",
      ring: "ring-teal-200 dark:ring-teal-500/20",
    },
    {
      label: "Tickets Issued",
      value: tickets.length,
      icon: Ticket,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-500/10",
      ring: "ring-violet-200 dark:ring-violet-500/20",
    },
    {
      label: "Ticket Payment Received",
      value: `৳${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-500/10",
      ring: "ring-emerald-200 dark:ring-emerald-500/20",
    },
    {
      label: "Live Disruptions",
      value: activeDisruptions.length,
      icon: AlertTriangle,
      color:
        activeDisruptions.length > 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-slate-500",
      bg:
        activeDisruptions.length > 0
          ? "bg-rose-100 dark:bg-rose-500/10"
          : "bg-slate-100 dark:bg-slate-700/20",
      ring:
        activeDisruptions.length > 0
          ? "ring-rose-200 dark:ring-rose-500/20"
          : "ring-slate-200 dark:ring-slate-600/20",
    },
    {
      label: "Avg Rating",
      value: analytics?.avgRating ?? "N/A",
      icon: Users,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-500/10",
      ring: "ring-amber-200 dark:ring-amber-500/20",
    },
  ];

  if (!isReady) return null;

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ background: "var(--bg-background)" }}
    >
      <Navbar />

      {/* Header */}
      <div
        className="border-b transition-colors"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-strong)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-500/20 ring-1 ring-sky-200 dark:ring-sky-500/40 shadow-lg shadow-sky-500/10">
              <Bus className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Admin Control
              </p>
              <h1
                className="text-3xl md:text-4xl font-black mt-1"
                style={{ color: "var(--text-primary)" }}
              >
                Transport System Overview
              </h1>
              <p
                className="mt-2 text-sm max-w-2xl"
                style={{ color: "var(--text-secondary)" }}
              >
                City-wide analytics for Dhaka&apos;s public bus network —{" "}
                {routes.length} routes, {vehicles.length} vehicles, live
                disruptions, and ridership data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map(({ label, value, icon: Icon, color, bg, ring }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-2xl border p-5 shadow-sm"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border-strong)",
              }}
            >
              <div
                className={`absolute top-4 right-4 h-9 w-9 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center`}
              >
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </p>
              <p className={`mt-3 text-3xl font-black ${color}`}>
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </section>

        {/* Fleet Status + Route Type breakdown */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Fleet Status */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-strong)",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-500/10 ring-1 ring-teal-200 dark:ring-teal-500/30">
                <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <h2
                className="font-black"
                style={{ color: "var(--text-primary)" }}
              >
                Fleet Status
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "On Route",
                  value: onRoute,
                  icon: Radio,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-500/10",
                  border: "border-emerald-200 dark:border-emerald-500/20",
                },
                {
                  label: "In Depot",
                  value: inDepot,
                  icon: CheckCircle2,
                  color: "text-slate-600 dark:text-slate-400",
                  bg: "bg-slate-50 dark:bg-slate-700/30",
                  border: "border-slate-200 dark:border-slate-600/30",
                },
                {
                  label: "Maintenance",
                  value: maintenance,
                  icon: Wrench,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-500/10",
                  border: "border-amber-200 dark:border-amber-500/20",
                },
              ].map(({ label, value, icon: Icon, color, bg, border }) => (
                <div
                  key={label}
                  className={`rounded-xl border ${border} ${bg} p-4 text-center`}
                >
                  <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p
                    className="text-xs font-bold mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Vehicle list */}
            <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
                  style={{
                    background: "var(--bg-surface-2)",
                    borderColor: "var(--border-strong)",
                  }}
                >
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${v.status === "on_route" ? "bg-emerald-500" : v.status === "maintenance" ? "bg-amber-500" : "bg-slate-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {v.registration}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {v.driver ?? "No driver"} · Route {v.routeId}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${v.status === "on_route" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : v.status === "maintenance" ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30" : "bg-slate-100 dark:bg-slate-700/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-600/30"}`}
                  >
                    {(v.status ?? "unknown").replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Route breakdown by type */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-strong)",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/10 ring-1 ring-sky-200 dark:ring-sky-500/30">
                <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <h2
                className="font-black"
                style={{ color: "var(--text-primary)" }}
              >
                Routes by Operator Type
              </h2>
            </div>
            <div className="space-y-3">
              {Object.entries(byType).map(([type, count]) => {
                const pct = Math.round((count / routes.length) * 100);
                return (
                  <div key={type}>
                    <div className="flex justify-between mb-1">
                      <span
                        className={`text-sm font-bold ${TYPE_COLOR[type] ?? "text-slate-500 dark:text-slate-400"}`}
                      >
                        {TYPE_LABEL[type] ?? type}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {count} routes ({pct}%)
                      </span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full"
                      style={{ background: "var(--bg-surface-2)" }}
                    >
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            type === "government"
                              ? "#8b5cf6"
                              : type === "ac"
                                ? "#0ea5e9"
                                : type === "semi-seating"
                                  ? "#f59e0b"
                                  : "#64748b",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick links to operator panel */}
            <div
              className="mt-6 pt-5 border-t"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Operator Tools
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    href: "/operator/routes",
                    label: "Manage Routes",
                    icon: MapPin,
                  },
                  {
                    href: "/operator/vehicles",
                    label: "Manage Fleet",
                    icon: Bus,
                  },
                  {
                    href: "/operator/schedules",
                    label: "Schedules",
                    icon: Clock,
                  },
                  {
                    href: "/operator/disruptions",
                    label: "Disruptions",
                    icon: AlertTriangle,
                  },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition group hover:opacity-80"
                    style={{
                      background: "var(--bg-surface-2)",
                      borderColor: "var(--border-strong)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                    <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Active Disruptions */}
        <section
          className="rounded-2xl border p-6"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border-strong)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/10 ring-1 ring-rose-200 dark:ring-rose-500/30">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <h2
                className="font-black"
                style={{ color: "var(--text-primary)" }}
              >
                Active Disruptions
              </h2>
            </div>
            <Link
              href="/operator/disruptions"
              className="text-xs font-bold text-sky-500 hover:underline transition flex items-center gap-1"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {activeDisruptions.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                All services operating normally. No active disruptions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDisruptions.map((d) => {
                const route = routes.find((r) => r.id === d.routeId);
                return (
                  <div
                    key={d.id}
                    className="flex items-start gap-4 rounded-xl border p-4"
                    style={{
                      background: "var(--bg-surface-2)",
                      borderColor: "var(--border-strong)",
                    }}
                  >
                    <div
                      className={`mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase shrink-0 ${SEV_STYLE[d.severity ?? "low"] ?? SEV_STYLE.low}`}
                    >
                      {d.severity}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-black text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {d.title}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {d.description}
                      </p>
                      {route && (
                        <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-bold">
                          {route.operator} — {route.from} → {route.to}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
                      style={{
                        color: "var(--text-muted)",
                        borderColor: "var(--border-strong)",
                        background: "var(--bg-background)",
                      }}
                    >
                      {d.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
