"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Car, Clock, MapPin, Loader2, CheckCircle, XCircle, AlertCircle, CreditCard, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function MyBookingsPage() {
  const router = useRouter();
  const { t, isBangla } = useLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState<number | null>(null);

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending:   { label: isBangla ? "অপেক্ষমান" : "Pending",   color: "bg-amber-500/20 text-amber-300",   icon: Clock },
    active:    { label: isBangla ? "সক্রিয়" : "Active",    color: "bg-emerald-500/20 text-emerald-300", icon: CheckCircle },
    completed: { label: isBangla ? "সম্পন্ন" : "Completed", color: "bg-blue-500/20 text-blue-300",     icon: CheckCircle },
    cancelled: { label: isBangla ? "বাতিল" : "Cancelled", color: "bg-slate-500/20 text-slate-400",   icon: XCircle },
    overdue:   { label: isBangla ? "মেয়াদোত্তীর্ণ" : "Overdue",   color: "bg-rose-500/20 text-rose-300",     icon: AlertCircle },
  };

  const load = () => {
    setLoading(true);
    api.get("/parking/my-bookings").then(r => setBookings(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCancel = async (id: number) => {
    if (!confirm(isBangla ? "আপনি কি নিশ্চিতভাবে এই বুকিং বাতিল করতে চান?" : "Cancel this booking?")) return;
    setProcessing(id);
    try { await api.post(`/parking/bookings/${id}/cancel`); load(); }
    catch (e: any) { alert(e?.response?.data?.message || (isBangla ? "ত্রুটি হয়েছে" : "Error")); }
    finally { setProcessing(null); }
  };

  const handlePay = (id: number) => {
    router.push(`/payments?type=booking&id=${id}`);
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleString(isBangla ? "bn-BD" : "en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-white">{t.parking.manageBookings}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isBangla ? "আপনার সমস্ত পার্কিং রিজার্ভেশন ট্র্যাক ও পরিচালনা করুন।" : "Track and manage all your parking reservations."}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { k: "all", l: isBangla ? "সকল বুকিং" : "All Bookings" },
            { k: "pending", l: isBangla ? "অপেক্ষমান" : "Pending" },
            { k: "active", l: isBangla ? "সক্রিয়" : "Active" },
            { k: "completed", l: isBangla ? "সম্পন্ন" : "Completed" },
            { k: "cancelled", l: isBangla ? "বাতিল" : "Cancelled" }
          ].map(f => (
            <button 
              key={f.k} 
              onClick={() => setFilter(f.k)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === f.k ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-12 text-center backdrop-blur-xl">
            <Car className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white">{isBangla ? "কোন বুকিং পাওয়া যায়নি" : "No bookings found"}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {isBangla ? "আপনি এখনও কোন পার্কিং স্লট বুক করেননি।" : "You don't have any parking reservations in this category."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => {
              const cfg = STATUS_CONFIG[b.status] || { label: b.status, color: "bg-slate-800 text-slate-300", icon: Clock };
              const Icon = cfg.icon;
              return (
                <div key={b.id} className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/30">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xl font-black text-teal-400">{b.parkingSlot?.slotNumber}</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${cfg.color}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                        <MapPin className="h-4 w-4 text-teal-400" />
                        {b.parkingLot?.name} — {b.parkingLot?.location}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 font-mono">
                        {isBangla ? "যানবাহন প্লেট: " : "Plate: "}{b.vehiclePlate || "—"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-white">
                        {isBangla ? `৳ ${Number(b.totalAmount || 0).toLocaleString("bn-BD")}` : `৳ ${b.totalAmount}`}
                      </p>
                      <p className="text-xs text-slate-400">{b.paymentStatus === "paid" ? (isBangla ? "পরিশোধিত" : "Paid") : (isBangla ? "বকেয়া" : "Unpaid")}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                    <div>
                      <span>{isBangla ? "শুরুর সময়: " : "Start: "}</span>
                      <strong className="text-slate-200">{formatDate(b.startTime)}</strong>
                      <span className="mx-2">•</span>
                      <span>{isBangla ? "সমাপ্তির সময়: " : "End: "}</span>
                      <strong className="text-slate-200">{formatDate(b.endTime)}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === "pending" && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={processing === b.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-3 py-1.5 transition-all border border-rose-500/20"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          {isBangla ? "বাতিল করুন" : "Cancel"}
                        </button>
                      )}
                      {b.paymentStatus !== "paid" && b.status !== "cancelled" && (
                        <button
                          onClick={() => handlePay(b.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-1.5 transition-all shadow-lg shadow-teal-600/20"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          {isBangla ? "পরিশোধ করুন" : "Pay Now"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
