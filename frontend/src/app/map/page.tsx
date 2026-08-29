"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import type { Report } from "@/types/report";

import { getUser } from "@/lib/auth";

// Dynamically import map to avoid SSR window is not defined errors
const ReportsMap = dynamic(() => import("@/components/reports/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-lg bg-slate-100 animate-pulse flex items-center justify-center border border-slate-200">
      <p className="text-slate-500 font-bold">Loading Map...</p>
    </div>
  ),
});

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getUser();
    const endpoint = user?.role === 'admin' || user?.role === 'authority' || user?.role === 'officer' 
      ? '/reports' 
      : '/reports/public';

    api
      .get(endpoint)
      .then((res) => setReports(res.data))
      .catch(() => setError("Failed to load map data"));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-teal-700">Explore</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">City Map</h1>
          <p className="mt-2 text-slate-600">
            View all reported issues and crimes across the city.
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <ReportsMap reports={reports} />
      </main>
    </>
  );
}
