"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

export default function GasSafetyMonitoringPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold uppercase text-purple-700">Sensors & Safety</p>
          </div>
          <h1 className="text-3xl font-black text-slate-950">Gas Safety & Pressure Monitoring</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Track methane levels, main line pressure, and odorant concentrations across city nodes to detect hazardous leaks instantly.
          </p>
        </div>

        {/* Placeholder container */}
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Gas Safety & Pressure Monitoring</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            This module is currently inactive. The authority will deploy sensors and activate safety and pressure monitoring metrics in a future update.
          </p>
        </div>
      </main>
    </div>
  );
}
