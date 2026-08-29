"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { PlusCircle, MapPin, CheckCircle, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

const MapPicker = dynamic(() => import("@/components/reports/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-100/50 rounded-2xl animate-pulse flex items-center justify-center border-2 border-dashed border-slate-200">
      <div className="flex items-center gap-2 text-slate-400 font-medium">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading Map...
      </div>
    </div>
  ),
});

export default function RequestElectricityMeterPage() {
  const { isReady, user } = useRequireRole(["citizen"]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [formData, setFormData] = useState({
    propertyType: "residential",
    cityName: "",
    address: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  async function handleMapClick(lat: number, lng: number) {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setIsAutofilling(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data?.display_name) {
        const addr = data.address || {};
        let district = addr.city || addr.state_district || addr.county || "";
        if (district.toLowerCase().includes("district")) district = district.replace(/district/i, "").trim();
        setFormData((prev) => ({ ...prev, address: data.display_name, cityName: district }));
      }
    } catch (err) { console.error(err); }
    finally { setIsAutofilling(false); }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/electricity/meters", {
        citizenName: user?.name,
        zone: formData.cityName || "Unknown",
        type: formData.propertyType,
        address: formData.address,
      });
      toast.success("Smart meter request submitted! The Authority will review your application.");
      router.push("/electricity");
    } catch (err) { toast.error(getErrorMessage(err, "Failed to submit request.")); }
    finally { setIsSubmitting(false); }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-bold uppercase text-yellow-700">Service Request</p>
          <h1 className="text-3xl font-black text-slate-950">Request Smart Electricity Meter</h1>
          <p className="mt-2 text-slate-600">Apply for a new digital electricity connection. Once approved, the Authority will install your smart meter and configure your monthly limit.</p>
        </div>

        <div className="mb-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex gap-4 shadow-sm items-start">
          <Info className="h-6 w-6 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-yellow-900">
            <strong>Tiered Billing Notice:</strong> Your bill is calculated using a tiered kWh rate system. Excess usage beyond your approved monthly limit may incur penalty charges.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Applicant Name</label>
              <input type="text" disabled value={user?.name || "Loading..."}
                className="block w-full rounded-lg border border-slate-300 bg-slate-100 py-3 px-4 text-sm font-bold text-slate-700 cursor-not-allowed" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Property Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[{ value: "residential", label: "Residential", desc: "Home or Apartment" },
                  { value: "commercial", label: "Commercial", desc: "Office or Restaurant" },
                  { value: "industrial", label: "Industrial", desc: "Factory or Warehouse" }
                ].map((opt) => (
                  <label key={opt.value} className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition focus-within:ring-2 focus-within:ring-yellow-500">
                    <input type="radio" name="propertyType" value={opt.value} checked={formData.propertyType === opt.value}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })} className="sr-only" required />
                    <span className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{opt.label}</span>
                      <span className="mt-1 text-xs text-slate-500">{opt.desc}</span>
                    </span>
                    {formData.propertyType === opt.value && <CheckCircle className="absolute right-4 top-4 h-5 w-5 text-yellow-500" />}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-900">Pin Location on Map</label>
                {isAutofilling && (
                  <span className="flex items-center gap-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    <Loader2 className="h-3 w-3 animate-spin" /> Auto-filling...
                  </span>
                )}
              </div>
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-inner">
                <MapPicker latitude={formData.latitude} longitude={formData.longitude} onChange={handleMapClick} />
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-[1000] flex justify-center">
                  <div className="bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-yellow-400" /> Click map to auto-fill address
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="mb-2 block text-sm font-bold text-slate-900">District</label>
                <input type="text" readOnly placeholder="Auto-filled" value={formData.cityName}
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 px-4 text-sm font-semibold text-slate-700 cursor-not-allowed" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-900">Full Address</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Road 12, Block C, House 14"
                    className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Property Ownership Document</label>
              <input type="file" required
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 transition cursor-pointer" />
              <p className="mt-2 text-xs text-slate-500">Upload your property deed or electricity feasibility certificate.</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button type="submit" disabled={isSubmitting}
              className="flex w-full justify-center rounded-lg bg-yellow-500 px-3 py-4 text-sm font-bold text-white shadow-sm hover:bg-yellow-600 disabled:opacity-70 disabled:cursor-not-allowed transition">
              <PlusCircle className="mr-2 h-5 w-5" />
              {isSubmitting ? "Submitting Application..." : "Submit Meter Request"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
