"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Search, Car, CheckCircle, XCircle, Loader2, ArrowLeft, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function AttendantScanPage() {
  const [query, setQuery] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [allActive, setAllActive] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setBooking(null);
    setMessage(null);
    try {
      const res = await api.get("/parking/attendant/active-bookings");
      const found = res.data.find((b: any) =>
        b.vehicleNumber?.toLowerCase().includes(query.toLowerCase()) ||
        String(b.id) === query.trim()
      );
      if (found) setBooking(found);
      else setMessage({ text: "No active booking found for this plate/ID.", type: "error" });
      setAllActive(res.data);
    } catch (e: any) {
      setMessage({ text: "Search failed. Try again.", type: "error" });
    } finally { setLoading(false); }
  };

  const handleLoadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/parking/attendant/active-bookings");
      setAllActive(res.data);
      setShowAll(true);
    } catch { } finally { setLoading(false); }
  };

  const handleCheckIn = async (id: number) => {
    setProcessing(true);
    try {
      await api.post(`/parking/check-in/${id}`);
      setMessage({ text: "✓ Vehicle checked in successfully!", type: "success" });
      setBooking(null); setQuery("");
    } catch (e: any) { setMessage({ text: e?.response?.data?.message || "Check-in failed", type: "error" }); }
    finally { setProcessing(false); }
  };

  const handleCheckOut = async (id: number) => {
    setProcessing(true);
    try {
      const res = await api.post(`/parking/check-out/${id}`);
      setMessage({ text: `✓ Exit processed. Fee: ৳${res.data.totalFee}`, type: "success" });
      setBooking(null); setQuery("");
    } catch (e: any) { setMessage({ text: e?.response?.data?.message || "Check-out failed", type: "error" }); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link href="/attendant/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <h1 className="text-4xl font-black text-white mb-2">Scan & Park</h1>
        <p className="text-slate-400 mb-8">Search by vehicle plate number or booking ID to process entry or exit.</p>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <input type="text" placeholder="Plate number or booking ID…" value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 text-slate-200 placeholder-slate-500 text-base focus:border-teal-500 focus:ring-0" />
          <button onClick={handleSearch} disabled={loading}
            className="rounded-2xl bg-teal-600 px-6 py-4 font-black text-white hover:bg-teal-500 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 rounded-2xl p-4 text-sm font-bold flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
            {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        {/* Booking Card */}
        {booking && (
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${booking.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                <Car className="h-8 w-8" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{booking.vehicleNumber}</p>
                <p className="text-sm text-slate-400">Booking #{booking.id}</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {[
                { label: "Status", value: booking.status.toUpperCase(), icon: CheckCircle },
                { label: "Slot", value: `${booking.parkingSlot?.parkingLot?.name} · Slot ${booking.parkingSlot?.slotNumber}`, icon: MapPin },
                { label: "Customer", value: booking.user?.name || "—", icon: Car },
                { label: "Booked At", value: new Date(booking.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" }), icon: Clock },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3">
                  <item.icon className="h-4 w-4 text-slate-500" />
                  <span className="text-xs text-slate-500 w-20 shrink-0">{item.label}</span>
                  <span className="text-sm font-bold text-slate-200">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setBooking(null); setQuery(""); }}
                className="flex-1 rounded-2xl border border-slate-700 py-3 text-sm font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-all">
                Clear
              </button>
              {booking.status === "pending" && (
                <button onClick={() => handleCheckIn(booking.id)} disabled={processing}
                  className="flex-1 rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-500 transition-all disabled:opacity-50">
                  {processing ? "Processing…" : "✓ Confirm Entry"}
                </button>
              )}
              {booking.status === "active" && (
                <button onClick={() => handleCheckOut(booking.id)} disabled={processing}
                  className="flex-1 rounded-2xl bg-slate-600 py-3 text-sm font-black text-white hover:bg-slate-500 transition-all disabled:opacity-50">
                  {processing ? "Processing…" : "→ Process Exit"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Show All Active */}
        {!showAll ? (
          <button onClick={handleLoadAll} className="w-full rounded-2xl border border-slate-700 py-3 text-sm font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-all">
            View All Active Bookings
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{allActive.length} Active Bookings</p>
            {allActive.map((b: any) => (
              <button key={b.id} onClick={() => { setBooking(b); setQuery(b.vehicleNumber); setShowAll(false); }}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left hover:border-teal-500/50 transition-all flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${b.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  <Car className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{b.vehicleNumber}</p>
                  <p className="text-xs text-slate-500">Slot {b.parkingSlot?.slotNumber} · {b.status}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
