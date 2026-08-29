"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import { Bus, MapPin, Clock, Search, ChevronRight, Loader2, Building2, Zap } from "lucide-react";

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  government:   { label: "BRTC / Govt",    cls: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  ac:           { label: "AC / Deluxe",    cls: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  "semi-seating":{ label: "Semi-Seating", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  private:      { label: "Private Local",  cls: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    api.get("/transport/routes")
      .then((r) => setRoutes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.name?.toLowerCase().includes(q) ||
      r.operator?.toLowerCase().includes(q) ||
      r.from?.toLowerCase().includes(q) ||
      r.to?.toLowerCase().includes(q) ||
      r.stops?.some((s: string) => s.toLowerCase().includes(q));
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const types = ["all", "private", "government", "ac", "semi-seating"];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 ring-1 ring-sky-500/40">
                <Bus className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Dhaka Bus Service</p>
                <h1 className="text-2xl font-black text-white">
                  All Routes
                  {!loading && (
                    <span className="ml-2 text-sm font-bold text-slate-500">({filtered.length} of {routes.length})</span>
                  )}
                </h1>
              </div>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search operator, stop, or route…"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Type filter pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {types.map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all ${
                  typeFilter === t
                    ? "bg-sky-500 border-sky-500 text-white"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}>
                {t === "all" ? "All Types" : (TYPE_BADGE[t]?.label ?? t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((route) => {
              const badge = TYPE_BADGE[route.type] ?? TYPE_BADGE.private;
              return (
                <Link key={route.id} href={`/transport/routes/${route.id}`}
                  className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 hover:border-sky-500/40 hover:bg-slate-800 transition-all">

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ backgroundColor: route.color }}>
                        <Bus className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-mono text-xs text-slate-500">{route.id}</p>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h2 className="font-black text-slate-100 group-hover:text-sky-400 transition-colors leading-tight text-sm">
                          {route.operator}
                        </h2>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">Single Fare</p>
                      <p className="text-xl font-black text-emerald-400">৳{route.fare?.single}</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: route.color }} />
                    <span className="text-slate-300 font-bold truncate">{route.from}</span>
                    <span className="text-slate-600 shrink-0">→</span>
                    <span className="text-slate-300 font-bold truncate">{route.to}</span>
                  </div>

                  {/* Stops preview */}
                  {route.stops?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {route.stops.slice(0, 5).map((s: string) => (
                        <span key={s} className="rounded-md bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-400">{s}</span>
                      ))}
                      {route.stops.length > 5 && (
                        <span className="rounded-md bg-slate-700/40 px-2 py-0.5 text-[10px] text-slate-500">
                          +{route.stops.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{route.durationMin} min</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {route.distance} km</span>
                    <span className="flex items-center gap-1"><Bus className="h-3 w-3" /> {route.stops?.length} stops</span>
                    {route.hours && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Zap className="h-3 w-3" /> {route.hours}
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-1 text-sky-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Details <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <Bus className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="font-bold text-lg">No routes match "{search}"</p>
            <p className="text-sm mt-1">Try a stop name, operator name, or clear the search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
