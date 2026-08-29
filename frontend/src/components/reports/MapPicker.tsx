"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

interface MapPickerProps {
  latitude: number | undefined;
  longitude: number | undefined;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ latitude, longitude, onChange }: MapPickerProps) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return latitude && longitude ? (
    <Marker position={[latitude, longitude]}></Marker>
  ) : null;
}

function MapUpdater({ latitude, longitude }: { latitude?: number, longitude?: number }) {
  const map = useMap();
  useEffect(() => {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], 14, { animate: true });
    }
  }, [latitude, longitude, map]);
  return null;
}

export default function MapPicker(props: MapPickerProps) {
  const defaultCenter: [number, number] = [23.8103, 90.4125]; // Dhaka
  const initialCenter: [number, number] = props.latitude ? [props.latitude, props.longitude!] : defaultCenter;
  const initialZoom = props.latitude ? 14 : 11;

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-200 z-0 relative">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker {...props} />
        <MapUpdater latitude={props.latitude} longitude={props.longitude} />
      </MapContainer>
    </div>
  );
}
