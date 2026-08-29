"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TransportOperatorNavbar } from "@/components/layout/TransportOperatorNavbar";
import { api } from "@/lib/api";
import {
  Ticket, Save, Loader2, Bus, Navigation,
  MapPin, Zap, Wind,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Shared fare row input ─────────────────────────────────────────────────
const numInput = "h-10 w-28 rounded-xl border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 font-mono text-right transition";

// ── City Fare Row ─────────────────────────────────────────────────────────
function CityFareRow({
  route, fares, onChange, saving, onSave,
}: {
  route: any;
  fares: { single: string; pass: string };
  onChange: (field: "single" | "pass", val: string) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 hover:border-slate-600 transition-all">
      {/* Route info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: route.color }}>
          <Bus className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs text-slate-500">{route.id}</p>
          <p className="font-black text-slate-100 truncate text-sm">{route.name}</p>
          <p className="text-xs text-slate-500 truncate">{route.from} → {route.to} · {route.distance} km</p>
        </div>
      </div>
      {/* Inputs */}
      <div className="flex items-end gap-3 shrink-0 flex-wrap">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Single (৳)</label>
          <input type="number" min={0} className={numInput}
            value={fares?.single ?? ""}
            onChange={(e) => onChange("single", e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Monthly Pass (৳)</label>
          <input type="number" min={0} className={numInput}
            value={fares?.pass ?? ""}
            onChange={(e) => onChange("pass", e.target.value)} />
        </div>
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-2 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 px-4 text-sm font-bold text-white shadow shadow-violet-500/20 transition disabled:opacity-50 shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}
        </button>
      </div>
    </div>
  );
}

// ── Intercity Fare Row ────────────────────────────────────────────────────
function IntercityFareRow({
  route, fares, onChange, saving, onSave,
}: {
  route: any;
  fares: { single: string; ac: string };
  onChange: (field: "single" | "ac", val: string) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const isAC = route.type === "ac";
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 hover:border-slate-600 transition-all">
      {/* Route info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: route.color }}>
          <Navigation className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-xs text-slate-500">{route.id}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${isAC ? "bg-sky-500/20 text-sky-300 border-sky-500/30" : "bg-slate-600/30 text-slate-400 border-slate-600/30"}`}>
              {isAC ? <Zap className="h-2.5 w-2.5" /> : <Wind className="h-2.5 w-2.5" />}{route.type?.toUpperCase()}
            </span>
            <span className="text-[9px] text-slate-600 border border-slate-700 rounded-full px-1.5 py-0.5">{route.division}</span>
          </div>
          <p className="font-black text-slate-100 truncate text-sm">{route.operator}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" /> {route.from} → {route.to} · {route.distance} km
          </p>
        </div>
      </div>
      {/* Inputs */}
      <div className="flex items-end gap-3 shrink-0 flex-wrap">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Non-AC Fare (৳)</label>
          <input type="number" min={0} className={numInput}
            value={fares?.single ?? ""}
            onChange={(e) => onChange("single", e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-sky-500 uppercase tracking-wide mb-1">AC Fare (৳)</label>
          <input type="number" min={0} className={`${numInput} focus:border-sky-500 focus:ring-sky-500/20`}
            value={fares?.ac ?? ""}
            onChange={(e) => onChange("ac", e.target.value)} />
        </div>
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-2 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 px-4 text-sm font-bold text-white shadow shadow-violet-500/20 transition disabled:opacity-50 shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function OperatorFaresPage() {
  const [cityRoutes, setCityRoutes] = useState<any[]>([]);
  const [icRoutes, setIcRoutes]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [cityFares, setCityFares]   = useState<Record<string, { single: string; pass: string }>>({});
  const [icFares, setIcFares]       = useState<Record<string, { single: string; ac: string }>>({});
  const [saving, setSaving]         = useState<string | null>(null);
  const [tab, setTab]               = useState<"city" | "intercity">("city");

  useEffect(() => {
    Promise.all([api.get("/transport/routes"), api.get("/transport/intercity")])
      .then(([cr, ir]) => {
        setCityRoutes(cr.data);
        setIcRoutes(ir.data);
        // Init city fares
        const cf: Record<string, { single: string; pass: string }> = {};
        cr.data.forEach((r: any) => { cf[r.id] = { single: String(r.fare?.single ?? ""), pass: String(r.fare?.pass ?? "") }; });
        setCityFares(cf);
        // Init intercity fares
        const ic: Record<string, { single: string; ac: string }> = {};
        ir.data.forEach((r: any) => { ic[r.id] = { single: String(r.fare?.single ?? ""), ac: String(r.fare?.ac ?? "") }; });
        setIcFares(ic);
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const saveCityFare = async (routeId: string) => {
    setSaving(routeId);
    try {
      await api.patch(`/transport/routes/${routeId}`, {
        fare: { single: +cityFares[routeId].single, pass: +cityFares[routeId].pass },
      });
      toast.success(`City fares updated for ${routeId}`);
    } catch { toast.error("Could not update fares."); }
    finally { setSaving(null); }
  };

  const saveIcFare = async (routeId: string) => {
    setSaving(routeId);
    try {
      await api.patch(`/transport/intercity/${routeId}`, {
        fare: { single: +icFares[routeId].single, ac: icFares[routeId].ac ? +icFares[routeId].ac : null },
      });
      toast.success(`Intercity fares updated for ${routeId}`);
    } catch { toast.error("Could not update fares."); }
    finally { setSaving(null); }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <TransportOperatorNavbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/40">
              <Ticket className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Payment Received</p>
              <h1 className="text-2xl font-black text-white">Fare Management</h1>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 rounded-2xl border border-slate-700 bg-slate-800/80 p-1 w-fit">
            <button onClick={() => setTab("city")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-all ${tab === "city" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
              <Bus className="h-4 w-4" /> City Routes
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{cityRoutes.length}</span>
            </button>
            <button onClick={() => setTab("intercity")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-all ${tab === "intercity" ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
              <Navigation className="h-4 w-4" /> Intercity Routes
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{icRoutes.length}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Info banner */}
        <div className={`mb-6 rounded-xl border px-5 py-4 text-sm ${tab === "city" ? "border-sky-500/20 bg-sky-500/5 text-sky-300" : "border-violet-500/20 bg-violet-500/5 text-violet-300"}`}>
          {tab === "city"
            ? "🚌  Set single-journey and monthly pass fares for city bus routes. Changes apply immediately to new ticket purchases."
            : "🧭  Set Non-AC and AC coach fares for intercity routes. Leave AC fare empty if the route doesn't offer AC service."}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
        ) : tab === "city" ? (
          <div className="space-y-3">
            {cityRoutes.map((route) => (
              <CityFareRow
                key={route.id}
                route={route}
                fares={cityFares[route.id] ?? { single: "", pass: "" }}
                onChange={(field, val) => setCityFares((f) => ({ ...f, [route.id]: { ...f[route.id], [field]: val } }))}
                saving={saving === route.id}
                onSave={() => saveCityFare(route.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {icRoutes.map((route) => (
              <IntercityFareRow
                key={route.id}
                route={route}
                fares={icFares[route.id] ?? { single: "", ac: "" }}
                onChange={(field, val) => setIcFares((f) => ({ ...f, [route.id]: { ...f[route.id], [field]: val } }))}
                saving={saving === route.id}
                onSave={() => saveIcFare(route.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
