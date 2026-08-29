"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Settings, Save, AlertCircle, TrendingUp, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function GasTariffManagementPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [isSaving, setIsSaving] = useState(false);

  // Form State - Gas uses m3 instead of Liters
  const [tier1Limit, setTier1Limit] = useState(30);
  const [tier1Rate, setTier1Rate] = useState(15.0);
  const [tier2Limit, setTier2Limit] = useState(60);
  const [tier2Rate, setTier2Rate] = useState(20.0);
  const [tier3Rate, setTier3Rate] = useState(30.0);
  const [penaltyFee, setPenaltyFee] = useState(1000);

  useEffect(() => {
    if (isReady) {
      const savedConfig = localStorage.getItem("gas_tariff_config");
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setTier1Limit(config.tier1Limit);
        setTier1Rate(config.tier1Rate);
        setTier2Limit(config.tier2Limit);
        setTier2Rate(config.tier2Rate);
        setTier3Rate(config.tier3Rate);
        setPenaltyFee(config.penaltyFee);
      }
    }
  }, [isReady]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const config = {
      tier1Limit,
      tier1Rate,
      tier2Limit,
      tier2Rate,
      tier3Rate,
      penaltyFee
    };

    setTimeout(() => {
      localStorage.setItem("gas_tariff_config", JSON.stringify(config));
      toast.success("Gas tariff settings updated globally.");
      setIsSaving(false);
    }, 800);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
              <Settings className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold uppercase text-orange-700">System Configuration</p>
          </div>
          <h1 className="text-3xl font-black text-slate-950">Gas Tariff Management</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Configure the city-wide progressive line gas pricing engine. These rates are applied automatically during the billing cycle.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <h2 className="font-bold text-slate-900 text-lg">Progressive Usage Tiers (Cubic Meters)</h2>
              </div>
              <div className="group relative">
                <HelpCircle className="h-5 w-5 text-slate-400 cursor-help" />
                <div className="absolute right-0 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 bottom-full mb-2 shadow-xl">
                  Citizens are billed at progressively higher rates as their gas consumption crosses these thresholds.
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Tier 1 */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Base Tier (Essential Usage)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Usage Limit (m³)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required min="0"
                        value={tier1Limit}
                        onChange={e => setTier1Limit(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">m³</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rate per m³ (BDT)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">৳</div>
                      <input 
                        type="number" 
                        required min="0" step="0.01"
                        value={tier1Rate}
                        onChange={e => setTier1Rate(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 pl-8 pr-4 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Tier 2 */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Middle Tier (Standard Usage)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Usage Limit (m³)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required min={tier1Limit}
                        value={tier2Limit}
                        onChange={e => setTier2Limit(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">m³</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rate per m³ (BDT)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">৳</div>
                      <input 
                        type="number" 
                        required min={tier1Rate} step="0.01"
                        value={tier2Rate}
                        onChange={e => setTier2Rate(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 pl-8 pr-4 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Tier 3 */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">High Tier (Heavy Usage)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Usage Range</label>
                    <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 cursor-not-allowed">
                      Anything above {tier2Limit} m³
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rate per m³ (BDT)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">৳</div>
                      <input 
                        type="number" 
                        required min={tier2Rate} step="0.01"
                        value={tier3Rate}
                        onChange={e => setTier3Rate(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 pl-8 pr-4 py-2.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Penalties */}
          <section className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
            <div className="border-b border-rose-200 bg-rose-50 p-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              <h2 className="font-bold text-rose-900 text-lg">Strict Enforcement Penalties</h2>
            </div>
            <div className="p-6">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-1">Over-Limit Surcharge (Flat Fee)</label>
                <p className="text-xs text-slate-500 mb-3">Applied automatically if a citizen exceeds the specific Max Limit assigned to their meter by an Authority.</p>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">৳</div>
                  <input 
                    type="number" 
                    required min="0"
                    value={penaltyFee}
                    onChange={e => setPenaltyFee(Number(e.target.value))}
                    className="w-full rounded-lg border border-rose-300 pl-8 pr-4 py-2.5 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono text-rose-900" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>Saving Changes...</>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
