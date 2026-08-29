"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { MessageSquare, Star, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const inputClass = "h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

export default function FeedbackPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [form, setForm] = useState({ routeId: "", type: "rating", rating: 5, title: "", description: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { api.get("/transport/routes").then((r) => setRoutes(r.data)).catch(console.error); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/transport/feedback", form);
      setSubmitted(true);
      toast.success("Feedback submitted. Thank you!");
    } catch { toast.error("Could not submit feedback."); }
    finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/20">
            <CheckCircle className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Feedback Submitted!</h2>
          <p className="text-slate-400 mt-2">Your feedback helps us improve Dhaka's public transport.</p>
          <button onClick={() => setSubmitted(false)} className="mt-6 rounded-xl bg-teal-600 hover:bg-teal-500 px-6 py-2.5 text-sm font-bold text-white transition">Submit Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 ring-1 ring-teal-500/40">
            <MessageSquare className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Passenger Voice</p>
            <h1 className="text-2xl font-black text-white">Submit Feedback</h1>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Route (Optional)</label>
            <select className={inputClass} value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
              <option value="">General feedback</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Feedback Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["rating", "complaint", "suggestion"].map((t) => (
                <button type="button" key={t} onClick={() => setForm({ ...form, type: t })}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize transition ${form.type === t ? "border-teal-500 bg-teal-500/10 text-teal-400" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {form.type === "rating" && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })}
                    className={`flex-1 flex flex-col items-center rounded-xl border py-3 transition ${form.rating >= n ? "border-amber-500 bg-amber-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                    <Star className={`h-5 w-5 ${form.rating >= n ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                    <span className={`text-xs font-bold mt-1 ${form.rating >= n ? "text-amber-400" : "text-slate-600"}`}>{n}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subject</label>
            <input className={inputClass} placeholder="Brief title for your feedback" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
            <textarea className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-teal-500 resize-none"
              rows={4} placeholder="Describe your experience..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Your Name (Optional)</label>
            <input className={inputClass} placeholder="Anonymous if left blank" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 py-3 text-sm font-bold text-white transition disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><MessageSquare className="h-4 w-4" /> Submit Feedback</>}
          </button>
        </form>
      </main>
    </div>
  );
}
