"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  Bus, MapPin, Clock, Search, ChevronRight,
  Loader2, Navigation, Zap, Wind,
} from "lucide-react";

const DIVISIONS = ["All", "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];

const TYPE_BADGE: Record<string, { label: string; cls: string; icon: typeof Zap }> = {
  ac:      { label: "AC",      cls: "bg-sky-500/20 text-sky-300 border-sky-500/30",          icon: Zap },
  "non-ac":{ label: "Non-AC",  cls: "bg-slate-500/20 text-slate-300 border-slate-600/30",    icon: Wind },
};

const DIV_COLOR: Record<string, string> = {
  Rajshahi:   "#8b5cf6", Chattogram: "#059669", Sylhet: "#16a34a",
  Khulna:     "#0891b2", Barishal:   "#be123c", Rangpur: "#0369a1",
  Mymensingh: "#4f46e5", Dhaka:      "#0ea5e9",
};

export default function IntercityPage() {
  const [routes, setRoutes]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [division, setDivision]   = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    api.get("/transport/intercity")
      .then((r) => setRoutes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.operator?.toLowerCase().includes(q) ||
      r.from?.toLowerCase().includes(q) ||
      r.to?.toLowerCase().includes(q) ||
      r.via?.some((v: string) => v.toLowerCase().includes(q)) ||
      r.stops?.some((s: string) => s.toLowerCase().includes(q));
    const matchDiv  = division === "All" || r.division === division;
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchDiv && matchType;
  });

  // Group by destination division for display
  const byDivision: Record<string, any[]> = {};
  filtered.forEach((r) => {
    const key = r.division ?? "Other";
    if (!byDivision[key]) byDivision[key] = [];
    byDivision[key].push(r);
  });

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/40">
                <Navigation className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Bangladesh</p>
                <h1 className="text-2xl font-black text-white">
                  Intercity Bus Routes
                  {!loading && <span className="ml-2 text-sm font-bold text-slate-500">({filtered.length} of {routes.length})</span>}
                </h1>
              </div>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search operator, city, or stop…"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Division filter */}
          <div className="flex flex-wrap gap-2 mb-3">
            {DIVISIONS.map((d) => (
              <button key={d} onClick={() => setDivision(d)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                  division === d
                    ? "text-white border-transparent"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
                style={division === d ? { backgroundColor: DIV_COLOR[d] ?? "#0ea5e9", borderColor: DIV_COLOR[d] ?? "#0ea5e9" } : {}}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-2">
            {["all", "ac", "non-ac"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase transition-all ${
                  typeFilter === t
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}>
                {t === "all" ? "All Classes" : t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Bus className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="font-bold text-lg">No routes match your search</p>
            <p className="text-sm mt-1">Try clearing filters or searching a different city.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(byDivision).map(([div, divRoutes]) => (
              <section key={div}>
                {/* Division heading */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: DIV_COLOR[div] ?? "#64748b" }} />
                  <h2 className="text-lg font-black text-white">{div} Division</h2>
                  <span className="text-xs font-bold text-slate-500">{divRoutes.length} route{divRoutes.length > 1 ? "s" : ""}</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {divRoutes.map((route) => {
                    const badge = TYPE_BADGE[route.type] ?? TYPE_BADGE["non-ac"];
                    const BadgeIcon = badge.icon;
                    return (
                      <Link key={route.id} href={`/transport/intercity/${route.id}`}
                        className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 hover:border-emerald-500/40 hover:bg-slate-800 transition-all">

                        {/* Top */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                              style={{ backgroundColor: route.color }}>
                              <Bus className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>
                                  <BadgeIcon className="h-2.5 w-2.5" /> {badge.label}
                                </span>
                                <span className="font-mono text-xs text-slate-600">{route.id}</span>
                              </div>
                              <h3 className="font-black text-slate-100 group-hover:text-emerald-400 transition-colors text-sm leading-tight">
                                {route.operator}
                              </h3>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-slate-500">From</p>
                            <p className="text-xl font-black text-emerald-400">৳{route.fare?.single}</p>
                            {route.fare?.ac && (
                              <p className="text-xs text-sky-400 font-bold">AC ৳{route.fare.ac}</p>
                            )}
                          </div>
                        </div>

                        {/* Route line */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-slate-400" />
                            <span className="font-black text-slate-200 text-sm">{route.from}</span>
                          </div>
                          <div className="flex-1 flex items-center gap-1 mx-2">
                            <div className="h-px flex-1 border-t border-dashed border-slate-600" />
                            {route.via?.slice(0, 2).map((v: string) => (
                              <span key={v} className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-400 whitespace-nowrap">{v}</span>
                            ))}
                            {route.via?.length > 2 && (
                              <span className="text-[10px] text-slate-600">+{route.via.length - 2}</span>
                            )}
                            <div className="h-px flex-1 border-t border-dashed border-slate-600" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-emerald-400" />
                            <span className="font-black text-emerald-300 text-sm">{route.to}</span>
                          </div>
                        </div>

                        {/* Footer stats */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{Math.round(route.durationMin / 60)}h {route.durationMin % 60}m</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {route.distance} km</span>
                          <span className="flex items-center gap-1"><Bus className="h-3 w-3" /> {route.stops?.length} stops</span>
                          <span className="text-slate-600 text-[10px]">{route.hours}</span>
                          <span className="ml-auto flex items-center gap-1 text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Details <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
