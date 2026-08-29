"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Loader2, DollarSign, MapPin, Car, AlertTriangle, TrendingUp, BarChart3, Users, Settings, Layers } from "lucide-react";

export default function AdminParkingPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/parking/admin/analytics").then(r => setAnalytics(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { label: "Platform Payment Received", value: `৳${Number(analytics.totalRevenue).toLocaleString()}`, icon: DollarSign, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", ring: "ring-emerald-200 dark:ring-emerald-500/20" },
    { label: "Active Facilities", value: analytics.activeLots, icon: MapPin, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", ring: "ring-blue-200 dark:ring-blue-500/20" },
    { label: "Total Bookings", value: analytics.totalBookings, icon: Car, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", ring: "ring-amber-200 dark:ring-amber-500/20" },
    { label: "Total Capacity", value: analytics.totalSlots, icon: Layers, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10", ring: "ring-purple-200 dark:ring-purple-500/20" },
    { label: "Violation Fines", value: `৳${Number(analytics.violationRevenue).toLocaleString()}`, icon: AlertTriangle, color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-500/10", ring: "ring-rose-200 dark:ring-rose-500/20" },
  ] : [];

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--bg-background)" }}>
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 border-b pb-8 flex items-center justify-between" style={{ borderColor: "var(--border-strong)" }}>
          <div>
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest text-xs mb-3">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" /> System Analytics
            </div>
            <h1 className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>Global Parking Oversight</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Platform-wide statistics and management for the parking module.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-teal-500" /></div>
        ) : (
          <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.map(stat => (
                <div key={stat.label} className="rounded-2xl border p-5 transition-transform hover:-translate-y-1 shadow-sm" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}>
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} ring-1 ${stat.ring} flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Usage Breakdown */}
            <div className="rounded-3xl border p-8 shadow-sm" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}>
              <h3 className="text-lg font-black mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <BarChart3 className="h-5 w-5 text-teal-500" /> Booking Distribution
              </h3>
              <div className="space-y-6">
                {[
                  { label: "Active Now", value: analytics.activeBookings, color: "bg-emerald-500" },
                  { label: "Pending Entry", value: analytics.pendingBookings, color: "bg-amber-500" },
                  { label: "Completed", value: analytics.completedBookings, color: "bg-blue-500" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      <span className="font-black" style={{ color: "var(--text-primary)" }}>{item.value}</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--bg-surface-2)" }}>
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${analytics.totalBookings ? (item.value / analytics.totalBookings) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-8 border-t" style={{ borderColor: "var(--border-strong)" }}>
               <h3 className="text-xl font-black mb-6" style={{ color: "var(--text-primary)" }}>Administrative Actions</h3>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-3xl border p-6 flex items-center justify-between group cursor-pointer transition-all hover:shadow-md" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}>
                     <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-violet-100 dark:bg-violet-500/10 ring-1 ring-violet-200 dark:ring-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                           <Users className="h-7 w-7" />
                        </div>
                        <div>
                           <h4 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>Manage Operators</h4>
                           <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Assign roles and manage personnel</p>
                        </div>
                     </div>
                     <button onClick={() => window.location.href='/admin/users'} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20">
                        Manage
                     </button>
                  </div>
                  <div className="rounded-3xl border p-6 flex items-center justify-between group cursor-pointer transition-all hover:shadow-md" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}>
                     <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-sky-100 dark:bg-sky-500/10 ring-1 ring-sky-200 dark:ring-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                           <Settings className="h-7 w-7" />
                        </div>
                        <div>
                           <h4 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>System Settings</h4>
                           <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Configure global parameters and taxes</p>
                        </div>
                     </div>
                     <button onClick={() => window.location.href='/admin/parking/settings'} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-lg shadow-sky-500/20">
                        Configure
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
