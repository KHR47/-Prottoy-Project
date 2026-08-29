"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

if (typeof window !== "undefined") {
  // @ts-ignore
  window.L = L;
  require("leaflet.heat");
}

interface HeatmapLayerProps {
  points: [number, number, number][]; // [lat, lng, intensity]
  radius?: number;
  blur?: number;
  maxZoom?: number;
  max?: number;
}

export default function HeatmapLayer({ points, radius = 40, blur = 25, maxZoom = 13, max = 1.0 }: HeatmapLayerProps) {
  const map = useMap();
  const [layer, setLayer] = useState<any>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing layer if any
    if (layer) {
      map.removeLayer(layer);
    }

    // Create new heatmap layer
    const newLayer = (L as any).heatLayer(points, {
      radius,
      blur,
      maxZoom,
      max,
      minOpacity: 0.4,
      gradient: {
        0.2: 'blue',
        0.4: 'cyan',
        0.6: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    setLayer(newLayer);

    return () => {
      map.removeLayer(newLayer);
    };
  }, [map, points, radius, blur, maxZoom]);

  return null;
}
