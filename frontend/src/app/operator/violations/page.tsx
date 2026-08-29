"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { AlertTriangle, Loader2, Search, CheckCircle, XCircle } from "lucide-react";

export default function OperatorViolationsPage() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newViolation, setNewViolation] = useState({ vehicleNumber: "", reason: "", violationType: "overstay", fineAmount: 500, parkingLotId: "" });
  const [lots, setLots] = useState<any[]>([]);

  const load = () => {
    setLoading(true);
    api.get("/parking/operator/violations").then(r => setViolations(r.data)).catch(console.error).finally(() => setLoading(false));
    api.get("/parking/lots").then(r => setLots(r.data)).catch(console.error);
  };
  useEffect(load, []);

  const handleResolve = async (id: number, status: string) => {
    try {
      await api.patch(`/parking/operator/violations/${id}`, { status, notes: resolutionNotes });
      setResolvingId(null);
      setResolutionNotes("");
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to update violation");
    }
  };

  const handleIssueFine = async () => {
    try {
      await api.post("/parking/violations", newViolation);
      setShowIssueModal(false);
      setNewViolation({ vehicleNumber: "", reason: "", violationType: "overstay", fineAmount: 500, parkingLotId: "" });
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to issue fine");
    }
  };

  const filtered = violations.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = v.vehicleNumber?.toLowerCase().includes(q) || v.reason?.toLowerCase().includes(q);
    const matchFilter = filter === "all" || v.status === filter;
    return matchSearch && matchFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued': return <span className="rounded-full bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-400">Issued</span>;
      case 'paid': return <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">Paid</span>;
      case 'disputed': return <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-400">Disputed</span>;
      case 'resolved': return <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-400">Resolved</span>;
      case 'waived': return <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-500">Waived</span>;
      default: return <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Violations Management</h1>
            <p className="mt-2 text-slate-400">Monitor fines, handle disputes, and resolve parking violations.</p>
          </div>
          <button onClick={() => setShowIssueModal(true)} className="rounded-xl bg-rose-600 px-6 py-3 font-bold text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/20">
             + Issue Fine
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input type="text" placeholder="Search by plate or reason..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-teal-500" />
          </div>
          <div className="flex gap-2 p-1 rounded-2xl bg-slate-800 border border-slate-700">
            {['all', 'issued', 'paid', 'disputed', 'resolved', 'waived'].map(f => (
               <button key={f} onClick={() => setFilter(f)}
                 className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                 {f}
               </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-teal-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-slate-800 bg-slate-900/30">
             <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-slate-700" />
             <p className="text-slate-500 font-semibold">No violations found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(v => (
              <div key={v.id} className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-black text-white">{v.vehicleNumber}</p>
                      {getStatusBadge(v.status)}
                    </div>
                    <p className="text-sm font-bold text-slate-300 mt-1">{v.reason}</p>
                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                      <p>Type: {v.violationType} | Fine: <span className="font-bold text-rose-400">৳{v.fineAmount}</span></p>
                      <p>Location: {v.parkingLot?.name || 'N/A'}</p>
                      <p>Issued: {new Date(v.createdAt).toLocaleString()} by {v.issuedBy?.name}</p>
                      {v.resolutionNotes && <p className="text-blue-400">Notes: {v.resolutionNotes}</p>}
                    </div>
                  </div>
                </div>

                <div className="md:text-right">
                  {resolvingId === v.id ? (
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-72">
                      <input type="text" placeholder="Resolution notes..." value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                         className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white mb-3" />
                      <div className="flex gap-2">
                        <button onClick={() => setResolvingId(null)} className="flex-1 rounded-lg border border-slate-600 py-1.5 text-xs font-bold text-slate-300">Cancel</button>
                        <button onClick={() => handleResolve(v.id, 'resolved')} className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white">Resolve</button>
                        <button onClick={() => handleResolve(v.id, 'waived')} className="flex-1 rounded-lg bg-slate-600 py-1.5 text-xs font-bold text-white">Waive</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                       {(v.status === 'issued' || v.status === 'disputed') && (
                         <button onClick={() => setResolvingId(v.id)} className="rounded-xl border border-teal-500/50 text-teal-400 px-4 py-2 text-sm font-bold hover:bg-teal-500 hover:text-white transition-colors">
                           Handle Violation
                         </button>
                       )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6">Issue Parking Fine</h2>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Vehicle Plate Number</label>
                  <input type="text" value={newViolation.vehicleNumber} onChange={e => setNewViolation({...newViolation, vehicleNumber: e.target.value})}
                     className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:border-teal-500 focus:ring-0" />
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Lot (Optional)</label>
                  <select value={newViolation.parkingLotId} onChange={e => setNewViolation({...newViolation, parkingLotId: e.target.value})}
                     className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:border-teal-500 focus:ring-0">
                     <option value="">-- None --</option>
                     {lots.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Violation Type</label>
                  <select value={newViolation.violationType} onChange={e => setNewViolation({...newViolation, violationType: e.target.value})}
                     className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:border-teal-500 focus:ring-0">
                     <option value="overstay">Overstay</option>
                     <option value="unauthorized">Unauthorized Parking</option>
                     <option value="other">Other</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Fine Amount (৳)</label>
                  <input type="number" value={newViolation.fineAmount} onChange={e => setNewViolation({...newViolation, fineAmount: Number(e.target.value)})}
                     className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:border-teal-500 focus:ring-0" />
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Reason / Notes</label>
                  <input type="text" value={newViolation.reason} onChange={e => setNewViolation({...newViolation, reason: e.target.value})}
                     className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:border-teal-500 focus:ring-0" />
               </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowIssueModal(false)} className="flex-1 rounded-xl border border-slate-700 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all">Cancel</button>
              <button onClick={handleIssueFine} className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition-all">Issue Fine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
