"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { 
  BarChart3, MapPin, TrendingUp, DollarSign, Activity, 
  Plus, AlertTriangle, ChevronRight, Loader2, Car, 
  Users, CreditCard, Calendar, ArrowUpRight, Clock
} from "lucide-react";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ParkingOperatorDashboard() {
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
      setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const quickLinks = [
    { label: "Lot & Slot Management", href: "/operator/lots", icon: MapPin, color: "blue", desc: "Create lots and configure slots" },
    { label: "All Bookings", href: "/operator/bookings", icon: Calendar, color: "amber", desc: "Monitor reservations" },
    { label: "Pricing Rules", href: "/operator/pricing", icon: TrendingUp, color: "purple", desc: "Set rates and peak prices" },
    { label: "Payment Monitor", href: "/operator/payments", icon: CreditCard, color: "emerald", desc: "Track payments received & overdue" },
    { label: "Violations", href: "/operator/violations", icon: AlertTriangle, color: "rose", desc: "Manage fines and disputes" },
  ];

  const colorClasses: Record<string, { bg: string, text: string, ring: string, hover: string, glow: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", ring: "ring-emerald-500/30", hover: "hover:border-emerald-500/50", glow: "bg-emerald-500/20" },
    teal: { bg: "bg-teal-500/10", text: "text-teal-500", ring: "ring-teal-500/30", hover: "hover:border-teal-500/50", glow: "bg-teal-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", ring: "ring-blue-500/30", hover: "hover:border-blue-500/50", glow: "bg-blue-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500", ring: "ring-amber-500/30", hover: "hover:border-amber-500/50", glow: "bg-amber-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500", ring: "ring-purple-500/30", hover: "hover:border-purple-500/50", glow: "bg-purple-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-500", ring: "ring-rose-500/30", hover: "hover:border-rose-500/50", glow: "bg-rose-500/20" },
  };

  return (
    <div className="min-h-screen text-slate-100" style={{ background: "var(--bg-base)" }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-[var(--bg-surface)]/60 p-8 sm:p-10 backdrop-blur-xl shadow-2xl"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 shadow-inner">
                <Car className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-teal-400 mb-1">
                  Parking Operations Center
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {greeting}, Operator.
                </h1>
                <p className="mt-2 text-slate-400 max-w-xl leading-relaxed">
                  Configure parking lots, adjust rules, review bookings, payments, and violations across the city parking grid.
                </p>
              </div>
            </div>
            
            <div className="flex shrink-0 items-center gap-4">
              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/50 px-5 py-3 backdrop-blur-md">
                <Clock className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Local Time</p>
                  <p className="text-sm font-bold text-slate-200 tabular-nums">{time || "—:—"}</p>
                </div>
              </div>
              <Link href="/operator/lots/new"
                className="flex h-full items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20">
                <Plus className="h-5 w-5" /> New Lot
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Consoles Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-400" />
            Operational Consoles
          </h3>
          <motion.div 
            variants={container} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {quickLinks.map(link => {
              const style = colorClasses[link.color];
              return (
                <motion.div key={link.label} variants={item}>
                  <Link href={link.href}
                    className={`group flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-[var(--bg-surface)]/40 p-5 backdrop-blur-md transition-all duration-300 hover:bg-[var(--bg-surface)]/80 hover:shadow-xl ${style.hover} overflow-hidden`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${style.bg} border-current/10 ${style.text} ring-1 ${style.ring} transition-transform duration-300 group-hover:scale-110`}>
                      <link.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-100 group-hover:text-white transition-colors">{link.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                    </div>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors duration-300 group-hover:${style.bg} group-hover:${style.text}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
