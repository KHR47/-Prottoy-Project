"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Ticket, CheckCircle, XCircle, Search, Loader2 } from "lucide-react";

export default function DriverValidatePage() {
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    setValidating(true); setResult(null);
    try {
      const res = await api.post("/transport/tickets/validate", { id: ticketId.trim().toUpperCase() });
      setResult(res.data);
    } catch { setResult({ valid: false, message: "Could not validate ticket. Check connection." }); }
    finally { setValidating(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/40"><Ticket className="h-6 w-6 text-violet-400" /></div>
          <div><p className="text-xs font-bold uppercase tracking-widest text-violet-400">Driver Panel</p><h1 className="text-2xl font-black text-white">Ticket Validation</h1></div>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        {/* Input form */}
        <form onSubmit={handleValidate} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Enter Ticket ID</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input type="text" value={ticketId} onChange={(e) => setTicketId(e.target.value)} placeholder="e.g. TKT-1001"
                className="w-full h-12 rounded-xl border border-slate-600 bg-slate-700/50 pl-10 pr-4 text-slate-100 font-mono text-sm placeholder:text-slate-600 outline-none focus:border-violet-500 uppercase"
                autoFocus />
            </div>
            <button type="submit" disabled={validating}
              className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 text-sm font-bold text-white transition disabled:opacity-60">
              {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Ask the passenger for their Ticket ID (e.g. TKT-1001)</p>
        </form>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl border-2 p-8 text-center ${result.valid ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/5"}`}>
            <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${result.valid ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
              {result.valid
                ? <CheckCircle className="h-10 w-10 text-emerald-400" />
                : <XCircle className="h-10 w-10 text-rose-400" />}
            </div>
            <h2 className={`text-2xl font-black ${result.valid ? "text-emerald-400" : "text-rose-400"}`}>
              {result.valid ? "✓ VALID TICKET" : "✗ INVALID"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{result.message}</p>

            {result.valid && result.ticket && (
              <div className="mt-6 rounded-xl bg-slate-800/80 border border-slate-700 p-5 text-left space-y-2">
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">ID</span><span className="font-mono font-black text-violet-400 text-sm">{result.ticket.id}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Route</span><span className="text-slate-200 font-bold text-sm">{result.ticket.routeName}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Passenger</span><span className="text-slate-200 font-bold text-sm">{result.ticket.passengerName}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Type</span><span className="text-slate-200 font-bold text-sm capitalize">{result.ticket.type}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Fare</span><span className="text-xl font-black text-emerald-400">৳{result.ticket.fare}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Used At</span><span className="text-slate-200 font-bold text-sm">{result.ticket.usedAt ? new Date(result.ticket.usedAt).toLocaleString() : "—"}</span></div>
              </div>
            )}

            <button onClick={() => { setResult(null); setTicketId(""); }}
              className={`mt-6 w-full rounded-xl py-3 text-sm font-bold transition ${result.valid ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-700 hover:bg-slate-600"} text-white`}>
              Validate Another Ticket
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
