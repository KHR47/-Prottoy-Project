"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TransportOperatorNavbar } from "@/components/layout/TransportOperatorNavbar";
import { api } from "@/lib/api";
import { MessageSquare, Star, Loader2, RefreshCw } from "lucide-react";

const typeColors: Record<string, string> = { rating: "bg-amber-500/20 text-amber-400", complaint: "bg-rose-500/20 text-rose-400", suggestion: "bg-sky-500/20 text-sky-400" };

export default function OperatorFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => Promise.all([api.get("/transport/feedback"), api.get("/transport/routes")]).then(([f, r]) => { setFeedbacks(f.data); setRoutes(r.data); }).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? feedbacks : feedbacks.filter((f) => f.type === filter);
  const avgRating = feedbacks.filter((f) => f.type === "rating" && f.rating).reduce((s, f, _, a) => s + f.rating / a.length, 0);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <TransportOperatorNavbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 ring-1 ring-teal-500/40"><MessageSquare className="h-6 w-6 text-teal-400" /></div>
            <div><p className="text-xs font-bold uppercase tracking-widest text-teal-400">Passenger Voice</p><h1 className="text-2xl font-black text-white">Feedback Monitor</h1></div>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition"><RefreshCw className="h-4 w-4" /></button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-center"><p className="text-xs text-slate-500 font-bold uppercase">Total</p><p className="text-3xl font-black text-white mt-1">{feedbacks.length}</p></div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center"><p className="text-xs text-amber-400/70 font-bold uppercase">Avg Rating</p><p className="text-3xl font-black text-amber-400 mt-1">{feedbacks.length ? avgRating.toFixed(1) : "—"}</p></div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center"><p className="text-xs text-rose-400/70 font-bold uppercase">Complaints</p><p className="text-3xl font-black text-rose-400 mt-1">{feedbacks.filter((f) => f.type === "complaint").length}</p></div>
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-center"><p className="text-xs text-sky-400/70 font-bold uppercase">Suggestions</p><p className="text-3xl font-black text-sky-400 mt-1">{feedbacks.filter((f) => f.type === "suggestion").length}</p></div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-2 flex-wrap">
          {["all", "rating", "complaint", "suggestion"].map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${filter === t ? "bg-teal-600 text-white" : "border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200"}`}>
              {t} {t !== "all" && <span className="ml-1 text-xs opacity-70">{feedbacks.filter((f) => f.type === t).length}</span>}
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div> : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 py-16 text-center"><MessageSquare className="mx-auto h-12 w-12 text-slate-700 mb-4" /><p className="text-slate-400">No feedback yet.</p></div>
        ) : (
          <div className="space-y-4">
            {filtered.map((fb) => {
              const route = routes.find((r) => r.id === fb.routeId);
              return (
                <div key={fb.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${typeColors[fb.type] || "bg-slate-700 text-slate-400"}`}>{fb.type}</span>
                      {route && <span className="text-xs font-bold" style={{ color: route.color }}>{route.id}</span>}
                      {fb.type === "rating" && (
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= fb.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 shrink-0">{new Date(fb.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <h3 className="font-bold text-slate-200">{fb.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{fb.description}</p>
                  {fb.name && <p className="text-xs text-slate-600 mt-2">— {fb.name}</p>}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
