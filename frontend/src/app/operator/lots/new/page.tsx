"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OperatorNewLotPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
    description: "",
    hourlyRate: "",
    peakRate: "",
    floors: "1",
    zones: "A",
    openTime: "06:00",
    closeTime: "23:00",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/parking/lots", {
        ...form,
        hourlyRate: Number(form.hourlyRate),
        peakRate: Number(form.peakRate) || 0,
        floors: Number(form.floors) || 1,
      });
      router.push("/operator/lots");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create lot");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/operator/lots" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300">
          <ArrowLeft className="h-4 w-4" /> Back to Lots
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <MapPin className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Create Parking Lot</h1>
            <p className="text-slate-400">Define a new parking facility.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">General Info</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Lot Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-0" 
                  placeholder="e.g. Banani Square" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Location/Area *</label>
                <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-0" 
                  placeholder="e.g. Banani" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Full Address</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-0" 
                  placeholder="e.g. Road 11, Block C, Banani" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-0" 
                  placeholder="Any extra info..." />
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2 mt-8">Configuration & Pricing</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Number of Floors</label>
                <input type="number" min="1" value={form.floors} onChange={e => setForm({...form, floors: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-teal-500 focus:ring-0" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Zones (Comma separated)</label>
                <input value={form.zones} onChange={e => setForm({...form, zones: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-teal-500 focus:ring-0" 
                  placeholder="e.g. A, B, C" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Hourly Rate (৳) *</label>
                <input type="number" min="0" required value={form.hourlyRate} onChange={e => setForm({...form, hourlyRate: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-teal-500 focus:ring-0" 
                  placeholder="50" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Peak Hourly Rate (৳)</label>
                <input type="number" min="0" value={form.peakRate} onChange={e => setForm({...form, peakRate: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-teal-500 focus:ring-0" 
                  placeholder="70" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Open Time</label>
                <input type="time" value={form.openTime} onChange={e => setForm({...form, openTime: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-teal-500 focus:ring-0" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Close Time</label>
                <input type="time" value={form.closeTime} onChange={e => setForm({...form, closeTime: e.target.value})}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-teal-500 focus:ring-0" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/operator/lots" className="flex-1 text-center rounded-2xl border border-slate-700 py-4 font-bold text-slate-300 hover:bg-slate-800 transition-all">
              Cancel
            </Link>
            <button type="submit" disabled={submitting}
              className="flex-1 rounded-2xl bg-teal-600 py-4 font-black text-white hover:bg-teal-500 transition-all disabled:opacity-50">
              {submitting ? "Creating..." : "Create Parking Lot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
