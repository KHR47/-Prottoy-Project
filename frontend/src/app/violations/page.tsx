"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { AlertTriangle, Car, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function ViolationsPage() {
  const router = useRouter();
  const { t, isBangla } = useLanguage();
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    issued:   { color: "bg-rose-500/20 text-rose-300",   label: isBangla ? "জারি করা হয়েছে" : "Issued" },
    paid:     { color: "bg-emerald-500/20 text-emerald-300", label: isBangla ? "পরিশোধিত" : "Paid" },
    disputed: { color: "bg-amber-500/20 text-amber-300", label: isBangla ? "আপিলকৃত" : "Disputed" },
    resolved: { color: "bg-blue-500/20 text-blue-300",   label: isBangla ? "মীমাংসিত" : "Resolved" },
    waived:   { color: "bg-slate-500/20 text-slate-400", label: isBangla ? "মওকুফকৃত" : "Waived" },
  };

  const load = () => {
    api.get("/parking/my-violations").then(r => setViolations(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handlePay = (id: number) => {
    router.push(`/payments?type=violation&id=${id}`);
  };

  const totalOutstanding = violations.filter(v => v.status === "issued").reduce((s, v) => s + Number(v.fineAmount), 0);

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-white">{t.parking.violations}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isBangla ? "পার্কিং লঙ্ঘন, ওভারস্টে ও জরিমানা পর্যালোচনা বা পরিশোধ করুন।" : "View and resolve your parking fines and camera citations."}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {totalOutstanding > 0 && (
          <div className="rounded-3xl bg-rose-950/80 border border-rose-500/30 p-6 text-white flex items-center justify-between shadow-2xl backdrop-blur-xl">
            <div>
              <p className="text-sm font-semibold text-rose-300">{isBangla ? "মোট বকেয়া জরিমানা" : "Outstanding Balance"}</p>
              <p className="text-4xl font-black mt-1 text-rose-400">
                {isBangla ? `৳ ${totalOutstanding.toLocaleString("bn-BD")}` : `৳ ${totalOutstanding.toFixed(2)}`}
              </p>
            </div>
            <AlertTriangle className="h-12 w-12 text-rose-400" />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>
        ) : violations.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{isBangla ? "কোন জরিমানা বা লঙ্ঘন নেই" : "No violations recorded"}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {isBangla ? "আপনার বিরুদ্ধে কোন জরিমানা বা ট্রাফিক নোটিশ নেই।" : "Your driving and parking record is 100% clean."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {violations.map(v => {
              const cfg = STATUS_CONFIG[v.status] || { color: "bg-slate-800 text-slate-300", label: v.status };
              return (
                <div key={v.id} className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-white">{v.ticketNumber}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-200">{v.reason}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{v.vehiclePlate} • {v.location}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-black text-white">
                      {isBangla ? `৳ ${Number(v.fineAmount).toLocaleString("bn-BD")}` : `৳ ${v.fineAmount}`}
                    </p>
                    {v.status === "issued" && (
                      <button 
                        onClick={() => handlePay(v.id)}
                        className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-lg shadow-teal-600/20"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        {isBangla ? "পরিশোধ করুন" : "Pay Fine"}
                      </button>
                    )}
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
