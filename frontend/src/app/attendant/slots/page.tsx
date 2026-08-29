"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, RefreshCw, MapPin, LayoutGrid } from "lucide-react";

const STATUS_OPTIONS = ["available", "occupied", "maintenance"] as const;
type SlotStatus = typeof STATUS_OPTIONS[number];

const STATUS_STYLE: Record<SlotStatus, { label: string; bg: string; text: string; ring: string }> = {
  available:   { label: "Available",   bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-200 dark:ring-emerald-500/30" },
  occupied:    { label: "Occupied",    bg: "bg-rose-100 dark:bg-rose-500/10",       text: "text-rose-700 dark:text-rose-400",       ring: "ring-rose-200 dark:ring-rose-500/30" },
  maintenance: { label: "Maintenance", bg: "bg-amber-100 dark:bg-amber-500/10",     text: "text-amber-700 dark:text-amber-400",     ring: "ring-amber-200 dark:ring-amber-500/30" },
};

export default function AttendantSlotsPage() {
  const { isReady } = useRequireRole(["attendant"]);
  const [lots, setLots] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isReady) return;
    api.get("/parking/lots")
      .then(r => {
        setLots(r.data);
        if (r.data.length > 0) {
          setSelectedLot(r.data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady]);

  useEffect(() => {
    if (!selectedLot) return;
    setLoading(true);
    api.get(`/parking/lots/${selectedLot}/slots`)
      .then(r => setSlots(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedLot]);

  const handleUpdateStatus = async (slotId: number, status: SlotStatus) => {
    setUpdating(slotId);
    setMessage(null);
    try {
      await api.patch(`/parking/slots/${slotId}/status`, { status });
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status } : s));
      setMessage({ type: "success", text: `Slot updated to "${status}".` });
    } catch (e: any) {
      setMessage({ type: "error", text: e?.response?.data?.message || "Update failed." });
    } finally {
      setUpdating(null);
    }
  };

  const refresh = () => {
    if (!selectedLot) return;
    setLoading(true);
    api.get(`/parking/lots/${selectedLot}/slots`)
      .then(r => setSlots(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  if (!isReady) return null;

  const available = slots.filter(s => s.status === "available").length;
  const occupied = slots.filter(s => s.status === "occupied").length;
  const maintenance = slots.filter(s => s.status === "maintenance").length;

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      {/* Header */}
      <div
        className="border-b transition-colors"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-strong)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20 ring-1 ring-blue-200 dark:ring-blue-500/40">
                <LayoutGrid className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Slot Management</h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Mark parking slots as available, occupied, or under maintenance.
                </p>
              </div>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border transition-all self-start sm:self-auto"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {message && (
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Lot Selector */}
        <div
          className="rounded-2xl border p-4"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Select Parking Lot</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lots.map(lot => (
              <button
                key={lot.id}
                onClick={() => setSelectedLot(lot.id)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  selectedLot === lot.id
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20"
                    : "border hover:border-teal-400"
                }`}
                style={selectedLot !== lot.id ? { borderColor: "var(--border-strong)", color: "var(--text-secondary)", background: "var(--bg-background)" } : {}}
              >
                {lot.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {slots.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: available, ...STATUS_STYLE.available },
              { value: occupied, ...STATUS_STYLE.occupied },
              { value: maintenance, ...STATUS_STYLE.maintenance },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-2xl border p-4 text-center shadow-sm"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}
              >
                <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Slot Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : slots.length === 0 ? (
          <div
            className="py-20 text-center rounded-2xl border"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border-strong)" }}
          >
            <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>No slots found</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Select a lot or ask the operator to add slots.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {slots.map((slot: any) => {
              const s = STATUS_STYLE[slot.status as SlotStatus] ?? STATUS_STYLE.available;
              return (
                <div
                  key={slot.id}
                  className={`rounded-2xl border p-4 transition-all ring-1 ${s.bg} ${s.ring}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-lg font-black ${s.text}`}>#{slot.slotNumber}</p>
                    {slot.status === "available" && <CheckCircle2 className={`h-4 w-4 ${s.text}`} />}
                    {slot.status === "occupied" && <XCircle className={`h-4 w-4 ${s.text}`} />}
                    {slot.status === "maintenance" && <AlertTriangle className={`h-4 w-4 ${s.text}`} />}
                  </div>
                  <p className={`text-[10px] font-bold uppercase mb-3 ${s.text}`}>{s.label}</p>
                  <select
                    value={slot.status}
                    onChange={e => handleUpdateStatus(slot.id, e.target.value as SlotStatus)}
                    disabled={updating === slot.id}
                    className="w-full rounded-lg border px-2 py-1.5 text-[11px] font-bold outline-none transition cursor-pointer disabled:opacity-50"
                    style={{
                      background: "var(--bg-elevated)",
                      borderColor: "var(--border-strong)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>
                        {STATUS_STYLE[opt].label}
                      </option>
                    ))}
                  </select>
                  {updating === slot.id && (
                    <div className="flex justify-center mt-2">
                      <Loader2 className="h-3 w-3 animate-spin text-teal-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
