"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route, MapPin, Calendar, Bus, AlertTriangle, DollarSign, MessageSquare } from "lucide-react";

const subNavItems = [
  { href: "/operator/routes", label: "City Routes", icon: Route },
  { href: "/operator/intercity", label: "Intercity Routes", icon: MapPin },
  { href: "/operator/schedules", label: "Schedules", icon: Calendar },
  { href: "/operator/vehicles", label: "Vehicles & Fleet", icon: Bus },
  { href: "/operator/disruptions", label: "Disruptions", icon: AlertTriangle },
  { href: "/operator/fares", label: "Fares & Payment Received", icon: DollarSign },
  { href: "/operator/feedback", label: "Feedback", icon: MessageSquare },
];

export function TransportOperatorNavbar() {
  const pathname = usePathname();

  return (
    <div className="border-b" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto py-3 gap-2 scrollbar-none">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 border ${
                  active
                    ? "bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-900/10"
                    : "hover:bg-[var(--bg-hover)] border-transparent"
                }`}
                style={!active ? { color: "var(--text-secondary)" } : {}}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
