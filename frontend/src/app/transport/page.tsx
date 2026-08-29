"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { TransportCinematicBackground } from "@/components/home/TransportCinematicBackground";
import { Bus, MapPin, Ticket, AlertTriangle, MessageSquare, Navigation, Clock, Zap, ChevronRight } from "lucide-react";

const tiles = [
  { href: "/transport/routes", icon: Bus, label: "City Routes (Dhaka)", desc: "Browse all 30 Dhaka city bus routes with stops, fares & operators", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20 hover:border-sky-400/60" },
  { href: "/transport/intercity", icon: MapPin, label: "Intercity Routes", desc: "30 routes across all 8 divisions — Grameen, Green Line, Ena, Shohag & more", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20 hover:border-emerald-400/60" },
  { href: "/transport/planner", icon: Navigation, label: "Trip Planner", desc: "Enter From → To and get the best route instantly", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20 hover:border-violet-400/60" },
  { href: "/transport/tickets/buy", icon: Ticket, label: "Buy Ticket", desc: "Purchase single-journey or monthly pass tickets", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20 hover:border-amber-400/60" },
  { href: "/transport/tickets", icon: Clock, label: "My Tickets", desc: "View your active, used and expired travel tickets", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20 hover:border-orange-400/60" },
  { href: "/transport/alerts", icon: AlertTriangle, label: "Live Alerts", desc: "Check real-time service disruptions and delays", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20 hover:border-rose-400/60" },
  { href: "/transport/feedback", icon: MessageSquare, label: "Feedback", desc: "Rate your journey or report an issue with the service", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20 hover:border-teal-400/60" },
];

export default function TransportHubPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Hyper-Realistic Animated Transit Network Background */}
      <TransportCinematicBackground />

      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 shrink-0 border-b border-white/10 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-base)] z-0" />
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 h-[60vh] w-[60vh] rounded-full bg-sky-500/20 blur-[100px] translate-x-1/4 -translate-y-1/4" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 ring-1 ring-sky-500/30 shadow-xl shadow-sky-500/5">
              <Bus className="h-10 w-10 text-sky-500" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-sky-500 mb-1">Dhaka Smart City</p>
              <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] leading-tight tracking-tight">
                Public Transport <br className="hidden md:block" />
                <span className="text-sky-500">Portal</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-lg mt-3 max-w-2xl leading-relaxed">
                Plan your journey, buy tickets, track buses and get real-time alerts — all in one place.
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
            {[
              { label: "City Routes", value: "30" },
              { label: "Intercity Routes", value: "30" },
              { label: "Divisions Covered", value: "8" },
              { label: "Bus Operators", value: "20+" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-[1.5rem] bg-[var(--bg-surface)] border border-[var(--border)] px-5 py-4 text-center shadow-sm">
                <p className="text-3xl font-black text-[var(--text-primary)]">{value}</p>
                <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-grow w-full">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(({ href, icon: Icon, label, desc, color, bg, border }) => (
            <Link key={href} href={href}
              className={`group relative rounded-[2rem] border border-[var(--border)] bg-[var(--bg-surface)] p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-sky-500/30 overflow-hidden flex flex-col h-full`}>
              <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-${color.split('-')[1]}-500/5 transition-all duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-5 mb-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${bg} border ${border} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`h-7 w-7 ${color}`} />
                  </div>
                </div>
                
                <h2 className={`text-xl font-black text-[var(--text-primary)] group-hover:${color} transition-colors tracking-tight mb-2`}>
                  {label}
                </h2>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed flex-grow">
                  {desc}
                </p>
                
                <div className={`mt-6 flex items-center text-sm font-bold ${color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}>
                  Open Portal <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
