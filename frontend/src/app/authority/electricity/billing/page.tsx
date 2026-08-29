"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Zap, Download, AlertTriangle, Loader2, Receipt } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

const TARIFFS = { tier1Rate: 5.5, tier2Rate: 8.0, tier3Rate: 12.0, tier1Limit: 100, tier2Limit: 300, penaltyRate: 20 };

function calculateBill(usage: number, maxLimit?: number) {
  let base = 0;
  if (usage <= TARIFFS.tier1Limit) base = usage * TARIFFS.tier1Rate;
  else if (usage <= TARIFFS.tier2Limit) base = TARIFFS.tier1Limit * TARIFFS.tier1Rate + (usage - TARIFFS.tier1Limit) * TARIFFS.tier2Rate;
  else base = TARIFFS.tier1Limit * TARIFFS.tier1Rate + (TARIFFS.tier2Limit - TARIFFS.tier1Limit) * TARIFFS.tier2Rate + (usage - TARIFFS.tier2Limit) * TARIFFS.tier3Rate;
  const penalty = maxLimit && usage > maxLimit ? Math.round((usage - maxLimit) * TARIFFS.penaltyRate) : 0;
  return { base: Math.round(base), penalty, total: Math.round(base) + penalty };
}

export default function ElectricityBillingPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [meters, setMeters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      const load = async () => {
        try {
          const res = await api.get("/electricity/meters");
          setMeters(res.data.filter((m: any) => m.status === "active"));
        } catch (err: any) {
          if (err?.code !== "ERR_NETWORK") console.error(err);
        } finally { setLoading(false); }
      };
      load();
    }
  }, [isReady]);

  const handleExportCSV = () => {
    if (meters.length === 0) { toast.error("No billing data to export."); return; }
    const headers = ["Meter ID", "Citizen Name", "Zone", "Usage (kWh)", "Max Limit (kWh)", "Base Charge (BDT)", "Penalty (BDT)", "Total (BDT)", "Status"];
    const rows = meters.map((m) => {
      const bill = calculateBill(m.lastReading || 0, m.maxLimit);
      return [m.id, m.citizenName, m.zone, m.lastReading || 0, m.maxLimit || "N/A", bill.base, bill.penalty, bill.total, m.pendingInvoice ? "Issued" : "Pending"];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `electricity-billing-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} records.`);
  };

  const handleIssueInvoice = async (meterId: string, amount: number, breakdown: any) => {
    try {
      await api.post(`/electricity/meters/${meterId}/invoice`, { amount, breakdown });
      toast.success(`Invoice for ৳${amount} sent to ${meterId}`);
      const res = await api.get("/electricity/meters");
      setMeters(res.data.filter((m: any) => m.status === "active"));
    } catch { toast.error("Failed to issue invoice"); }
  };

  if (!isReady) return null;
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-yellow-500" /></div>
    </div>
  );

  let totalPending = 0, totalVolume = 0;
  const billingData = meters.map((m) => {
    const usage = m.lastReading || 0;
    const bill = calculateBill(usage, m.maxLimit);
    if (!m.pendingInvoice) totalPending += bill.total;
    totalVolume += usage;
    return { ...m, usage, bill };
  });
  const issuedCount = meters.filter((m) => m.pendingInvoice).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-yellow-700">Payment Engine</p>
              <h1 className="text-3xl font-black text-slate-950">Electricity Billing System</h1>
            </div>
          </div>
          <button onClick={handleExportCSV} disabled={meters.length === 0}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg border border-slate-300 transition disabled:opacity-50">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total Volume</p>
            <p className="text-3xl font-black text-slate-900">{totalVolume} <span className="text-lg text-slate-500">kWh</span></p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Pending Payment Received</p>
            <p className="text-3xl font-black text-emerald-600">৳{totalPending.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Invoices Issued</p>
            <p className="text-3xl font-black text-slate-900">{issuedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h3 className="font-bold text-slate-900">Billing Summary — Active Meters</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Meter / Citizen</th>
                  <th className="px-6 py-4 font-semibold">Zone</th>
                  <th className="px-6 py-4 font-semibold text-right">Usage (kWh)</th>
                  <th className="px-6 py-4 font-semibold text-right">Base</th>
                  <th className="px-6 py-4 font-semibold text-right">Penalty</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billingData.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No active meters found.</td></tr>
                ) : billingData.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{d.citizenName}</p>
                      <p className="text-xs font-mono text-slate-500">{d.id}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{d.zone}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold">
                      <span className={d.maxLimit && d.usage > d.maxLimit ? "text-rose-600" : "text-slate-900"}>{d.usage}</span>
                      {d.maxLimit && d.usage > d.maxLimit && <AlertTriangle className="inline h-3.5 w-3.5 text-rose-500 ml-1" />}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">৳{d.bill.base}</td>
                    <td className="px-6 py-4 text-right font-mono text-rose-600">{d.bill.penalty > 0 ? `৳${d.bill.penalty}` : "—"}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-slate-900">৳{d.bill.total}</td>
                    <td className="px-6 py-4 text-right">
                      {d.pendingInvoice ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Issued</span>
                      ) : (
                        <button onClick={() => handleIssueInvoice(d.id, d.bill.total, d.bill)}
                          className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-600 transition">
                          Issue Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
