"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Loader2, DollarSign, TrendingUp, AlertTriangle, Save, Clock } from "lucide-react";

export default function OperatorPricingPage() {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    api.get("/parking/lots").then(r => setLots(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (lotId: number, hourlyRate: number) => {
    setSaving(lotId);
    try {
      await api.patch(`/parking/lots/${lotId}`, { hourlyRate });
      alert("Pricing updated successfully");
    } catch (e) {
      alert("Failed to update pricing");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return (
     <div className="min-h-screen bg-[#0f1117]">
        <Navbar />
        <div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-teal-500" /></div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white">Pricing Management</h1>
            <p className="mt-2 text-slate-400">Set hourly rates and manage peak pricing rules for all your parking lots.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 px-4 py-2">
             <TrendingUp className="h-5 w-5 text-teal-400" />
             <span className="text-sm font-bold text-teal-400">Dynamic Pricing Enabled</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
           <div className="lg:col-span-2 space-y-6">
             <h2 className="text-xl font-bold text-white mb-4">Base Hourly Rates</h2>
             {lots.map(lot => (
                <PricingCard key={lot.id} lot={lot} onSave={handleSave} saving={saving === lot.id} />
             ))}
             {lots.length === 0 && <p className="text-slate-500">No parking lots found.</p>}
           </div>

           <div className="space-y-6">
             <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                   <AlertTriangle className="h-6 w-6 text-amber-400" />
                   <h3 className="text-lg font-black text-white">Peak Pricing Rules</h3>
                </div>
                <p className="text-sm text-slate-400 mb-6">Automatically increase hourly rates when occupancy is high to manage demand.</p>
                
                <div className="space-y-4">
                   <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-slate-200">&gt; 80% Occupancy</span>
                         <span className="text-sm font-black text-amber-400">+20% Rate</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-amber-400 w-[80%]" /></div>
                   </div>
                   <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-slate-200">&gt; 95% Occupancy</span>
                         <span className="text-sm font-black text-rose-400">+50% Rate</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-rose-400 w-[95%]" /></div>
                   </div>
                </div>
                <button className="mt-6 w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
                   Configure Rules
                </button>
             </div>

             <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                   <Clock className="h-6 w-6 text-sky-400" />
                   <h3 className="text-lg font-black text-white">Time-based Pricing</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">Set different rates for night parking or weekends.</p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm">
                   <span className="text-slate-300 font-bold">Night Tariff (10 PM - 6 AM)</span>
                   <span className="text-emerald-400 font-black">-30%</span>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ lot, onSave, saving }: { lot: any, onSave: any, saving: boolean }) {
   const [rate, setRate] = useState(lot.hourlyRate);

   return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col sm:flex-row gap-6 justify-between items-center">
         <div>
            <h3 className="text-xl font-black text-white">{lot.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{lot.location} · {lot.totalSlots} Slots</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="relative">
               <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
               <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))}
                  className="w-32 rounded-2xl border border-slate-700 bg-slate-800 py-3 pl-12 pr-4 text-white font-black focus:border-teal-500 focus:ring-0" />
            </div>
            <span className="text-slate-500 font-bold">/ hr</span>
            <button onClick={() => onSave(lot.id, rate)} disabled={saving || rate === lot.hourlyRate}
               className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50">
               {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save
            </button>
         </div>
      </div>
   );
}
