"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TransportOperatorNavbar } from "@/components/layout/TransportOperatorNavbar";
import { api } from "@/lib/api";
import { Map, Bus, RefreshCw, Loader2, Navigation, AlertTriangle } from "lucide-react";

// Simple CSS-based live map (no external map library needed)
function VehicleDot({ vehicle, route }: { vehicle: any; route: any }) {
  // Normalize lat/lng into a rough percentage within Dhaka bounds
  // Dhaka: lat 23.68–23.93, lng 90.32–90.51
  const top = 100 - ((vehicle.lat - 23.68) / (23.93 - 23.68)) * 100;
  const left = ((vehicle.lng - 90.32) / (90.51 - 90.32)) * 100;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
      style={{ top: `${Math.max(2, Math.min(98, top))}%`, left: `${Math.max(2, Math.min(98, left))}%` }}>
      <div className="relative">
        <div className="h-5 w-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
          style={{ backgroundColor: route?.color || "#0ea5e9" }}>
          <Bus className="h-2.5 w-2.5 text-white" />
        </div>
        {vehicle.status === "on_route" && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
        )}
        {/* Tooltip */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 w-44">
          <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 shadow-xl text-xs">
            <p className="font-mono font-bold text-white">{vehicle.id}</p>
            <p className="text-slate-400">{vehicle.registration}</p>
            {route && <p className="font-bold mt-1" style={{ color: route.color }}>{route.id}</p>}
            <p className={`mt-0.5 font-bold capitalize ${vehicle.status === "on_route" ? "text-emerald-400" : "text-amber-400"}`}>{vehicle.status.replace("_", " ")}</p>
            <p className="text-slate-500 mt-1 font-mono text-[10px]">{vehicle.lat?.toFixed(4)}, {vehicle.lng?.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OperatorLiveMapPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [disruptions, setDisruptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string>("all");

  const load = () => {
    Promise.all([api.get("/transport/vehicles"), api.get("/transport/routes"), api.get("/transport/disruptions?status=active")])
      .then(([v, r, d]) => { setVehicles(v.data); setRoutes(r.data); setDisruptions(d.data); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const displayedVehicles = selectedRoute === "all" ? vehicles : vehicles.filter((v) => v.routeId === selectedRoute);
  const onRoute = vehicles.filter((v) => v.status === "on_route").length;

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <TransportOperatorNavbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 ring-1 ring-teal-500/40"><Map className="h-6 w-6 text-teal-400" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Fleet Tracking</p>
              <h1 className="text-2xl font-black text-white">Live Vehicle Map</h1>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Auto-refreshes every 10 seconds</p>
            </div>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Fleet Status</h3>
              <div className="space-y-3">
                {[
                  { label: "On Route", value: onRoute, color: "text-emerald-400" },
                  { label: "In Depot", value: vehicles.filter((v) => v.status === "depot").length, color: "text-slate-400" },
                  { label: "Maintenance", value: vehicles.filter((v) => v.status === "maintenance").length, color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className={`text-xl font-black ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Route filter */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Filter by Route</h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                <button onClick={() => setSelectedRoute("all")}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm font-bold transition ${selectedRoute === "all" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
                  All Routes
                </button>
                {routes.map((r) => (
                  <button key={r.id} onClick={() => setSelectedRoute(r.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs font-bold transition flex items-center gap-2 ${selectedRoute === r.id ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    {r.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Active alerts */}
            {disruptions.length > 0 && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Active Alerts
                </h3>
                <div className="space-y-2">
                  {disruptions.map((d) => (
                    <div key={d.id} className="rounded-lg bg-slate-800/60 px-3 py-2">
                      <p className="text-xs font-bold text-slate-200 truncate">{d.title}</p>
                      <p className="text-xs text-slate-500">{d.routeId} · {d.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map Canvas */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900 overflow-hidden" style={{ height: "600px" }}>
              {/* Map background — stylized Dhaka grid */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

              {/* Dhaka label */}
              <div className="absolute top-4 left-4 rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 backdrop-blur-sm">
                <p className="text-xs font-black text-slate-300 flex items-center gap-1.5"><Navigation className="h-3 w-3 text-teal-400" /> Dhaka City Grid</p>
                <p className="text-xs text-slate-500 font-mono">23.68–23.93°N · 90.32–90.51°E</p>
              </div>

              {/* Compass */}
              <div className="absolute top-4 right-4 rounded-xl bg-slate-800/80 border border-slate-700 w-10 h-10 flex items-center justify-center">
                <p className="text-xs font-black text-slate-400">N</p>
              </div>

              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                </div>
              ) : (
                <>
                  {/* Vehicle dots */}
                  {displayedVehicles.filter((v) => v.lat && v.lng).map((v) => (
                    <VehicleDot key={v.id} vehicle={v} route={routes.find((r) => r.id === v.routeId)} />
                  ))}

                  {displayedVehicles.filter((v) => !v.lat || !v.lng).length === displayedVehicles.length && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm font-bold">
                      No location data. Drivers must start broadcasting.
                    </div>
                  )}
                </>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-slate-800/90 border border-slate-700 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Legend</p>
                <div className="space-y-1.5">
                  {[
                    { color: "bg-emerald-500", label: "On Route", pulse: true },
                    { color: "bg-amber-500", label: "In Depot / Maintenance", pulse: false },
                  ].map(({ color, label, pulse }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className={`relative h-3 w-3 rounded-full ${color}`}>
                        {pulse && <span className={`absolute inset-0 rounded-full ${color} animate-ping opacity-75`} />}
                      </span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle count badge */}
              <div className="absolute bottom-4 right-4 rounded-xl bg-slate-800/90 border border-slate-700 px-4 py-2 backdrop-blur-sm">
                <p className="text-xs text-slate-500">Showing</p>
                <p className="text-xl font-black text-teal-400">{displayedVehicles.filter((v) => v.lat && v.lng).length} <span className="text-sm text-slate-500 font-bold">vehicles</span></p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
