"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Bus, MapPin, Clock, Ticket, Loader2, Navigation, Car } from "lucide-react";

// Simulates GPS-like location updates for the driver's assigned vehicle
function useLocationSimulator(vehicleId: string | null) {
  const [location, setLocation] = useState({ lat: 23.8103, lng: 90.4125 });
  useEffect(() => {
    if (!vehicleId) return;
    const interval = setInterval(() => {
      setLocation((l) => ({ lat: l.lat + (Math.random() - 0.5) * 0.002, lng: l.lng + (Math.random() - 0.5) * 0.002 }));
    }, 5000);
    return () => clearInterval(interval);
  }, [vehicleId]);
  return location;
}

export default function DriverDashboardPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);

  const location = useLocationSimulator(selectedVehicle?.id || null);

  useEffect(() => {
    Promise.all([api.get("/transport/vehicles"), api.get("/transport/routes"), api.get("/transport/schedules")])
      .then(([v, r, s]) => { setVehicles(v.data); setRoutes(r.data); setSchedules(s.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  // Broadcast location every 5s when "active"
  useEffect(() => {
    if (!broadcasting || !selectedVehicle) return;
    const id = setInterval(async () => {
      try { await api.patch(`/transport/vehicles/${selectedVehicle.id}/location`, { lat: location.lat, lng: location.lng }); }
      catch { /* silent */ }
    }, 5000);
    return () => clearInterval(id);
  }, [broadcasting, selectedVehicle, location]);

  const route = routes.find((r) => r.id === selectedVehicle?.routeId);
  const mySchedules = schedules.filter((s) => s.vehicleId === selectedVehicle?.id);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/40"><Bus className="h-6 w-6 text-emerald-400" /></div>
            <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Driver Panel</p><h1 className="text-2xl font-black text-white">My Dashboard</h1></div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${broadcasting ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40" : "bg-slate-700 text-slate-400"}`}>
            <span className={`h-2 w-2 rounded-full ${broadcasting ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
            {broadcasting ? "Live Tracking Active" : "Tracking Inactive"}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div> : (
          <div className="space-y-6">
            {/* Vehicle selection */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h2 className="font-black text-white mb-4">Select Your Vehicle</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {vehicles.filter((v) => v.driver || v.status === "on_route").map((v) => {
                  const vRoute = routes.find((r) => r.id === v.routeId);
                  return (
                    <button key={v.id} onClick={() => setSelectedVehicle(v === selectedVehicle ? null : v)}
                      className={`text-left rounded-xl border p-4 transition ${selectedVehicle?.id === v.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-900/40 hover:border-slate-600"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Bus className="h-5 w-5 text-emerald-400" />
                        <span className="font-mono font-bold text-slate-200">{v.id}</span>
                        <span className={`ml-auto text-xs font-bold rounded-full px-2 py-0.5 ${v.status === "on_route" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-600/40 text-slate-400"}`}>{v.status.replace("_", " ")}</span>
                      </div>
                      <p className="text-xs text-slate-400">{v.registration}</p>
                      {vRoute && <p className="text-xs font-bold mt-1" style={{ color: vRoute.color }}>{vRoute.id} — {vRoute.name}</p>}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedVehicle && (
              <>
                {/* Route Info */}
                {route && (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
                    <h2 className="font-black text-white mb-4 flex items-center gap-2"><MapPin className="h-5 w-5" style={{ color: route.color }} /> Assigned Route</h2>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: route.color }}><Bus className="h-5 w-5 text-white" /></div>
                      <div>
                        <p className="font-mono text-xs text-slate-500">{route.id}</p>
                        <p className="font-black text-slate-100">{route.name}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/50 p-4 mb-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-200">{route.from}</span>
                        <div className="flex-1 border-t-2 border-dashed border-slate-600" />
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: route.color }} />
                        <span className="font-bold text-slate-200">{route.to}</span>
                      </div>
                      <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
                        <span>{route.stops?.length} stops</span>
                        <span>{route.distance} km</span>
                        <span>~{route.durationMin} min</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      <span className="font-bold text-slate-400">All stops:</span>
                      {route.stops?.map((s: string, i: number) => <span key={i} className="bg-slate-700 rounded px-2 py-0.5">{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Schedules */}
                {mySchedules.length > 0 && (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
                    <h2 className="font-black text-white mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-amber-400" /> My Schedules</h2>
                    <div className="space-y-3">
                      {mySchedules.map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-900/40 px-4 py-3">
                          <div>
                            <p className="font-mono font-bold text-slate-200">{s.departureTime} → {s.arrivalTime}</p>
                            <div className="flex gap-1 mt-1">{s.days?.map((d: string) => <span key={d} className="rounded bg-slate-700 px-1.5 py-0.5 text-xs font-bold text-slate-400">{d}</span>)}</div>
                          </div>
                          <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-xs font-bold">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Location */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
                  <h2 className="font-black text-white mb-4 flex items-center gap-2"><Navigation className="h-5 w-5 text-sky-400" /> Live Location Broadcast</h2>
                  <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-4 mb-4 font-mono text-sm text-slate-400">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500">LAT:</span> <span className="text-sky-400">{location.lat.toFixed(6)}</span></div>
                      <div><span className="text-slate-500">LNG:</span> <span className="text-sky-400">{location.lng.toFixed(6)}</span></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{broadcasting ? "Broadcasting every 5 seconds..." : "Not broadcasting"}</p>
                  </div>
                  <button onClick={() => setBroadcasting(!broadcasting)}
                    className={`w-full rounded-xl py-3 text-sm font-bold transition ${broadcasting ? "bg-rose-600 hover:bg-rose-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
                    {broadcasting ? "⏹ Stop Broadcast" : "▶ Start Live Broadcast"}
                  </button>
                </div>

                {/* Quick nav to validate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a href="/driver/validate" className="flex items-center justify-between rounded-2xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 p-5 transition group">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20"><Ticket className="h-5 w-5 text-violet-400" /></div>
                      <div><p className="font-black text-white">Ticket Validation</p><p className="text-sm text-slate-400">Scan passenger tickets</p></div>
                    </div>
                    <span className="text-violet-400 font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  <a href="/find" className="flex items-center justify-between rounded-2xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 p-5 transition group">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/20"><Car className="h-5 w-5 text-pink-400" /></div>
                      <div><p className="font-black text-white">Smart Parking</p><p className="text-sm text-slate-400">Find parking spots</p></div>
                    </div>
                    <span className="text-pink-400 font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
