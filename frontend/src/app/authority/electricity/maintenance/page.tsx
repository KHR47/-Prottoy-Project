"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Wrench, Plus, Search, X, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type WorkOrder = { id: string; title: string; location: string; type: "inspection" | "repair" | "replacement" | "upgrade"; priority: "low" | "medium" | "high" | "critical"; status: "open" | "in_progress" | "resolved"; assignedTo: string; createdAt: string };

const STATUSES = ["open", "in_progress", "resolved"] as const;

export default function ElectricityMaintenancePage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ title: "", location: "", type: "repair" as WorkOrder["type"], priority: "medium" as WorkOrder["priority"], assignedTo: "" });

  useEffect(() => {
    if (isReady) {
      const saved = localStorage.getItem("electricity_maintenance_orders");
      setOrders(saved ? JSON.parse(saved) : []);
      setLoading(false);
    }
  }, [isReady]);

  const persist = (updated: WorkOrder[]) => {
    setOrders(updated);
    localStorage.setItem("electricity_maintenance_orders", JSON.stringify(updated));
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order: WorkOrder = {
      id: `WO-E-${Math.floor(Math.random() * 10000)}`,
      title: newOrder.title, location: newOrder.location, type: newOrder.type,
      priority: newOrder.priority, assignedTo: newOrder.assignedTo,
      status: "open", createdAt: new Date().toLocaleString("en-US", { hour12: true }),
    };
    persist([order, ...orders]);
    toast.success(`Work order "${order.title}" created.`);
    setShowAddModal(false);
    setNewOrder({ title: "", location: "", type: "repair", priority: "medium", assignedTo: "" });
  };

  const handleStatusChange = (id: string, status: WorkOrder["status"]) => {
    persist(orders.map((o) => o.id === id ? { ...o, status } : o));
    toast.success(`Work order updated to ${status.replace("_", " ")}.`);
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const match = o.title.toLowerCase().includes(q) || o.location.toLowerCase().includes(q) || o.assignedTo.toLowerCase().includes(q);
    return match && (activeStatus === "all" || o.status === activeStatus);
  });

  if (!isReady) return null;

  const priorityColors: Record<string, string> = {
    low: "bg-slate-100 text-slate-700", medium: "bg-amber-100 text-amber-700",
    high: "bg-orange-100 text-orange-700", critical: "bg-rose-100 text-rose-700",
  };
  const statusColors: Record<string, string> = {
    open: "bg-amber-100 text-amber-800", in_progress: "bg-blue-100 text-blue-800", resolved: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-rose-700">Field Operations</p>
              <h1 className="text-3xl font-black text-slate-950">Electricity Maintenance System</h1>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm">
            <Plus className="h-5 w-5" /> New Work Order
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm flex-wrap">
            {(["all", ...STATUSES] as const).map((s) => (
              <button key={s} onClick={() => setActiveStatus(s)}
                className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search orders..."
              className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-rose-500 focus:outline-none shadow-sm" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Work Order</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-rose-500 mx-auto" /></td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      {orders.length === 0 ? (
                        <>
                          <Wrench className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                          <p className="font-bold text-slate-700">No Work Orders Yet</p>
                          <p className="text-sm text-slate-500 mt-1">Create your first work order to dispatch a field team.</p>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mx-auto h-10 w-10 text-amber-300 mb-3" />
                          <p className="font-bold text-slate-700">No orders match "{searchQuery}"</p>
                        </>
                      )}
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{order.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{order.id} · {order.location}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{order.createdAt}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-700 font-medium">{order.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${priorityColors[order.priority]}`}>
                        {order.priority === "critical" && <AlertTriangle className="h-3 w-3" />}
                        {order.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{order.assignedTo || "—"}</td>
                    <td className="px-6 py-4">
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value as WorkOrder["status"])}
                        className={`rounded-lg border-0 px-3 py-1.5 text-xs font-bold outline-none cursor-pointer ${statusColors[order.status]}`}>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-black text-slate-900">New Work Order</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddOrder} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Title / Task</label>
                <input required value={newOrder.title} onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })} placeholder="e.g. Replace transformer at Substation B"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-rose-500" />
              </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                <input required value={newOrder.location} onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })} placeholder="e.g. Banani, Grid Node A"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-rose-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                  <select value={newOrder.type} onChange={(e) => setNewOrder({ ...newOrder, type: e.target.value as WorkOrder["type"] })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-rose-500 bg-white">
                    <option value="inspection">Inspection</option>
                    <option value="repair">Repair</option>
                    <option value="replacement">Replacement</option>
                    <option value="upgrade">Upgrade</option>
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                  <select value={newOrder.priority} onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value as WorkOrder["priority"] })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-rose-500 bg-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Assigned To</label>
                <input value={newOrder.assignedTo} onChange={(e) => setNewOrder({ ...newOrder, assignedTo: e.target.value })} placeholder="e.g. Engineer Karim"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-rose-500" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
