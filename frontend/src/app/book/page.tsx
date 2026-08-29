"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { MapPin, Car, Loader2, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

function BookSlotContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slotId = searchParams.get("slotId");
  
  const [slot, setSlot] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState({ vehicleNumber: "", vehicleId: "", notes: "" });

  useEffect(() => {
    if (!slotId) {
      router.push("/find");
      return;
    }
    Promise.all([
      api.get(`/parking/slots/${slotId}`).catch(() => ({ data: null })), // Assuming this endpoint exists, or we might need to get lot and find slot
      api.get("/parking/my-vehicles").catch(() => ({ data: [] }))
    ]).then(([slotRes, vehRes]) => {
      if (!slotRes.data) router.push("/find");
      setSlot(slotRes.data);
      setVehicles(vehRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [slotId, router]);

  const handleBook = async () => {
    if (!slot || (!booking.vehicleNumber && !booking.vehicleId)) return;
    setSubmitting(true);
    try {
      const res = await api.post("/parking/book", {
        slotId: slot.id,
        vehicleNumber: booking.vehicleNumber || vehicles.find(v => v.id == booking.vehicleId)?.plateNumber,
        vehicleId: booking.vehicleId || null,
        notes: booking.notes,
        startTime: new Date().toISOString(),
      });
      router.push("/bookings");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Booking failed");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-teal-600" /></div>;
  if (!slot) return null;

  const lot = slot.parkingLot;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href={lot ? `/lots/${lot.id}` : "/find"} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" /> Back to Lot Details
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Book Slot {slot.slotNumber}</h1>
        {lot && (
           <p className="flex items-center gap-1.5 text-sm text-slate-500 mb-8">
             <MapPin className="h-4 w-4" /> {lot.name} · Zone {slot.zone || "General"} · ৳{lot.hourlyRate}/hr
           </p>
        )}

        <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 mb-8 flex items-start gap-3">
           <Clock className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
           <p className="text-sm text-teal-800">
             Reserving this slot will start a hold timer. You must arrive within 30 minutes to claim your spot or the reservation will be automatically cancelled.
           </p>
        </div>

        <div className="space-y-5">
          {vehicles.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Select Registered Vehicle</label>
              <select value={booking.vehicleId} onChange={e => setBooking({ ...booking, vehicleId: e.target.value, vehicleNumber: "" })}
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium focus:border-teal-500 focus:ring-0">
                <option value="">-- Choose a vehicle --</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.plateNumber} ({v.brand || v.type})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
              {vehicles.length > 0 ? "Or enter plate number manually" : "Vehicle Plate Number *"}
            </label>
            <input type="text" placeholder="e.g. DHAKA-METRO-GA-11-2233"
              value={booking.vehicleNumber} onChange={e => setBooking({ ...booking, vehicleNumber: e.target.value, vehicleId: "" })}
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium focus:border-teal-500 focus:ring-0" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Special Notes (optional)</label>
            <input type="text" placeholder="Any special instructions…"
              value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium focus:border-teal-500 focus:ring-0" />
          </div>
        </div>

        <button onClick={handleBook} disabled={submitting || (!booking.vehicleNumber && !booking.vehicleId)}
          className="mt-8 w-full rounded-2xl bg-teal-600 py-4 text-sm font-black text-white shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition-all disabled:opacity-50">
          {submitting ? "Processing Reservation…" : "Confirm Reservation"}
        </button>
      </div>
    </div>
  );
}

export default function BookSlotPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Navbar />
      <Suspense fallback={<div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-teal-600" /></div>}>
        <BookSlotContent />
      </Suspense>
    </div>
  );
}
