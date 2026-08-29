"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Settings, Save, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const DEFAULT_TARIFFS = { tier1Rate: 5.5, tier2Rate: 8.0, tier3Rate: 12.0, tier1Limit: 100, tier2Limit: 300, penaltyRate: 20 };

export default function ElectricityTariffsPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [tariffs, setTariffs] = useState(DEFAULT_TARIFFS);

  useEffect(() => {
    if (isReady) {
      const saved = localStorage.getItem("electricity_tariffs");
      if (saved) setTariffs(JSON.parse(saved));
    }
  }, [isReady]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("electricity_tariffs", JSON.stringify(tariffs));
    toast.success("Electricity tariff configuration saved.");
  };

  if (!isReady) return null;

  const sampleUsages = [50, 150, 350, 500];
  const calculateBill = (usage: number) => {
    let base = 0;
    if (usage <= tariffs.tier1Limit) base = usage * tariffs.tier1Rate;
    else if (usage <= tariffs.tier2Limit) base = tariffs.tier1Limit * tariffs.tier1Rate + (usage - tariffs.tier1Limit) * tariffs.tier2Rate;
    else base = tariffs.tier1Limit * tariffs.tier1Rate + (tariffs.tier2Limit - tariffs.tier1Limit) * tariffs.tier2Rate + (usage - tariffs.tier2Limit) * tariffs.tier3Rate;
    return Math.round(base);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-yellow-400">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-yellow-700">Configuration</p>
            <h1 className="text-3xl font-black text-slate-950">Electricity Tariff Management</h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <form onSubmit={handleSave} className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /> Tiered Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tier 1 Rate (৳/kWh)</label>
                <p className="text-xs text-slate-500 mb-2">First {tariffs.tier1Limit} kWh</p>
                <input type="number" step="0.1" min="0" value={tariffs.tier1Rate}
                  onChange={(e) => setTariffs({ ...tariffs, tier1Rate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tier 1 Limit (kWh)</label>
                <p className="text-xs text-slate-500 mb-2">Up to this usage</p>
                <input type="number" min="0" value={tariffs.tier1Limit}
                  onChange={(e) => setTariffs({ ...tariffs, tier1Limit: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tier 2 Rate (৳/kWh)</label>
                <p className="text-xs text-slate-500 mb-2">{tariffs.tier1Limit}–{tariffs.tier2Limit} kWh</p>
                <input type="number" step="0.1" min="0" value={tariffs.tier2Rate}
                  onChange={(e) => setTariffs({ ...tariffs, tier2Rate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tier 2 Limit (kWh)</label>
                <p className="text-xs text-slate-500 mb-2">Up to this usage</p>
                <input type="number" min="0" value={tariffs.tier2Limit}
                  onChange={(e) => setTariffs({ ...tariffs, tier2Limit: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tier 3 Rate (৳/kWh)</label>
                <p className="text-xs text-slate-500 mb-2">Above {tariffs.tier2Limit} kWh (peak)</p>
                <input type="number" step="0.1" min="0" value={tariffs.tier3Rate}
                  onChange={(e) => setTariffs({ ...tariffs, tier3Rate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Over-Limit Penalty (৳/kWh)</label>
                <p className="text-xs text-slate-500 mb-2">Per kWh above max limit</p>
                <input type="number" step="0.5" min="0" value={tariffs.penaltyRate}
                  onChange={(e) => setTariffs({ ...tariffs, penaltyRate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 text-sm font-bold text-white hover:bg-yellow-600 transition shadow-sm">
                <Save className="h-4 w-4" /> Save Configuration
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-4">Bill Preview</h2>
            <p className="text-xs text-slate-500 mb-4">Sample bills at current tariff rates:</p>
            <div className="space-y-3">
              {sampleUsages.map((usage) => (
                <div key={usage} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">{usage} kWh</span>
                  <span className="font-mono font-black text-yellow-700">৳{calculateBill(usage).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="space-y-2 text-xs text-slate-600">
                <p className="flex justify-between"><span>Tier 1 (0–{tariffs.tier1Limit} kWh)</span><span className="font-bold">৳{tariffs.tier1Rate}/kWh</span></p>
                <p className="flex justify-between"><span>Tier 2 ({tariffs.tier1Limit}–{tariffs.tier2Limit} kWh)</span><span className="font-bold">৳{tariffs.tier2Rate}/kWh</span></p>
                <p className="flex justify-between"><span>Tier 3 ({tariffs.tier2Limit}+ kWh)</span><span className="font-bold">৳{tariffs.tier3Rate}/kWh</span></p>
                <p className="flex justify-between text-rose-600"><span>Over-limit penalty</span><span className="font-bold">৳{tariffs.penaltyRate}/kWh</span></p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
