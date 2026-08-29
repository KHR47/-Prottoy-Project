"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import { MapPin, Search, Car, Loader2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function FindParkingPage() {
  const { t, isBangla } = useLanguage();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/parking/lots").then(r => setLots(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = lots.filter(l => {
    const q = l.name?.toLowerCase().includes(searchQuery.toLowerCase()) || l.location?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "available") return q && l.availableSlots > 0;
    return q;
  });

  const pct = (l: any) => l.totalSlots > 0 ? Math.round(((l.totalSlots - l.availableSlots) / l.totalSlots) * 100) : 0;
  const barColor = (p: number) => p >= 90 ? "bg-rose-500" : p >= 60 ? "bg-amber-500" : "bg-emerald-500";
  const badgeColor = (p: number) => p >= 90 ? "bg-rose-500/20 text-rose-300" : p >= 60 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300";

  const totalAvail = lots.reduce((s, l) => s + l.availableSlots, 0);

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--bg-background)" }}>
      <Navbar />
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-950 to-cyan-950 py-20 border-b border-white/10">
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-teal-300 border border-white/10">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
            {isBangla ? `${totalAvail.toLocaleString("bn-BD")} টি পার্কিং স্লট বর্তমানে খালি` : `${totalAvail} slots available now`}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {t.parking.findParking}
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            {isBangla ? "রিয়েল-টাইম লাইডার সেন্সর ট্র্যাকিং সহ খালি পার্কিং স্লট খুঁজুন ও বুক করুন।" : "Locate, reserve, and park across the city in seconds."}
          </p>
          <div className="mt-8 mx-auto max-w-2xl relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder={isBangla ? "এলাকা বা পার্কিং সেন্টারের নাম লিখুন..." : "Search by area or parking hub name..."}
              className="w-full rounded-2xl border border-white/20 bg-slate-900/90 py-4 pl-14 pr-6 text-white shadow-2xl text-base font-medium focus:ring-4 focus:ring-teal-500/20 outline-none backdrop-blur-xl"
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {[
              { k: "all", l: isBangla ? "সকল পার্কিং হাব" : "All Lots" }, 
              { k: "available", l: isBangla ? "বর্তমানে খালি আছে" : "Available Now" }
            ].map(f => (
              <button 
                key={f.k} 
                onClick={() => setFilter(f.k)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${filter === f.k ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-teal-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 border border-white/10">
              <Car className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-white">{isBangla ? "কোন পার্কিং পাওয়া যায়নি" : "No parking lots found"}</h3>
            <p className="text-slate-400">{isBangla ? "অনুসন্ধান পরিবর্তন করে আবার চেষ্টা করুন।" : "Try adjusting your search criteria."}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(lot => {
              const p = pct(lot);
              return (
                <div key={lot.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/50 hover:shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{lot.name}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                          {lot.location}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeColor(p)}`}>
                        {isBangla ? `${(100 - p).toLocaleString("bn-BD")}% খালি` : `${100 - p}% Available`}
                      </span>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>{isBangla ? "অকুপেন্সি রেট" : "Occupancy Rate"}</span>
                        <span>{isBangla ? `${p.toLocaleString("bn-BD")}%` : `${p}%`}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div className={`h-full ${barColor(p)} transition-all duration-500`} style={{ width: `${p}%` }} />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-900/60 p-4 border border-white/5 text-center">
                      <div>
                        <p className="text-xs text-slate-400">{isBangla ? "খালি স্লট" : "Available"}</p>
                        <p className="text-xl font-black text-teal-400">
                          {isBangla ? lot.availableSlots.toLocaleString("bn-BD") : lot.availableSlots}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{isBangla ? "প্রতি ঘণ্টা" : "Hourly Rate"}</p>
                        <p className="text-xl font-black text-white">
                          {isBangla ? `৳ ${lot.hourlyRate.toLocaleString("bn-BD")}` : `৳ ${lot.hourlyRate}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <Link
                      href={`/parking?lotId=${lot.id}`}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-teal-600/20"
                    >
                      {isBangla ? "স্লট দেখুন ও বুক করুন" : "View & Book Slot"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
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
