"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { FileText, Calculator, Send, CheckCircle, Loader2, DollarSign, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function BillingSystemPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [meters, setMeters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Local state to track which invoices have been "issued" during this session
  const [issuedInvoices, setIssuedInvoices] = useState<Record<string, boolean>>({});

  // Dynamic configuration state
  const [config, setConfig] = useState({
    tier1Limit: 500,
    tier1Rate: 0.2,
    tier2Limit: 1000,
    tier2Rate: 0.3,
    tier3Rate: 0.5,
    penaltyFee: 500
  });

  useEffect(() => {
    if (isReady) {
      // Load custom tariff configuration if available
      const savedConfig = localStorage.getItem("water_tariff_config");
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }

      const fetchMeters = async () => {
        try {
          const res = await api.get("/water/meters");
          setMeters(res.data.filter((m: any) => m.status === 'active'));
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMeters();
    }
  }, [isReady]);

  // Pricing Engine using dynamic configuration
  const calculateBill = (reading: number, maxLimit?: number) => {
    let amount = 0;
    let base = 0;

    if (reading <= config.tier1Limit) {
      base = reading * config.tier1Rate;
    } else if (reading <= config.tier2Limit) {
      base = (config.tier1Limit * config.tier1Rate) + ((reading - config.tier1Limit) * config.tier2Rate);
    } else {
      // High Tier usage
      base = (config.tier1Limit * config.tier1Rate) + 
             ((config.tier2Limit - config.tier1Limit) * config.tier2Rate) + 
             ((reading - config.tier2Limit) * config.tier3Rate);
    }

    // Apply Over-limit penalty
    let penalty = 0;
    if (maxLimit && reading > maxLimit) {
      penalty = config.penaltyFee;
    }

    return {
      base: Math.round(base),
      penalty,
      total: Math.round(base + penalty)
    };
  };

  const handleIssueInvoice = async (meterId: string, amount: number, breakdown: any) => {
    try {
      await api.post(`/water/meters/${meterId}/invoice`, { amount, breakdown });
      toast.success(`Invoice for ৳${amount} sent to ${meterId}`);
      // Refresh meters
      const res = await api.get("/water/meters");
      setMeters(res.data.filter((m: any) => m.status === 'active'));
    } catch (err) {
      toast.error("Failed to issue invoice");
      console.error(err);
    }
  };

  if (!isReady) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  // Calculate metrics
  let totalPendingRevenue = 0;
  let totalVolume = 0;
  
  const billingData = meters.map(m => {
    const usage = m.lastReading || 0;
    const bill = calculateBill(usage, m.maxLimit);
    
    if (!m.pendingInvoice) {
      totalPendingRevenue += bill.total;
    }
    totalVolume += usage;
    
    return { ...m, usage, bill };
  });

  const issuedCount = meters.filter(m => m.pendingInvoice).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
              <Calculator className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold uppercase text-emerald-600">Finance Hub</p>
          </div>
          <h1 className="text-3xl font-black text-slate-950">Automated Billing System</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Calculate consumption costs using the tiered pricing engine, apply over-limit penalties, and issue monthly digital invoices to citizens.
          </p>
        </div>

        {/* KPIs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Projected Payment Received (Unbilled)</p>
              <p className="text-3xl font-black text-slate-900">৳{totalPendingRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Total Billable Volume</p>
              <p className="text-3xl font-black text-slate-900">{totalVolume.toLocaleString()} L</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Invoices Issued</p>
              <p className="text-3xl font-black text-slate-900">{issuedCount}</p>
            </div>
          </div>
        </div>

        {/* Billing Table */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Current Cycle Invoices</h3>
              <p className="text-sm text-slate-500 mt-1">Tier 1: {config.tier1Rate}৳/L | Tier 2: {config.tier2Rate}৳/L | Penalty: {config.penaltyFee}৳</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg border border-slate-300 transition">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Meter / Citizen</th>
                  <th className="px-6 py-4 font-semibold">Usage (L)</th>
                  <th className="px-6 py-4 font-semibold text-right">Base Charge</th>
                  <th className="px-6 py-4 font-semibold text-right">Penalty</th>
                  <th className="px-6 py-4 font-semibold text-right">Total (BDT)</th>
                  <th className="px-6 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billingData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No active meters available for billing.
                    </td>
                  </tr>
                ) : (
                  billingData.map((data) => {
                    const isIssued = !!data.pendingInvoice;
                    return (
                      <tr key={data.id} className={`transition-colors ${isIssued ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                        <td className="px-6 py-4">
                          <p className="font-mono font-bold text-slate-900">{data.id}</p>
                          <p className="text-slate-500">{data.citizenName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-700">{data.usage} L</span>
                          <p className="text-xs text-slate-400">Limit: {data.maxLimit || 'None'}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-600">
                          ৳{data.bill.base}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {data.bill.penalty > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-xs">
                              + ৳{data.bill.penalty}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-lg font-black ${data.bill.penalty > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                            ৳{data.bill.total}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isIssued ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                              <CheckCircle className="h-4 w-4" /> Issued
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleIssueInvoice(data.id, data.bill.total, data.bill)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition"
                            >
                              <Send className="h-4 w-4" /> Issue
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
