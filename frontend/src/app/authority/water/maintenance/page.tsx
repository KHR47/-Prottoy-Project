"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Wrench, Plus, CheckCircle, Clock, AlertTriangle, User, MapPin, Search } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Priority = "low" | "medium" | "high" | "critical";
type Status = "pending" | "in-progress" | "resolved";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  zone: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
  createdAt: string;
  isAutomated?: boolean;
}

export default function MaintenanceSystemPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New Order State
  const [newOrder, setNewOrder] = useState<Partial<WorkOrder>>({
    title: "",
    description: "",
    zone: "Badda",
    priority: "medium",
    assignedTo: "Unassigned"
  });

  useEffect(() => {
    if (isReady) {
      const fetchRealWorldData = async () => {
        try {
          // 1. Fetch real meters
          const res = await api.get("/water/meters");
          const activeMeters = res.data.filter((m: any) => m.status === "active");
          
          // 2. Fetch real pump physics
          const savedPumps = localStorage.getItem("water_distribution_pumps");
          const pumps = savedPumps ? JSON.parse(savedPumps) : {};

          // Calculate Demands
          const currentDemand: Record<string, number> = {};
          activeMeters.forEach((m: any) => {
            const zone = m.zone || m.district || "Unknown";
            currentDemand[zone] = (currentDemand[zone] || 0) + (m.lastReading || 0);
          });

          const automatedOrders: WorkOrder[] = [];

          // Auto-detect Meter Leaks
          activeMeters.forEach((m: any) => {
            if (m.maxLimit && m.lastReading > m.maxLimit) {
              automatedOrders.push({
                id: `AUTO-MTR-${m.id}`,
                title: "High Usage / Potential Leak Detected",
                description: `Meter ${m.id} (${m.citizenName}) has exceeded max limit. Actual: ${m.lastReading}L, Limit: ${m.maxLimit}L. Inspect for leaks immediately.`,
                zone: m.zone || m.district || "Unknown",
                priority: "high",
                status: "pending",
                assignedTo: "Auto-Dispatch",
                createdAt: new Date().toISOString().split("T")[0],
                isAutomated: true
              });
            }
          });

          // Auto-detect Grid Physics (Pipe Bursts / Shortages)
          Object.keys(pumps).forEach(zone => {
            const output = pumps[zone].output;
            const demand = currentDemand[zone] || 0;
            const systemLoss = output - demand;

            if (systemLoss < 0) {
              // Shortage
              automatedOrders.push({
                id: `AUTO-GRID-SHT-${zone.replace(/\s/g,'-')}`,
                title: `Critical Supply Shortage in ${zone}`,
                description: `Pump output (${output}L) is failing to meet metered demand (${demand}L). Investigate pump failure.`,
                zone: zone,
                priority: "critical",
                status: "pending",
                assignedTo: "Central Engineering",
                createdAt: new Date().toISOString().split("T")[0],
                isAutomated: true
              });
            } else if (systemLoss > (demand * 0.2) && demand > 0) {
              // Pipe Burst
              automatedOrders.push({
                id: `AUTO-GRID-BRST-${zone.replace(/\s/g,'-')}`,
                title: `Massive System Loss: Suspected Pipe Burst`,
                description: `Pumping ${output}L but only metering ${demand}L. Massive 20%+ physical loss detected in ${zone} underground grid.`,
                zone: zone,
                priority: "critical",
                status: "pending",
                assignedTo: "Rapid Response Team",
                createdAt: new Date().toISOString().split("T")[0],
                isAutomated: true
              });
            }
          });

          // Combine with local manual orders and saved statuses
          const savedOrdersData = localStorage.getItem("water_maintenance_orders");
          let savedOrders: WorkOrder[] = savedOrdersData ? JSON.parse(savedOrdersData) : [];

          // Merge logic: Update statuses of automated orders if they exist in saved history
          const finalOrders = [...savedOrders];
          
          automatedOrders.forEach(auto => {
            const existsIndex = finalOrders.findIndex(o => o.id === auto.id);
            if (existsIndex === -1) {
              finalOrders.unshift(auto); // Add new live alert to top
            } else {
              // It exists, but if it was resolved, and the physical issue still persists, maybe we should reopen it? 
              // For MVP, we respect the saved status (so authorities don't get spammed if they marked it resolved).
              // If they marked it resolved, we leave it as resolved in the finalOrders list.
            }
          });

          setOrders(finalOrders);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchRealWorldData();
      const interval = setInterval(fetchRealWorldData, 15000);
      return () => clearInterval(interval);
    }
  }, [isReady]);

  // Persist to local storage whenever orders change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("water_maintenance_orders", JSON.stringify(orders));
    }
  }, [orders]);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order: WorkOrder = {
      id: `WO-${Math.floor(Math.random() * 9000) + 1000}`,
      title: newOrder.title!,
      description: newOrder.description!,
      zone: newOrder.zone!,
      priority: newOrder.priority as Priority,
      status: "pending",
      assignedTo: newOrder.assignedTo!,
      createdAt: new Date().toISOString().split("T")[0]
    };
    
    const newOrders = [order, ...orders];
    setOrders(newOrders);
    localStorage.setItem("water_maintenance_orders", JSON.stringify(newOrders));
    
    setShowModal(false);
    setNewOrder({ title: "", description: "", zone: "Badda", priority: "medium", assignedTo: "Unassigned" });
    toast.success("Work order dispatched successfully!");
  };

  const handleUpdateStatus = (id: string, newStatus: Status) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem("water_maintenance_orders", JSON.stringify(updated));
    toast.success("Work order status updated.");
  };

  if (!isReady) return null;

  const filteredOrders = orders.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const inProgressCount = orders.filter(o => o.status === "in-progress").length;
  const criticalCount = orders.filter(o => o.priority === "critical" && o.status !== "resolved").length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm">
                <Wrench className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold uppercase text-rose-700">Engineering & Repairs</p>
            </div>
            <h1 className="text-3xl font-black text-slate-950">Maintenance System</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Create work orders, dispatch engineering teams, and track physical infrastructure repairs across the grid.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm shrink-0"
          >
            <Plus className="h-5 w-5" /> Create Work Order
          </button>
        </div>

        {/* KPIs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Pending Tasks</p>
              <p className="text-3xl font-black text-slate-900">{pendingCount}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Teams Active in Field</p>
              <p className="text-3xl font-black text-slate-900">{inProgressCount}</p>
            </div>
          </div>
          <div className={`rounded-xl border p-5 shadow-sm flex items-center gap-4 ${criticalCount > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${criticalCount > 0 ? 'bg-rose-200 text-rose-700' : 'bg-emerald-100 text-emerald-600'}`}>
              {criticalCount > 0 ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
            </div>
            <div>
              <p className={`text-sm font-bold ${criticalCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>Critical Emergencies</p>
              <p className={`text-3xl font-black ${criticalCount > 0 ? 'text-rose-900' : 'text-slate-900'}`}>{criticalCount}</p>
            </div>
          </div>
        </div>

        {/* Board Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Active Task Board</h2>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Zone, or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-sm"
            />
          </div>
        </div>

        {/* KanBan / List View */}
        <div className="grid gap-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              No work orders match your search criteria.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                
                {/* Status Color Bar */}
                <div className={`w-full md:w-3 h-2 md:h-auto shrink-0 ${
                  order.status === 'resolved' ? 'bg-emerald-500' : 
                  order.status === 'in-progress' ? 'bg-blue-500' : 
                  'bg-amber-400'
                }`} />

                <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center gap-6">
                  
                  {/* Core Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${order.isAutomated ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                        {order.id}
                      </span>
                      {order.priority === 'critical' && <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Critical</span>}
                      {order.priority === 'high' && <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">High Priority</span>}
                      {order.isAutomated && <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">System Auto-Generated</span>}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{order.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 max-w-2xl leading-relaxed">{order.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {order.zone}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                        <User className="h-3.5 w-3.5 text-slate-400" /> {order.assignedTo}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> {order.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Updates */}
                  <div className="flex flex-col gap-3 md:w-48 shrink-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Update Status</p>
                    
                    <button 
                      onClick={() => handleUpdateStatus(order.id, "pending")}
                      disabled={order.status === "pending"}
                      className={`px-4 py-2 text-sm font-bold rounded-lg border transition ${order.status === "pending" ? 'bg-amber-50 text-amber-700 border-amber-200 cursor-default' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      Pending
                    </button>
                    
                    <button 
                      onClick={() => handleUpdateStatus(order.id, "in-progress")}
                      disabled={order.status === "in-progress"}
                      className={`px-4 py-2 text-sm font-bold rounded-lg border transition ${order.status === "in-progress" ? 'bg-blue-50 text-blue-700 border-blue-200 cursor-default' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      In Progress
                    </button>
                    
                    <button 
                      onClick={() => handleUpdateStatus(order.id, "resolved")}
                      disabled={order.status === "resolved"}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg border transition ${order.status === "resolved" ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default' : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                    >
                      {order.status === "resolved" && <CheckCircle className="h-4 w-4" />} Resolved
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Dispatch Work Order</h2>
                <p className="text-sm text-slate-500 mt-1">Assign an engineering task.</p>
              </div>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                <input 
                  required type="text"
                  placeholder="e.g. Broken Pipe on Road 12"
                  value={newOrder.title}
                  onChange={e => setNewOrder({...newOrder, title: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                <textarea 
                  required rows={3}
                  placeholder="Provide context for the engineering team..."
                  value={newOrder.description}
                  onChange={e => setNewOrder({...newOrder, description: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zone / Location</label>
                  <input 
                    required type="text"
                    value={newOrder.zone}
                    onChange={e => setNewOrder({...newOrder, zone: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority Level</label>
                  <select 
                    value={newOrder.priority}
                    onChange={e => setNewOrder({...newOrder, priority: e.target.value as Priority})}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
                  >
                    <option value="low">Low - Routine</option>
                    <option value="medium">Medium - Standard</option>
                    <option value="high">High - Urgent</option>
                    <option value="critical">Critical - Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign Team (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Team Alpha"
                  value={newOrder.assignedTo === "Unassigned" ? "" : newOrder.assignedTo}
                  onChange={e => setNewOrder({...newOrder, assignedTo: e.target.value || "Unassigned"})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg shadow-sm transition"
                >
                  Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
