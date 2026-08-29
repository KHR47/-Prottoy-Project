"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { CreditCard, Loader2, DollarSign, Activity } from "lucide-react";

export default function OperatorPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/parking/operator/payments").then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white">Payment Monitor</h1>
          <p className="mt-2 text-slate-400">Track incoming payments received and monitor unpaid parking fees.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-teal-500" /></div>
        ) : data ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                 <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Total Payment Received</p>
                 <p className="text-4xl font-black text-emerald-500">৳{data.totalRevenue}</p>
               </div>
               <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Paid Transactions</p>
                 <p className="text-4xl font-black text-white">{data.paidBookings?.length || 0}</p>
               </div>
               <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
                 <p className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">Unpaid (Completed)</p>
                 <p className="text-4xl font-black text-amber-500">{data.unpaidCount}</p>
               </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 overflow-hidden">
               <h3 className="text-lg font-black text-white p-6 border-b border-slate-800">Recent Paid Bookings</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-400">
                   <thead className="bg-slate-800/50 text-xs uppercase text-slate-300">
                     <tr>
                       <th className="px-6 py-4 font-bold">Booking / Plate</th>
                       <th className="px-6 py-4 font-bold">Location</th>
                       <th className="px-6 py-4 font-bold">Amount Paid</th>
                       <th className="px-6 py-4 font-bold">Time</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {data.paidBookings?.map((b: any) => (
                       <tr key={b.id} className="hover:bg-slate-800/20 transition-colors">
                         <td className="px-6 py-4">
                           <p className="font-black text-white">{b.vehicleNumber}</p>
                           <p className="text-xs">ID: #{b.id}</p>
                         </td>
                         <td className="px-6 py-4">
                           <p className="font-bold text-slate-200">{b.parkingSlot?.parkingLot?.name}</p>
                           <p className="text-xs">Slot: {b.parkingSlot?.slotNumber}</p>
                         </td>
                         <td className="px-6 py-4">
                           <p className="font-bold text-emerald-400">৳{b.totalFee}</p>
                         </td>
                         <td className="px-6 py-4">
                           <p className="text-xs">Paid At: {new Date(b.updatedAt).toLocaleString()}</p>
                         </td>
                       </tr>
                     ))}
                     {(!data.paidBookings || data.paidBookings.length === 0) && (
                       <tr>
                         <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No paid transactions found.</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
