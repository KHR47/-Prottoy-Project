"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Calendar, Loader2, MapPin, Search, Clock, CheckCircle, XCircle, AlertCircle, Ban } from "lucide-react";

export default function OperatorBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    api.get("/parking/operator/bookings").then(r => setBookings(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCancel = async (id: number) => {
    if(!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.post(`/parking/operator/bookings/${id}/cancel`);
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to cancel booking");
    }
  };
  const handleResolveConflict = async (id: number) => {
    if(!confirm("Are you sure you want to resolve this conflict and mark the booking as completed?")) return;
    try {
      await api.patch(`/parking/bookings/${id}/status`, { status: "completed" });
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to resolve conflict");
    }
  };
  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = b.vehicleNumber?.toLowerCase().includes(q) || b.user?.name?.toLowerCase().includes(q) || String(b.id) === q;
    const matchFilter = filter === "all" || b.status === filter;
    return matchSearch && matchFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">Active</span>;
      case 'completed': return <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-400">Completed</span>;
      case 'pending': return <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-400">Pending</span>;
      case 'cancelled': return <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-500">Cancelled</span>;
      default: return <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white">All Bookings</h1>
            <p className="mt-2 text-slate-400">Monitor and manage all parking reservations system-wide.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input type="text" placeholder="Search by plate, ID, or user..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-teal-500" />
          </div>
          <div className="flex gap-2 p-1 rounded-2xl bg-slate-800 border border-slate-700">
            {['all', 'pending', 'active', 'completed', 'cancelled'].map(f => (
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
             <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-700" />
             <p className="text-slate-500 font-semibold">No bookings found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-xs uppercase text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-bold">Booking / Plate</th>
                    <th className="px-6 py-4 font-bold">Location</th>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold">Time</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Fee / Payment</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-white">{b.vehicleNumber}</p>
                        <p className="text-xs text-slate-500">ID: #{b.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-200">{b.parkingSlot?.parkingLot?.name}</p>
                        <p className="text-xs">Slot: {b.parkingSlot?.slotNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-200">{b.user?.name || 'Guest'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs">Start: {new Date(b.startTime || b.createdAt).toLocaleString('en-BD', {dateStyle:'short', timeStyle:'short'})}</p>
                        {b.actualCheckIn && <p className="text-xs text-emerald-400">In: {new Date(b.actualCheckIn).toLocaleTimeString()}</p>}
                        {b.actualCheckOut && <p className="text-xs text-blue-400">Out: {new Date(b.actualCheckOut).toLocaleTimeString()}</p>}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-200">৳{b.totalFee}</p>
                        <p className={`text-xs font-bold ${b.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{b.paymentStatus.toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(b.status === 'pending' || b.status === 'active') && (
                            <button onClick={() => handleCancel(b.id)} className="rounded-lg bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors" title="Cancel Booking">
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          {(b.status === 'active') && (
                            <button onClick={() => handleResolveConflict(b.id)} className="rounded-lg bg-amber-500/10 p-2 text-amber-400 hover:bg-amber-500 hover:text-white transition-colors" title="Resolve Conflict (Force Complete)">
                              <AlertCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
