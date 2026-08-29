"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  MapPin, Plus, Trash2, Loader2, Navigation,
  Layers, Clock, CheckCircle2, XCircle, TrendingUp, Car, ChevronRight,
} from "lucide-react";

export default function OperatorLotsPage() {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/parking/operator/lots")
      .then((res) => setLots(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this parking lot and all its slots?")) return;
    try {
      await api.delete(`/parking/lots/${id}`);
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to delete lot");
    }
  };

  const totalSlots = lots.reduce((sum, l) => sum + (l.totalSlots || 0), 0);
  const activeLots = lots.filter(l => l.isActive).length;

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      {/* Header */}
      <div
        className="border-b transition-colors"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-strong)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-500/20 ring-1 ring-teal-200 dark:ring-teal-500/40 shadow-lg shadow-teal-500/10">
                <MapPin className="h-7 w-7 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">
                  Parking Infrastructure
                </p>
                <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                  Lot Management
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {activeLots} active lots · {totalSlots} total slots across the city
                </p>
              </div>
            </div>
            <Link
              href="/operator/lots/new"
              className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-3 font-bold text-white shadow-lg shadow-teal-900/20 transition-all self-start md:self-auto"
            >
              <Plus className="h-5 w-5" /> Create New Lot
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
          </div>
        ) : lots.length === 0 ? (
          <div
            className="py-20 text-center rounded-2xl border"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}
          >
            <MapPin className="h-14 w-14 mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>No parking lots yet</p>
            <p className="text-sm mt-1 mb-5" style={{ color: "var(--text-muted)" }}>
              Create your first lot to start managing parking slots.
            </p>
            <Link
              href="/operator/lots/new"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-sm font-bold text-white transition-all"
            >
              <Plus className="h-4 w-4" /> Create First Lot
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {lots.map((lot) => {
              const occupiedCount = lot.slots?.filter((s: any) => s.status === "occupied").length ?? "—";
              const availableCount = lot.slots?.filter((s: any) => s.status === "available").length ?? "—";
              return (
                <div
                  key={lot.id}
                  className="rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}
                >
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-500/10 ring-1 ring-teal-200 dark:ring-teal-500/20">
                      <MapPin className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                          {lot.name}
                        </h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          lot.isActive
                            ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                        }`}>
                          {lot.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm flex items-center gap-1.5 mb-4" style={{ color: "var(--text-muted)" }}>
                        <Navigation className="h-3.5 w-3.5" />{lot.location}
                      </p>

                      {/* Stats row */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { icon: Layers, label: "Capacity", value: lot.totalSlots, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-500/10" },
                          { icon: CheckCircle2, label: "Available", value: availableCount, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                          { icon: Car, label: "Occupied", value: occupiedCount, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10" },
                          { icon: TrendingUp, label: "Rate", value: `৳${lot.hourlyRate}/hr`, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
                        ].map(stat => (
                          <div key={stat.label} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${stat.bg}`}>
                            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{stat.label}:</span>
                            <span className={`text-xs font-black ${stat.color}`}>{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 md:flex-col md:items-end lg:flex-row lg:items-center shrink-0">
                    <Link
                      href={`/operator/slots/${lot.id}`}
                      className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400"
                      style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)", background: "var(--bg-background)" }}
                    >
                      <Layers className="h-4 w-4" />
                      Manage Slots
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => handleDelete(lot.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500"
                      style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
