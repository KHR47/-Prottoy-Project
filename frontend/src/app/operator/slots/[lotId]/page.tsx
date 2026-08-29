"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft, Plus, Loader2, Trash2, Layers,
  CheckCircle2, XCircle, AlertTriangle, Car, Bike, Zap, Accessibility,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; cardBg: string; cardBorder: string; text: string; dot: string }> = {
  available:   { label: "Available",   cardBg: "bg-emerald-50 dark:bg-emerald-500/10", cardBorder: "border-emerald-200 dark:border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  occupied:    { label: "Occupied",    cardBg: "bg-rose-50 dark:bg-rose-500/10",       cardBorder: "border-rose-200 dark:border-rose-500/30",       text: "text-rose-700 dark:text-rose-400",       dot: "bg-rose-500" },
  reserved:    { label: "Reserved",    cardBg: "bg-amber-50 dark:bg-amber-500/10",     cardBorder: "border-amber-200 dark:border-amber-500/30",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-500" },
  maintenance: { label: "Maint.",      cardBg: "bg-slate-100 dark:bg-slate-700/30",   cardBorder: "border-slate-200 dark:border-slate-600/30",     text: "text-slate-600 dark:text-slate-400",     dot: "bg-slate-400" },
};

const TYPE_ICON: Record<string, any> = {
  car: Car, bike: Bike, ev: Zap, handicap: Accessibility,
};

export default function OperatorSlotManagementPage() {
  const { lotId } = useParams();
  const [lot, setLot] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkForm, setBulkForm] = useState({ count: 10, floor: "1", zone: "A", type: "car" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/parking/lots/${lotId}`),
      api.get(`/parking/lots/${lotId}/slots`),
    ]).then(([l, s]) => {
      setLot(l.data);
      setSlots(s.data);
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, [lotId]);

  const handleBulkCreate = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/parking/lots/${lotId}/slots/bulk`, {
        count: Number(bulkForm.count),
        floor: bulkForm.floor,
        zone: bulkForm.zone,
        type: bulkForm.type,
      });
      setShowBulkForm(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create slots");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this slot?")) return;
    try {
      await api.delete(`/parking/slots/${id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete slot");
    }
  };

  if (loading) return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--bg-background)" }}>
      <Navbar />
      <div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-teal-500" /></div>
    </div>
  );

  const byZone = slots.reduce((acc: any, s: any) => {
    const z = s.zone || "General";
    if (!acc[z]) acc[z] = [];
    acc[z].push(s);
    return acc;
  }, {});

  const available = slots.filter(s => s.status === "available").length;
  const occupied = slots.filter(s => s.status === "occupied").length;
  const reserved = slots.filter(s => s.status === "reserved").length;

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      {/* Header */}
      <div
        className="border-b transition-colors"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-strong)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20 ring-1 ring-blue-200 dark:ring-blue-500/40 shadow-lg shadow-blue-500/10">
                <Layers className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Link
                  href="/operator/lots"
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1 hover:underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ArrowLeft className="h-3 w-3" /> All Lots
                </Link>
                <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                  Slot Management
                </h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {lot?.name} — {slots.length} total slots
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBulkForm(!showBulkForm)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 font-bold text-white shadow-lg transition-all self-start md:self-auto"
            >
              <Plus className="h-4 w-4" /> Bulk Add Slots
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: slots.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", ring: "ring-blue-200 dark:ring-blue-500/20" },
            { label: "Available", value: available, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", ring: "ring-emerald-200 dark:ring-emerald-500/20" },
            { label: "Occupied", value: occupied, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-500/10", ring: "ring-rose-200 dark:ring-rose-500/20" },
            { label: "Reserved", value: reserved, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", ring: "ring-amber-200 dark:ring-amber-500/20" },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center shadow-sm ring-1"
              style={{ background: "var(--bg-elevated)" }}
            >
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Legend:</span>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{val.label}</span>
            </div>
          ))}
        </div>

        {/* Bulk Add Form */}
        {showBulkForm && (
          <form
            onSubmit={handleBulkCreate}
            className="rounded-2xl border p-6"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}
          >
            <h3 className="text-lg font-black mb-5 pb-3 border-b" style={{ color: "var(--text-primary)", borderColor: "var(--border-strong)" }}>
              Bulk Create Slots
            </h3>
            <div className="grid gap-4 sm:grid-cols-4 mb-5">
              {[
                { label: "Count", key: "count", type: "number", min: 1, max: 100 },
                { label: "Floor", key: "floor", type: "text" },
                { label: "Zone", key: "zone", type: "text" },
              ].map(({ label, key, type, ...rest }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>{label}</label>
                  <input
                    type={type}
                    {...rest}
                    required
                    value={(bulkForm as any)[key]}
                    onChange={e => setBulkForm({ ...bulkForm, [key]: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>Type</label>
                <select
                  value={bulkForm.type}
                  onChange={e => setBulkForm({ ...bulkForm, type: e.target.value })}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
                >
                  <option value="car">🚗 Car</option>
                  <option value="bike">🏍 Bike</option>
                  <option value="ev">⚡ EV</option>
                  <option value="handicap">♿ Handicap</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowBulkForm(false)}
                className="rounded-xl border px-5 py-2 text-sm font-bold transition-all"
                style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2 text-sm font-bold text-white transition-all disabled:opacity-50"
              >
                {submitting ? "Generating…" : "Generate Slots"}
              </button>
            </div>
          </form>
        )}

        {/* Slot Grid by Zone */}
        {Object.keys(byZone).length === 0 ? (
          <div
            className="py-20 text-center rounded-2xl border"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}
          >
            <Layers className="h-14 w-14 mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>No slots yet</p>
            <p className="text-sm mt-1 mb-5" style={{ color: "var(--text-muted)" }}>
              Use "Bulk Add Slots" to generate them for this lot.
            </p>
            <button
              onClick={() => setShowBulkForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition-all"
            >
              <Plus className="h-4 w-4" /> Bulk Add Slots
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(byZone).map(([zone, zoneSlots]: [string, any]) => (
              <div key={zone}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>Zone {zone}</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {zoneSlots.length} slots
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--border-strong)" }} />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2.5">
                  {zoneSlots.map((slot: any) => {
                    const cfg = STATUS_CONFIG[slot.status] ?? STATUS_CONFIG.available;
                    const TypeIcon = TYPE_ICON[slot.type] ?? Car;
                    return (
                      <div
                        key={slot.id}
                        className={`group relative rounded-xl border p-3 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${cfg.cardBg} ${cfg.cardBorder}`}
                      >
                        <TypeIcon className={`h-4 w-4 mb-1.5 ${cfg.text}`} />
                        <span className={`text-xs font-black ${cfg.text}`}>{slot.slotNumber}</span>
                        <div className={`mt-1 h-1.5 w-1.5 rounded-full ${cfg.dot}`} />

                        {/* Hover overlay — delete */}
                        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="h-8 w-8 rounded-lg bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
