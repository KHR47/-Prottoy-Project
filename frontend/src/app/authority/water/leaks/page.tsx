"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { AlertTriangle, Wrench, Search, PhoneCall, ShieldAlert, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function LeakManagementPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [meters, setMeters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isReady) {
      const fetchMeters = async () => {
        try {
          const res = await api.get("/water/meters");
          setMeters(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMeters();
      const interval = setInterval(fetchMeters, 5000);
      return () => clearInterval(interval);
    }
  }, [isReady]);

  if (!isReady) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  // Find meters that have exceeded their max limit
  const alerts = meters.filter(m => m.status === 'active' && m.maxLimit && m.lastReading > m.maxLimit).map(m => {
    const overflow = m.lastReading - m.maxLimit;
    const percentage = ((overflow / m.maxLimit) * 100).toFixed(0);
    
    let severity = "low";
    if (Number(percentage) > 50) severity = "critical";
    else if (Number(percentage) > 20) severity = "high";
    else if (Number(percentage) > 10) severity = "medium";

    return { ...m, overflow, percentage, severity };
  });

  const filteredAlerts = alerts.filter(a => 
    a.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.zone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalCount = alerts.filter(a => a.severity === "critical" || a.severity === "high").length;

  const handleDispatch = (meterId: string) => {
    toast.success(`Inspection team dispatched to meter ${meterId}`);
  };

  const handleContact = (name: string) => {
    toast.success(`Calling citizen: ${name}...`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold uppercase text-amber-600">Operations Hub</p>
          </div>
          <h1 className="text-3xl font-black text-slate-950">Leak & Anomaly Detection</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Automatically detect abnormal water consumption that exceeds assigned thresholds. Dispatch repair teams and contact citizens.
          </p>
        </div>

        {/* KPIs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Total Active Alerts</p>
              <p className="text-3xl font-black text-slate-900">{alerts.length}</p>
            </div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-200 flex items-center justify-center text-rose-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-700">Critical / High Severity</p>
              <p className="text-3xl font-black text-rose-900">{criticalCount}</p>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-lg">Automated System Alerts</h3>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID, Zone, or Citizen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredAlerts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <ShieldAlert className="h-12 w-12 text-slate-300 mb-3" />
                <p className="font-bold text-lg text-slate-900">No active leaks detected.</p>
                <p>All meters are operating within their assigned thresholds.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div key={alert.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center gap-6">
                  
                  {/* Info */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Meter ID</p>
                      <p className="font-mono font-bold text-slate-900">{alert.id}</p>
                      <p className="text-sm text-slate-600">{alert.citizenName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">{alert.zone}</p>
                      <p className="text-sm text-slate-600 truncate max-w-[200px]">{alert.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Status</p>
                      {alert.severity === "critical" && <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 mt-1">Critical Overflow</span>}
                      {alert.severity === "high" && <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700 mt-1">High Probability Leak</span>}
                      {alert.severity === "medium" && <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 mt-1">Moderate Overflow</span>}
                      {alert.severity === "low" && <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700 mt-1">Slight Anomaly</span>}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase">Limit</p>
                      <p className="font-mono font-bold text-slate-900">{alert.maxLimit}L</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-rose-500 uppercase">Actual</p>
                      <p className="font-mono font-black text-rose-600">{alert.lastReading}L</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase">Spike</p>
                      <p className="font-bold text-rose-600">+{alert.percentage}%</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                    <button 
                      onClick={() => handleDispatch(alert.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition"
                    >
                      <Wrench className="h-4 w-4" /> Dispatch
                    </button>
                    <button 
                      onClick={() => handleContact(alert.citizenName)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition"
                    >
                      <PhoneCall className="h-4 w-4" /> Contact
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
