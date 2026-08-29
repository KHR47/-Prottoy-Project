"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import { Navigation, Bus, Clock, MapPin, ArrowRight, Loader2, Ticket } from "lucide-react";

export default function TripPlannerPage() {
  const [mode, setMode] = useState<"city" | "intercity">("city");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Dynamic stops lists from backend
  const [cityStops, setCityStops] = useState<string[]>([]);
  const [intercityStops, setIntercityStops] = useState<string[]>([]);

  useEffect(() => {
    // Load city routes to extract stops
    api.get("/transport/routes")
      .then((res) => {
        const stopsSet = new Set<string>();
        res.data.forEach((r: any) => {
          r.stops?.forEach((s: string) => stopsSet.add(s));
        });
        setCityStops(Array.from(stopsSet).sort());
      })
      .catch(console.error);

    // Load intercity routes to extract stops
    api.get("/transport/intercity")
      .then((res) => {
        const stopsSet = new Set<string>();
        res.data.forEach((r: any) => {
          stopsSet.add(r.from);
          stopsSet.add(r.to);
          r.stops?.forEach((s: string) => stopsSet.add(s));
        });
        setIntercityStops(Array.from(stopsSet).sort());
      })
      .catch(console.error);
  }, []);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    try {
      const endpoint = mode === "city" 
        ? `/transport/plan?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        : `/transport/intercity/plan?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const res = await api.get(endpoint);
      setResult(res.data);
    } catch { 
      setResult({ routes: [], message: "Could not plan trip." }); 
    } finally { 
      setLoading(false); 
    }
  };

  const activeStops = mode === "city" ? cityStops : intercityStops;
  const popularStops = mode === "city" 
    ? ["Mirpur 10", "Farmgate", "Motijheel", "Uttara", "Mohakhali", "Gulistan"]
    : ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal"];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/40">
                <Navigation className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Smart Travel</p>
                <h1 className="text-2xl font-black text-white">Trip Planner</h1>
              </div>
            </div>
            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => { setMode("city"); setFrom(""); setTo(""); setResult(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "city" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Dhaka City
              </button>
              <button
                type="button"
                onClick={() => { setMode("intercity"); setFrom(""); setTo(""); setResult(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "intercity" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Intercity (Bangladesh)
              </button>
            </div>
          </div>
          
          <form onSubmit={handlePlan} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                  <input 
                    list="stops" 
                    value={from} 
                    onChange={(e) => setFrom(e.target.value)} 
                    placeholder={mode === "city" ? "e.g. Mirpur 10" : "e.g. Dhaka"}
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-sky-400" />
                  <input 
                    list="stops" 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)} 
                    placeholder={mode === "city" ? "e.g. Motijheel" : "e.g. Sylhet"}
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500" 
                  />
                </div>
              </div>
            </div>
            <datalist id="stops">
              {activeStops.map((s) => <option key={s} value={s} />)}
            </datalist>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-white transition disabled:opacity-60">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Navigation className="h-4 w-4" /> Find Best Route</>}
            </button>
          </form>

          {/* Popular stops */}
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Popular Stops ({mode === "city" ? "Dhaka" : "Bangladesh"})</p>
            <div className="flex flex-wrap gap-2">
              {popularStops.map((s) => (
                <button key={s} type="button" onClick={() => !from ? setFrom(s) : setTo(s)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {result && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white">Results</h2>
              <p className="text-sm text-slate-400">{result.message}</p>
            </div>
            {result.routes?.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-10 text-center">
                <Navigation className="mx-auto h-12 w-12 text-slate-700 mb-3" />
                <p className="font-bold text-slate-400">No direct routes found</p>
                <p className="text-sm text-slate-500 mt-1">
                  {mode === "city" 
                    ? "Try nearby stops like Farmgate, Gulistan, or Motijheel as connection points."
                    : "Try nearby division hubs or verify city names."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {result.routes.map((route: any, idx: number) => (
                  <div key={route.id} className={`rounded-2xl border p-5 ${idx === 0 ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-700/50 bg-slate-800/50"}`}>
                    {idx === 0 && <p className="text-xs font-bold text-emerald-400 uppercase mb-2">⭐ Recommended</p>}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black" style={{ backgroundColor: route.color || "#10b981" }}>
                          <Bus className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-mono text-xs text-slate-500">{route.id}</p>
                          <p className="font-black text-slate-100">{route.name || `${route.operator} — ${route.from} ↔ ${route.to}`}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {route.durationMin} min</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {route.distance} km</span>
                            {route.type && <span className="uppercase text-[10px] font-bold text-slate-500 border border-slate-700 rounded px-1">{route.type}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-400">৳{route.fare?.single || route.fare}</p>
                        {mode === "city" ? (
                          <Link href={`/transport/tickets/buy?routeId=${route.id}`}
                            className="mt-2 flex items-center gap-1 text-xs font-bold rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-slate-300 hover:text-white transition">
                            <Ticket className="h-3 w-3" /> Buy Ticket
                          </Link>
                        ) : (
                          <Link href={`/transport/tickets/buy?routeId=${route.id}&category=intercity`}
                            className="mt-2 flex items-center gap-1 text-xs font-bold rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-slate-300 hover:text-white transition">
                            <Ticket className="h-3 w-3" /> Buy Ticket
                          </Link>
                        )}
                      </div>
                    </div>
                    {/* Matching segment / Stops sequence */}
                    <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-400 bg-slate-900/40 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">{from}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-bold text-slate-300">{to}</span>
                      </div>
                      {route.stops && (
                        <p className="text-[10px] text-slate-500 mt-1">Stops: {route.stops.join(" → ")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
