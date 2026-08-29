"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Report } from "@/types/report";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

interface MapProps {
  reports: Report[];
}

import { useState } from "react";

export default function ReportsMap({ reports }: MapProps) {
  // Center of Bangladesh as default, locked in state to prevent leaflet crash
  const [defaultCenter] = useState<[number, number]>([23.685, 90.3563]);
  const [defaultZoom] = useState(7);

  const mapReports = reports.filter((r) => r.latitude && r.longitude);

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm z-0 relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude!, report.longitude!]}
          >
            <Popup>
              <div className="flex flex-col gap-2 min-w-48">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{report.title}</span>
                </div>
                <div className="flex gap-2 mb-1">
                  <StatusBadge status={report.status} />
                </div>
                <p className="text-xs text-slate-600 mb-2">{report.category.name}</p>
                <Link
                  href={`/reports/${report.id}`}
                  className="text-xs font-bold text-teal-600 hover:underline"
                >
                  View details &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
