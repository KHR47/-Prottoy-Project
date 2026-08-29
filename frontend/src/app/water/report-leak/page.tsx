"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { AlertCircle, MapPin, Camera, Info } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ReportLeakPage() {
  const { isReady } = useRequireRole(["citizen"]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Leak reported successfully. A team will be dispatched soon.");
      router.push("/water");
    }, 1500);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-bold uppercase text-rose-700">Emergency Reporting</p>
          <h1 className="text-3xl font-black text-slate-950">Report a Water Leak</h1>
          <p className="mt-2 text-slate-600">
            Help us conserve water and prevent property damage by reporting broken pipes, overflowing drains, or continuous leaks.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-4 shadow-sm items-start">
            <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-medium text-blue-900">
                    If this is a major burst pipe causing immediate flooding, please also call the emergency hotline at <strong>16162</strong> immediately after submitting this form.
                </p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            
            {/* Leak Type */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Type of Leak</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm focus-within:ring-2 focus-within:ring-rose-500 hover:bg-slate-50">
                  <input type="radio" name="leakType" value="burst_pipe" className="sr-only" required />
                  <span className="flex flex-col">
                    <span className="block text-sm font-bold text-slate-900">Burst Main Pipe</span>
                    <span className="mt-1 flex items-center text-xs text-slate-500">Large volume of water erupting</span>
                  </span>
                </label>
                <label className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm focus-within:ring-2 focus-within:ring-rose-500 hover:bg-slate-50">
                  <input type="radio" name="leakType" value="surface_leak" className="sr-only" />
                  <span className="flex flex-col">
                    <span className="block text-sm font-bold text-slate-900">Surface Leak</span>
                    <span className="mt-1 flex items-center text-xs text-slate-500">Water pooling on road/sidewalk</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Location</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Street address, nearby landmark, or coordinates"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Description</label>
              <textarea
                required
                rows={4}
                placeholder="Please describe the severity of the leak, how long it has been happening, and any specific details that might help the maintenance crew..."
                className="block w-full rounded-lg border border-slate-300 bg-white p-3 text-sm placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Photo Upload (Mock) */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Upload Photo (Optional)</label>
              <div className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-8 hover:bg-slate-50 transition cursor-pointer">
                <div className="text-center">
                  <Camera className="mx-auto h-8 w-8 text-slate-400" />
                  <div className="mt-4 flex text-sm leading-6 text-slate-600">
                    <span className="relative rounded-md bg-transparent font-semibold text-rose-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-rose-600 focus-within:ring-offset-2 hover:text-rose-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" />
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-lg bg-rose-600 px-3 py-4 text-sm font-bold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Submitting Report..." : "Submit Leak Report"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
