"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Report } from "@/types/report";
import HeatmapLayer from "./HeatmapLayer";

export default function TransparencyMap({ reports }: { reports: Report[] }) {
  // Extract points for heatmap
  const points: [number, number, number][] = reports
    .filter((r) => r.latitude && r.longitude)
    .map((r) => {
      // higher priority = more intense heat
      let intensity = 10;
      if (r.priority === "critical") intensity = 50;
      else if (r.priority === "high") intensity = 30;
      else if (r.priority === "medium") intensity = 20;
      
      return [r.latitude!, r.longitude!, intensity];
    });

  const center: [number, number] = [23.6850, 90.3563]; // Bangladesh center

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm h-[500px]">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {points.length > 0 && (
          <HeatmapLayer points={points} radius={35} blur={25} maxZoom={10} max={50} />
        )}
      </MapContainer>
    </div>
  );
}
