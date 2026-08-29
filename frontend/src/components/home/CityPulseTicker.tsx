"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Scale, Car, PackageSearch, Activity, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Metric {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: typeof ShieldCheck;
  accent: string;
  glow: string;
  status: string;
}

const metrics: Metric[] = [
  {
    id: "civic",
    label: "Civic Resolution",
    value: "98.2%",
    sub: "Incident Response",
    icon: ShieldCheck,
    accent: "text-teal-400",
    glow: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    status: "Active Dispatch",
  },
  {
    id: "ghush",
    label: "Anti-Corruption Vault",
    value: "100%",
    sub: "Encrypted Review",
    icon: Scale,
    accent: "text-amber-400",
    glow: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    status: "Tamper Proof",
  },
  {
    id: "parking",
    label: "Parking Sensors",
    value: "840+",
    sub: "Live Open Bays",
    icon: Car,
    accent: "text-emerald-400",
    glow: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    status: "IoT Mesh",
  },
  {
    id: "lost-found",
    label: "Lost & Found Custody",
    value: "340+",
    sub: "Belongings Reunited",
    icon: PackageSearch,
    accent: "text-orange-400",
    glow: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    status: "Verified Claims",
  },
];

export function CityPulseTicker() {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % metrics.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Live Dhaka Telemetry Stream
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
          <Activity className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
          <span>Real-time Mesh Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          const isPulsing = pulseIndex === idx;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all duration-500 bg-[var(--bg-surface)]/80 backdrop-blur-xl ${
                isPulsing
                  ? "border-[var(--border-strong)] shadow-lg shadow-teal-500/5"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]"
              }`}
            >
              {/* Subtle top indicator line */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-500 ${
                  isPulsing ? "opacity-100 bg-gradient-to-r from-transparent via-teal-400 to-transparent" : "opacity-0"
                }`}
              />

              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl border ${item.glow}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-muted)]">
                  {item.status}
                </span>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
                  {item.label}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {item.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
