"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { MapPin, Clock, DollarSign, Car, Loader2, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LotDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lot, setLot] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/parking/lots/${id}`),
      api.get(`/parking/lots/${id}/slots`),
    ]).then(([lotRes, slotsRes]) => {
      setLot(lotRes.data);
      setSlots(slotsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);



  const slotIcon = (status: string) => {
    if (status === "available") return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    if (status === "occupied") return <XCircle className="h-5 w-5 text-rose-500" />;
    if (status === "reserved") return <AlertCircle className="h-5 w-5 text-amber-500" />;
    return <AlertCircle className="h-5 w-5 text-slate-400" />;
  };

  const slotColor = (status: string) => {
    if (status === "available") return "border-emerald-200 bg-emerald-50 hover:border-emerald-400 cursor-pointer";
    if (status === "occupied") return "border-rose-200 bg-rose-50 opacity-60 cursor-not-allowed";
    if (status === "reserved") return "border-amber-200 bg-amber-50 opacity-60 cursor-not-allowed";
    return "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed";
  };

  if (loading) return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Navbar />
      <div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-teal-600" /></div>
    </div>
  );

  if (!lot) return null;

  const byZone = slots.reduce((acc: any, s: any) => {
    const z = s.zone || "General";
    if (!acc[z]) acc[z] = [];
    acc[z].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Navbar />

      {/* Header */}
      <div className="border-b" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/find" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700">
            <ArrowLeft className="h-4 w-4" /> Back to Find Parking
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-2">
            <div>
              <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{lot.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <MapPin className="h-4 w-4" />{lot.location}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Available", value: lot.availableSlots, color: "text-emerald-600" },
                { label: "Total", value: lot.totalSlots, color: "text-teal-600" },
                { label: "Rate", value: `৳${lot.hourlyRate}/hr`, color: "text-amber-600" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: "var(--border)", background: "var(--bg-base)" }}>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4">
          {[
            { color: "bg-emerald-100 border-emerald-300", label: "Available" },
            { color: "bg-amber-100 border-amber-300", label: "Reserved" },
            { color: "bg-rose-100 border-rose-300", label: "Occupied" },
            { color: "bg-slate-100 border-slate-300", label: "Maintenance" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded border-2 ${l.color}`} />
              <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Slot Grid by Zone */}
        {Object.entries(byZone).map(([zone, zoneSlots]: [string, any]) => (
          <div key={zone} className="mb-8">
            <h3 className="mb-4 text-lg font-black" style={{ color: "var(--text-primary)" }}>Zone {zone}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {zoneSlots.map((slot: any) => (
                <button
                  key={slot.id}
                  onClick={() => {
                    if (slot.status === "available") {
                      router.push(`/book?slotId=${slot.id}`);
                    }
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 py-3 text-center transition-all ${slotColor(slot.status)}`}
                >
                  {slotIcon(slot.status)}
                  <span className="mt-1 text-xs font-bold" style={{ color: "var(--text-primary)" }}>{slot.slotNumber}</span>
                  {slot.type !== "car" && <span className="text-[9px] uppercase tracking-wider text-slate-400">{slot.type}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}

        {slots.length === 0 && (
          <div className="py-20 text-center rounded-3xl border" style={{ borderColor: "var(--border)" }}>
            <Car className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold" style={{ color: "var(--text-muted)" }}>No slots defined yet.</p>
          </div>
        )}
      </main>

    </div>
  );
}
