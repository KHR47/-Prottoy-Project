"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Gauge, Search, MapPin, History, PencilLine, CheckCircle, X, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Reading = {
  id: string;
  date: string;
  value: number;
  recordedBy: string;
};

type Meter = {
  id: string; 
  citizenName: string;
  zone: string;
  type: "residential" | "commercial" | "industrial";
  status: "active" | "inactive" | "maintenance" | "pending";
  address: string;
  lastReading: number;
  maxLimit?: number;
  readings: Reading[];
};

export default function GasMeterManagementPage() {
  const { isReady, user } = useRequireRole(["authority", "admin"]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active">("all");

  const loadMeters = async () => {
    try {
      const res = await api.get("/gas/meters");
      setMeters(res.data);
    } catch (err: any) {
      // Suppress network errors during backend restarts (polling resilience)
      if (err?.code !== "ERR_NETWORK") console.error(err);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadMeters();
      // Polling every 5s for live demo effect
      const interval = setInterval(loadMeters, 5000);
      return () => clearInterval(interval);
    }
  }, [isReady]);

  // Modals state
  const [approveMeterReq, setApproveMeterReq] = useState<Meter | null>(null);
  const [readingMeterId, setReadingMeterId] = useState<string | null>(null);
  const [historyMeterId, setHistoryMeterId] = useState<string | null>(null);

  // Form states
  const [hardwareId, setHardwareId] = useState("");
  const [maxLimit, setMaxLimit] = useState(100);
  const [newReading, setNewReading] = useState<number>(0);

  const filteredMeters = meters.filter(m => {
    const matchesSearch = 
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.citizenName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "pending") return matchesSearch && m.status === "pending";
    if (activeTab === "active") return matchesSearch && m.status !== "pending";
    return matchesSearch;
  });

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveMeterReq || !hardwareId) return;
    
    try {
      await api.patch(`/gas/meters/${approveMeterReq.id}/approve`, {
        hardwareId: hardwareId,
        maxLimit: maxLimit
      });
      await loadMeters();
      setApproveMeterReq(null);
      setHardwareId("");
      setMaxLimit(100);
      toast.success("Gas meter request approved successfully.");
    } catch (err) {
      toast.error("Failed to approve meter.");
    }
  };

  const handleReadingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingMeterId) return;
    
    const meter = meters.find(m => m.id === readingMeterId);
    if (!meter) return;

    if (newReading < meter.lastReading) {
      toast.error("New reading cannot be lower than the last reading.");
      return;
    }

    try {
      await api.post(`/gas/meters/${readingMeterId}/readings`, {
        value: newReading,
        recordedBy: user?.name || "Officer"
      });
      
      let msg = `Reading of ${newReading} m³ logged for ${readingMeterId}`;
      if (meter.maxLimit && newReading > meter.maxLimit) {
         msg += `. WARNING: Exceeds max limit of ${meter.maxLimit} m³!`;
         toast.error(msg, { duration: 5000 });
      } else {
         toast.success(msg);
      }

      await loadMeters();
      setReadingMeterId(null);
      setNewReading(0);
    } catch (err) {
      toast.error("Failed to log reading.");
    }
  };

  const activeHistoryMeter = meters.find(m => m.id === historyMeterId);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 shadow-sm">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-orange-700">Gas Infrastructure</p>
              <h1 className="text-3xl font-black text-slate-950">Line Gas Meter Management</h1>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === "all" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              All Meters
            </button>
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 text-sm font-bold rounded-md transition flex items-center gap-2 ${activeTab === "pending" ? "bg-amber-50 text-amber-700" : "text-slate-500 hover:text-amber-600"}`}
            >
              Pending Requests
              {meters.filter(m => m.status === "pending").length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                  {meters.filter(m => m.status === "pending").length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === "active" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:text-emerald-600"}`}
            >
              Active Connections
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search citizen or ID..."
              className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 shadow-sm"
            />
          </div>
        </div>

        {/* Meters Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Citizen / ID</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Limit / Usage (m³)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredMeters.map((meter) => (
                    <tr key={meter.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{meter.citizenName}</p>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">{meter.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{meter.zone} ({meter.type})</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {meter.address}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          meter.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          meter.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {meter.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {meter.status === "pending" ? (
                          <span className="text-slate-400 italic">Not set</span>
                        ) : (
                          <div>
                            <p className="font-mono text-slate-900 font-bold">{meter.lastReading} m³</p>
                            <p className="text-xs text-slate-500">Max: {meter.maxLimit} m³</p>
                            {meter.maxLimit && meter.lastReading > meter.maxLimit && (
                              <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                                <ShieldAlert className="h-3 w-3" /> Limit Exceeded
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {meter.status === "pending" ? (
                          <button 
                            onClick={() => {
                              setApproveMeterReq(meter);
                              const zoneAbbr = (meter.zone || "XYZ").substring(0, 3).toUpperCase();
                              const rand = Math.floor(100 + Math.random() * 900);
                              setHardwareId(`GM-${zoneAbbr}-${rand}`);
                            }}
                            className="flex items-center justify-center gap-1 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition ml-auto"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve & Setup
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setReadingMeterId(meter.id);
                                setNewReading(meter.lastReading);
                              }}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-orange-600 transition"
                            >
                              <PencilLine className="h-3.5 w-3.5" /> Log Reading
                            </button>
                            <button 
                              onClick={() => setHistoryMeterId(meter.id)}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                            >
                              <History className="h-3.5 w-3.5" /> History
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 1. Approve Request Modal */}
      {approveMeterReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h2 className="text-xl font-black text-slate-900">Approve Gas Meter Request</h2>
              <button onClick={() => setApproveMeterReq(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApproveSubmit} className="p-6">
              
              <div className="mb-6 bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-bold text-orange-800 uppercase mb-1">Citizen Details</p>
                <p className="font-bold text-slate-900 text-lg">{approveMeterReq.citizenName}</p>
                <p className="text-sm text-slate-600">{approveMeterReq.address}, {approveMeterReq.zone}</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Assign Hardware ID</label>
                  <input required placeholder="e.g. GM-XYZ-123" value={hardwareId} onChange={e => setHardwareId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Set Monthly Limit (m³)</label>
                  <div className="relative">
                    <input type="number" required min={10} value={maxLimit} onChange={e => setMaxLimit(parseInt(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500 font-mono pr-12" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">m³</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Tiered billing will be applied based on this threshold limit.</p>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setApproveMeterReq(null)} className="w-1/3 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="w-2/3 rounded-xl bg-orange-600 py-3 text-sm font-bold text-white transition hover:bg-orange-700 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Approve & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Log Reading Modal */}
      {readingMeterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-black text-slate-900">Log Manual Reading</h2>
              <button onClick={() => setReadingMeterId(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleReadingSubmit} className="p-6">
              <div className="mb-4 rounded-lg bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold">Meter ID</p>
                <p className="font-mono text-slate-900">{readingMeterId}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">New Reading (m³)</label>
                <input 
                  type="number" 
                  required 
                  min={0}
                  value={newReading} 
                  onChange={e => setNewReading(parseInt(e.target.value) || 0)} 
                  className="w-full border border-slate-300 rounded-lg p-3 text-lg font-mono outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" 
                />
              </div>
              <div className="mt-6">
                <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. History Modal */}
      {historyMeterId && activeHistoryMeter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Reading History</h2>
                <p className="text-sm text-slate-500 font-mono mt-0.5">{historyMeterId}</p>
              </div>
              <button onClick={() => setHistoryMeterId(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {activeHistoryMeter.readings.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No reading history available.</p>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                  {activeHistoryMeter.readings.map((reading, i) => (
                    <div key={reading.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-orange-500"></div>
                      <div className="rounded-lg border border-slate-200 p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-bold text-slate-900">{reading.date}</p>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            By {reading.recordedBy}
                          </span>
                        </div>
                        <p className="text-lg font-mono font-black text-slate-700">{reading.value} m³</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
