"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const OUTAGE_TYPES = ["Complete Outage", "Voltage Drop / Flickering", "Sparks / Burning Smell", "Exposed Wire", "Transformer Issue", "Other"];

export default function ReportOutagePage() {
  const { isReady, user } = useRequireRole(["citizen"]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ type: OUTAGE_TYPES[0], address: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const refId = `OUT-${Math.floor(Math.random() * 900000 + 100000)}`;
      toast.success(`Outage reported! Reference: ${refId}`, { duration: 5000 });
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1500);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-rose-700">Emergency Report</p>
            <h1 className="text-3xl font-black text-slate-950">Report Power Outage</h1>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-12 text-center shadow-sm">
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-black text-emerald-900">Report Submitted</h2>
            <p className="text-emerald-700 mt-2 mb-6">Your outage report has been received. A field team will be dispatched to your area shortly.</p>
            <button onClick={() => router.push("/electricity")} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">
              Back to Electricity Hub
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-800 font-medium">
                <strong>Safety First:</strong> If you see exposed wires or smell burning, leave the area immediately and call emergency services before submitting this form.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Incident Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-rose-500 bg-white">
                {OUTAGE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Affected Address</label>
              <input required type="text" placeholder="e.g. Road 7, Block B, Banani" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-rose-500" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Description</label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what you observed — since when, how many houses affected, etc."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-rose-500 resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-4 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-70 transition">
              {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><AlertCircle className="h-5 w-5" /> Submit Outage Report</>}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
