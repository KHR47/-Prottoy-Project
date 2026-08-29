"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { motion, type Variants } from "framer-motion";
import {
  Car, Clock, CheckCircle, XCircle, Loader2, QrCode, MapPin,
  AlertTriangle, RefreshCw, ParkingCircle, Activity, LayoutGrid,
  ChevronRight, ArrowRight
} from "lucide-react";
import Link from "next/link";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AttendantDashboard() {
  const { isReady, user } = useRequireRole(["attendant"]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [manualPlate, setManualPlate] = useState("");
  const [manualResult, setManualResult] = useState<any>(null);
  const [manualError, setManualError] = useState("");
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/parking/attendant/active-bookings"),
      api.get("/parking/lots"),
    ])
      .then(([b, l]) => { setBookings(b.data); setLots(l.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (isReady) load(); }, [isReady]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
      setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const handleCheckIn = async (id: number) => {
    setProcessing(id);
    try { await api.post(`/parking/check-in/${id}`); load(); }
    catch (e: any) { alert(e?.response?.data?.message || "Check-in failed"); }
    finally { setProcessing(null); }
  };

  const handleCheckOut = async (id: number) => {
    setProcessing(id);
    try { await api.post(`/parking/check-out/${id}`); load(); }
    catch (e: any) { alert(e?.response?.data?.message || "Check-out failed"); }
    finally { setProcessing(null); }
  };

  const handleManualLookup = () => {
    setManualError("");
    setManualResult(null);
    const found = bookings.find(b =>
      b.vehicleNumber?.toLowerCase().includes(manualPlate.toLowerCase())
    );
    if (found) setManualResult(found);
    else setManualError("No active booking found for that plate.");
  };

  const filtered = bookings.filter(b => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = !search || b.vehicleNumber?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pending = bookings.filter(b => b.status === "pending").length;
  const active = bookings.filter(b => b.status === "active").length;

  if (!isReady) return null;

  return (
    <div className="min-h-screen text-slate-100" style={{ background: "var(--bg-base)" }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-[var(--bg-surface)]/60 p-8 sm:p-10 backdrop-blur-xl shadow-2xl"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 shadow-inner">
                <ParkingCircle className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-teal-400 mb-1 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" /> On-Duty Attendant
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {greeting}, {user?.name?.split(" ")[0] || "Attendant"}.
                </h1>
                <p className="mt-2 text-slate-400 max-w-xl leading-relaxed">
                  Manage vehicle entry, exit, and slot status for your assigned parking location.
                </p>
              </div>
            </div>
            
            <div className="flex shrink-0 flex-wrap items-center gap-4">
              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/50 px-5 py-3 backdrop-blur-md">
                <Clock className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Local Time</p>
                  <p className="text-sm font-bold text-slate-200 tabular-nums">{time || "—:—"}</p>
                </div>
              </div>
              <button onClick={load} className="flex h-full items-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 px-5 py-3 font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-lg">
                <RefreshCw className="h-5 w-5" /> Refresh
              </button>
              <Link href="/attendant/scan" className="flex h-full items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20">
                <QrCode className="h-5 w-5" /> Scan & Park
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 gap-4">
              {[
                { label: "Pending Entry", value: pending, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Clock },
                { label: "Parked", value: active, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: Car },
                { label: "Total Bookings", value: bookings.length, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/30", icon: Activity },
              ].map(s => (
                <motion.div key={s.label} variants={item} className="rounded-3xl border border-slate-700/50 bg-[var(--bg-surface)]/60 p-5 backdrop-blur-md text-center transition-transform hover:-translate-y-1">
                  <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${s.border} ${s.bg} ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-bold uppercase tracking-wide mt-1 text-slate-400">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search plate number…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-700/50 bg-[var(--bg-surface)]/60 px-5 py-3 text-sm text-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 backdrop-blur-md"
              />
              <div className="flex rounded-2xl border border-slate-700/50 bg-[var(--bg-surface)]/60 p-1.5 gap-1 backdrop-blur-md">
                {["all", "pending", "active"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`rounded-xl px-5 py-2 text-xs font-bold uppercase transition-all ${filter === f ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking list */}
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-slate-700/50 bg-[var(--bg-surface)]/40 backdrop-blur-md">
                <ParkingCircle className="h-14 w-14 mx-auto mb-4 text-slate-700" />
                <p className="font-bold text-lg text-slate-300">No active bookings</p>
                <p className="text-sm mt-1 text-slate-500">When citizens book a parking slot, they'll appear here.</p>
                <Link href="/attendant/scan" className="inline-flex items-center gap-2 mt-5 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-sm font-bold text-white transition-all shadow-lg">
                  <QrCode className="h-4 w-4" /> Scan & Park
                </Link>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                {filtered.map((b: any) => (
                  <motion.div key={b.id} variants={item} className="rounded-3xl border border-slate-700/50 bg-[var(--bg-surface)]/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-[var(--bg-surface)]/80 hover:shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${b.status === "active" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-amber-500/10 border-amber-500/30 text-amber-500"}`}>
                        <Car className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-white tracking-wide">{b.vehicleNumber}</p>
                        <p className="text-xs flex items-center gap-1 mt-1 text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {b.parkingSlot?.parkingLot?.name ?? "—"} · Slot {b.parkingSlot?.slotNumber ?? "—"}
                          {b.user?.name && ` · ${b.user.name}`}
                        </p>
                        <p className="text-xs mt-1 text-slate-500 font-medium">
                          {b.status === "active" && b.actualCheckIn
                            ? `In: ${new Date(b.actualCheckIn).toLocaleTimeString("en-BD", { timeStyle: "short" })}`
                            : `Booked: ${new Date(b.createdAt).toLocaleTimeString("en-BD", { timeStyle: "short" })}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-16 sm:ml-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${b.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {b.status}
                      </span>
                      {b.status === "pending" && (
                        <button onClick={() => handleCheckIn(b.id)} disabled={processing === b.id} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 shadow-lg">
                          <CheckCircle className="h-4 w-4" /> {processing === b.id ? "…" : "Confirm Entry"}
                        </button>
                      )}
                      {b.status === "active" && (
                        <button onClick={() => handleCheckOut(b.id)} disabled={processing === b.id} className="flex items-center gap-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50">
                          <XCircle className="h-4 w-4 text-slate-400" /> {processing === b.id ? "…" : "Process Exit"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            
            {/* Manual Lookup */}
            <div className="rounded-3xl border border-slate-700/50 bg-[var(--bg-surface)]/60 p-6 backdrop-blur-md">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-teal-500" /> Manual Lookup
              </h3>
              <input type="text" placeholder="Enter license plate…" value={manualPlate} onChange={e => { setManualPlate(e.target.value); setManualResult(null); setManualError(""); }} onKeyDown={e => e.key === "Enter" && handleManualLookup()}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-5 py-3 text-sm text-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 mb-3" />
              <button onClick={handleManualLookup} className="w-full rounded-2xl bg-teal-600 hover:bg-teal-500 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-teal-900/20">
                Look Up Booking
              </button>
              {manualError && <p className="mt-3 text-xs font-medium text-rose-400">{manualError}</p>}
              {manualResult && (
                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800 p-4 space-y-3">
                  <p className="font-black text-lg text-white">{manualResult.vehicleNumber}</p>
                  <p className="text-xs text-slate-400">Slot {manualResult.parkingSlot?.slotNumber} · <span className="uppercase">{manualResult.status}</span></p>
                  <div className="flex gap-2">
                    {manualResult.status === "pending" && <button onClick={() => handleCheckIn(manualResult.id)} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500">Confirm Entry</button>}
                    {manualResult.status === "active" && <button onClick={() => handleCheckOut(manualResult.id)} className="flex-1 rounded-xl bg-slate-600 py-2.5 text-xs font-bold text-white hover:bg-slate-500">Process Exit</button>}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              {[
                { href: "/attendant/scan", icon: QrCode, label: "Scan & Park", desc: "Search by plate or booking ID", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/30", hover: "hover:border-teal-500/50 hover:bg-[var(--bg-surface)]/80" },
                { href: "/attendant/slots", icon: LayoutGrid, label: "Slot Management", desc: "Mark slots as occupied/free", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", hover: "hover:border-blue-500/50 hover:bg-[var(--bg-surface)]/80" },
                { href: "/attendant/violations/new", icon: AlertTriangle, label: "Issue Violation", desc: "Flag overstay or unauthorized", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", hover: "hover:border-rose-500/50 hover:bg-[var(--bg-surface)]/80" },
              ].map(item => (
                <Link key={item.href} href={item.href} className={`group flex items-center gap-4 rounded-3xl border border-slate-700/50 bg-[var(--bg-surface)]/40 p-4 transition-all hover:-translate-y-1 hover:shadow-xl backdrop-blur-md ${item.hover}`}>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${item.bg} transition-transform group-hover:scale-110`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600 opacity-0 transition-all group-hover:opacity-100 group-hover:-translate-x-1" />
                </Link>
              ))}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
