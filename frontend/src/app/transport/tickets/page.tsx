"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Ticket, CheckCircle, Clock, XCircle, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  valid: "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30",
  used: "bg-slate-600/40 text-slate-400 ring-slate-600/30",
  expired: "bg-rose-500/20 text-rose-400 ring-rose-500/30",
};
const statusIcons: Record<string, any> = {
  valid: CheckCircle,
  used: CheckCircle,
  expired: XCircle,
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/transport/tickets").then((r) => setTickets(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.routeName?.toLowerCase().includes(search.toLowerCase()) ||
    t.passengerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-500/40">
              <Ticket className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Ticketing</p>
              <h1 className="text-2xl font-black text-white">My Tickets</h1>
            </div>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or route..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-amber-500" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Valid", count: tickets.filter((t) => t.status === "valid").length, color: "text-emerald-400" },
            { label: "Used", count: tickets.filter((t) => t.status === "used").length, color: "text-slate-400" },
            { label: "Expired", count: tickets.filter((t) => t.status === "expired").length, color: "text-rose-400" },
          ].map(({ label, count, color }) => (
            <div key={label} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-center">
              <p className="text-xs text-slate-500 font-bold uppercase">{label}</p>
              <p className={`text-3xl font-black ${color} mt-1`}>{count}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 py-16 text-center">
            <Ticket className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="font-bold text-slate-400">No tickets found</p>
            <a href="/transport/tickets/buy" className="mt-4 inline-block rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-bold text-white transition">Buy a Ticket</a>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ticket) => {
              const Icon = statusIcons[ticket.status] || Clock;
              return (
                <div key={ticket.id} className={`rounded-2xl border p-5 transition ${ticket.status === "valid" ? "border-emerald-500/30 bg-slate-800/50" : "border-slate-700/50 bg-slate-800/30"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ticket.status === "valid" ? "bg-emerald-500/20" : "bg-slate-700"}`}>
                        <Icon className={`h-5 w-5 ${ticket.status === "valid" ? "text-emerald-400" : ticket.status === "expired" ? "text-rose-400" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-sm font-black text-violet-400">{ticket.id}</span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset capitalize ${statusColors[ticket.status]}`}>{ticket.status}</span>
                          <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-300 capitalize">{ticket.type}</span>
                        </div>
                        <p className="font-bold text-slate-200">{ticket.routeName || "Unknown Route"}</p>
                        <p className="text-xs text-slate-500">Passenger: {ticket.passengerName} · {ticket.passengerPhone}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-emerald-400">৳{ticket.fare}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Issued: {new Date(ticket.issuedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">Expires: {new Date(ticket.expiresAt).toLocaleDateString()}</p>
                    </div>
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
