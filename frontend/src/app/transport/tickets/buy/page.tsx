"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Ticket, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function BuyTicketForm() {
  const params = useSearchParams();
  const preselect = params.get("routeId") || "";
  const categoryPreselect = params.get("category") || "city";

  const [mode, setMode] = useState<"city" | "intercity">(categoryPreselect as "city" | "intercity");
  const [cityRoutes, setCityRoutes] = useState<any[]>([]);
  const [intercityRoutes, setIntercityRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ 
    routeId: preselect, 
    type: "single", 
    passengerName: "", 
    passengerPhone: "" 
  });
  const [buying, setBuying] = useState(false);
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.get("/transport/routes"),
      api.get("/transport/intercity")
    ])
    .then(([cityRes, intercityRes]) => {
      setCityRoutes(cityRes.data);
      setIntercityRoutes(intercityRes.data);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  // Update type depending on preselected route / category
  useEffect(() => {
    if (preselect) {
      if (preselect.startsWith("IC")) {
        setMode("intercity");
        setForm(f => ({ ...f, routeId: preselect, type: "single" }));
      } else {
        setMode("city");
        setForm(f => ({ ...f, routeId: preselect, type: "single" }));
      }
    }
  }, [preselect]);

  const activeRoutes = mode === "city" ? cityRoutes : intercityRoutes;
  const selectedRoute = activeRoutes.find((r) => r.id === form.routeId);

  // Compute name and fare
  let routeName = "";
  let fare = 0;
  if (selectedRoute) {
    if (mode === "city") {
      routeName = selectedRoute.name;
      fare = form.type === "pass" ? selectedRoute.fare?.pass : selectedRoute.fare?.single;
    } else {
      routeName = `${selectedRoute.operator} (${selectedRoute.from} ↔ ${selectedRoute.to})`;
      fare = form.type === "ac" ? selectedRoute.fare?.ac : selectedRoute.fare?.single;
    }
  }

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.routeId || !form.passengerName || !form.passengerPhone) {
      return toast.error("Fill all fields.");
    }
    setBuying(true);
    try {
      const res = await api.post("/transport/tickets", {
        routeId: form.routeId,
        routeName,
        type: form.type,
        passengerName: form.passengerName,
        passengerPhone: form.passengerPhone,
        fare,
      });
      setTicket(res.data);
      toast.success("Ticket purchased!");
    } catch { 
      toast.error("Could not purchase ticket."); 
    } finally { 
      setBuying(false); 
    }
  };

  const inputClass = "h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
  const selectClass = "h-11 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 text-sm text-slate-100 outline-none focus:border-violet-500 bg-slate-800";

  if (ticket) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-emerald-500/30 bg-slate-800 p-8 text-center shadow-2xl shadow-emerald-500/10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Ticket Confirmed!</h2>
        <p className="text-slate-400 text-sm mt-1">Your ticket has been issued</p>
        <div className="mt-6 rounded-2xl bg-slate-900/60 border border-slate-700 p-5 text-left space-y-3">
          <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Ticket ID</span><span className="font-mono font-black text-violet-400 text-sm">{ticket.id}</span></div>
          <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Route</span><span className="text-slate-200 font-bold text-sm">{ticket.routeName}</span></div>
          <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Passenger</span><span className="text-slate-200 font-bold text-sm">{ticket.passengerName}</span></div>
          <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Class / Type</span><span className="text-slate-200 font-bold text-sm capitalize">{ticket.type === "ac" ? "AC Deluxe" : ticket.type === "single" ? "Single Journey (Non-AC)" : "Monthly Pass"}</span></div>
          <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Fare</span><span className="text-xl font-black text-emerald-400">৳{ticket.fare}</span></div>
          <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-bold">Valid Until</span><span className="text-slate-200 font-bold text-sm">{new Date(ticket.expiresAt).toLocaleString()}</span></div>
        </div>
        <p className="mt-4 text-xs text-slate-500">Show Ticket ID <span className="text-violet-400 font-mono">{ticket.id}</span> to the driver for validation.</p>
        <button onClick={() => setTicket(null)} className="mt-6 w-full rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-sm font-bold text-slate-300 transition">Buy Another Ticket</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/40">
              <Ticket className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Ticketing</p>
              <h1 className="text-2xl font-black text-white">Buy a Ticket</h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => { setMode("city"); setForm(f => ({ ...f, routeId: "", type: "single" })); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "city" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              City Bus
            </button>
            <button
              type="button"
              onClick={() => { setMode("intercity"); setForm(f => ({ ...f, routeId: "", type: "single" })); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "intercity" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              Intercity
            </button>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
        ) : (
          <form onSubmit={handleBuy} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Route</label>
              <select className={selectClass} value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} required>
                <option value="">Choose a route...</option>
                {activeRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {mode === "city" ? r.name : `${r.operator} (${r.from} ↔ ${r.to})`}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedRoute && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ticket Type / Class</label>
                <div className="grid grid-cols-2 gap-3">
                  {mode === "city" ? (
                    <>
                      <button type="button" onClick={() => setForm({ ...form, type: "single" })}
                        className={`rounded-xl border p-4 text-left transition ${form.type === "single" ? "border-violet-500 bg-violet-500/10" : "border-slate-700 bg-slate-900/40 hover:border-slate-600"}`}>
                        <p className="font-bold text-slate-200 text-sm">Single Journey</p>
                        <p className="text-xl font-black text-emerald-400 mt-1">৳{selectedRoute.fare?.single}</p>
                      </button>
                      {selectedRoute.fare?.pass && (
                        <button type="button" onClick={() => setForm({ ...form, type: "pass" })}
                          className={`rounded-xl border p-4 text-left transition ${form.type === "pass" ? "border-violet-500 bg-violet-500/10" : "border-slate-700 bg-slate-900/40 hover:border-slate-600"}`}>
                          <p className="font-bold text-slate-200 text-sm">Monthly Pass</p>
                          <p className="text-xl font-black text-emerald-400 mt-1">৳{selectedRoute.fare.pass}</p>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => setForm({ ...form, type: "single" })}
                        className={`rounded-xl border p-4 text-left transition ${form.type === "single" ? "border-violet-500 bg-violet-500/10" : "border-slate-700 bg-slate-900/40 hover:border-slate-600"}`}>
                        <p className="font-bold text-slate-200 text-sm">Single (Non-AC)</p>
                        <p className="text-xl font-black text-emerald-400 mt-1">৳{selectedRoute.fare?.single}</p>
                      </button>
                      {selectedRoute.fare?.ac && (
                        <button type="button" onClick={() => setForm({ ...form, type: "ac" })}
                          className={`rounded-xl border p-4 text-left transition ${form.type === "ac" ? "border-violet-500 bg-violet-500/10" : "border-slate-700 bg-slate-900/40 hover:border-slate-600"}`}>
                          <p className="font-bold text-slate-200 text-sm">AC Deluxe</p>
                          <p className="text-xl font-black text-emerald-400 mt-1">৳{selectedRoute.fare.ac}</p>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
              <input className={inputClass} placeholder="Your full name" value={form.passengerName} onChange={(e) => setForm({ ...form, passengerName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone Number</label>
              <input className={inputClass} type="tel" placeholder="01XXXXXXXXX" value={form.passengerPhone} onChange={(e) => setForm({ ...form, passengerPhone: e.target.value })} required />
            </div>

            {selectedRoute && (
              <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Total Fare</p>
                  <p className="text-3xl font-black text-emerald-400">৳{fare}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Route: {selectedRoute.from} → {selectedRoute.to}</p>
                  <p className="capitalize">
                    {mode === "city" 
                      ? (form.type === "pass" ? "Monthly Pass" : "Single Journey")
                      : (form.type === "ac" ? "AC Deluxe" : "Single (Non-AC)")}
                  </p>
                </div>
              </div>
            )}
            <button type="submit" disabled={buying}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-sm font-bold text-white transition disabled:opacity-60">
              {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Ticket className="h-4 w-4" /> Confirm Purchase</>}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default function BuyTicketPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1117] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>}>
      <BuyTicketForm />
    </Suspense>
  );
}
