"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import { Bus, MapPin, Clock, ArrowLeft, Ticket, ChevronRight, Loader2 } from "lucide-react";

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [route, setRoute] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/transport/routes/${id}`),
      api.get(`/transport/schedules?routeId=${id}`),
    ]).then(([r, s]) => { setRoute(r.data); setSchedules(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>
    </div>
  );

  if (!route) return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-slate-400">Route not found.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-5 transition">
            <ArrowLeft className="h-4 w-4" /> Back to Routes
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: route.color }}>
                <Bus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-mono text-slate-500">{route.id}</p>
                <h1 className="text-2xl font-black text-white">{route.name}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <MapPin className="h-4 w-4" style={{ color: route.color }} />
                  <span>{route.from} → {route.to}</span>
                </div>
              </div>
            </div>
            <Link href={`/transport/tickets/buy?routeId=${route.id}`}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition shadow-lg"
              style={{ backgroundColor: route.color }}>
              <Ticket className="h-4 w-4" /> Buy Ticket
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick info */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Duration", value: `~${route.durationMin} min`, icon: Clock },
            { label: "Distance", value: `${route.distance} km`, icon: MapPin },
            { label: "Stops", value: `${route.stops?.length}`, icon: Bus },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 text-center">
              <Icon className="h-5 w-5 mx-auto mb-2" style={{ color: route.color }} />
              <p className="text-xs text-slate-500 font-bold uppercase">{label}</p>
              <p className="text-xl font-black text-white mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stops timeline */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/40">
              <h2 className="font-black text-white">Route Stops</h2>
              <p className="text-xs text-slate-500 mt-0.5">In order of journey</p>
            </div>
            <div className="p-6">
              <div className="relative">
                {route.stops?.map((stop: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full border-2 border-current flex-shrink-0 mt-0.5 ${i === 0 || i === route.stops.length - 1 ? "bg-current" : "bg-slate-900"}`}
                        style={{ color: route.color }} />
                      {i < route.stops.length - 1 && <div className="w-0.5 h-8 bg-slate-700 mt-1" />}
                    </div>
                    <div className={`pb-6 ${i === route.stops.length - 1 ? "pb-0" : ""}`}>
                      <p className={`font-bold ${i === 0 || i === route.stops.length - 1 ? "text-white text-base" : "text-slate-300 text-sm"}`}>{stop}</p>
                      {(i === 0) && <span className="text-xs text-emerald-400 font-bold">Origin</span>}
                      {(i === route.stops.length - 1) && <span className="text-xs" style={{ color: route.color }}>Terminus</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fares + Schedules */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h3 className="font-black text-white mb-4">Fares</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center rounded-xl bg-slate-900/40 px-4 py-3">
                  <span className="text-sm text-slate-300 font-bold">Single Journey</span>
                  <span className="text-xl font-black text-emerald-400">৳{route.fare?.single}</span>
                </div>
                <div className="flex justify-between items-center rounded-xl bg-slate-900/40 px-4 py-3">
                  <span className="text-sm text-slate-300 font-bold">Monthly Pass</span>
                  <span className="text-xl font-black text-violet-400">৳{route.fare?.pass}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h3 className="font-black text-white mb-4">Schedules</h3>
              {schedules.length === 0 ? (
                <p className="text-slate-500 text-sm">No schedules configured yet.</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-900/40 px-3 py-2.5">
                      <div>
                        <p className="font-mono font-bold text-slate-200 text-sm">{s.departureTime} → {s.arrivalTime}</p>
                        <p className="text-xs text-slate-500">{s.days?.join(', ')}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
