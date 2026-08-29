"use client";

import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ParkingCinematicBackground } from "@/components/home/ParkingCinematicBackground";
import { Search, MapPin, Calendar, Car, AlertTriangle, ChevronRight, ShieldCheck, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function CitizenParkingPortal() {
  const { t, isBangla } = useLanguage();

  const modules = [
    {
      title: isBangla ? "খালি পার্কিং খুঁজুন" : "Find Parking",
      desc: isBangla
        ? "নিকটবর্তী পার্কিং স্পট খুঁজুন, রিয়েল-টাইম খালি স্পট দেখুন এবং অগ্রিম বুকিং করুন।"
        : "Search nearest available parking, see real-time slot occupancy, view lot amenities, and pre-book instantly.",
      href: "/find",
      icon: Search,
      tag: isBangla ? "লাইভ সেন্সর" : "Live Sensors",
      gradient: "from-teal-500 to-emerald-500",
      glowColor: "rgba(13, 148, 136, 0.4)",
      borderColor: "hover:border-teal-500/50",
    },
    {
      title: isBangla ? "আমার পার্কিং পাস" : "Manage Bookings",
      desc: isBangla
        ? "আপনার বর্তমান ও পূর্ববর্তী পার্কিং পাস দেখুন এবং ডিজিটাল চেক-ইন সুবিধা নিন।"
        : "View your active and past reservations, get automated digital parking passes, and process contactless check-in/out.",
      href: "/bookings",
      icon: Calendar,
      tag: isBangla ? "ফাস্ট পাস" : "Fast Pass",
      gradient: "from-blue-500 to-cyan-500",
      glowColor: "rgba(14, 165, 233, 0.4)",
      borderColor: "hover:border-blue-500/50",
    },
    {
      title: isBangla ? "নিবন্ধিত যানবাহন ও RFID" : "Vehicle Fleet Vault",
      desc: isBangla
        ? "আপনার গাড়ির নম্বর প্লেট ও আরএফআইডি ট্যাগ যুক্ত করে স্বয়ংক্রিয় গেট সুবিধা নিন।"
        : "Register your license plates, vehicle profiles, and RFID smart tags for automated barrier gate entry.",
      href: "/vehicles",
      icon: Car,
      tag: isBangla ? "অটো-গেট আরএফআইডি" : "Auto-Gate RFID",
      gradient: "from-indigo-500 to-violet-500",
      glowColor: "rgba(99, 102, 241, 0.4)",
      borderColor: "hover:border-indigo-500/50",
    },
    {
      title: isBangla ? "জরিমানা ও আপিল ভল্ট" : "Violations & Appeals",
      desc: isBangla
        ? "স্বয়ংক্রিয় ক্যামেরায় ইস্যুকৃত টিকিট দেখুন, ওভারস্টে জরিমানা পরিশোধ বা আপিল করুন।"
        : "Review issued automated camera tickets, check overstay penalties, and securely dispute or clear dues.",
      href: "/violations",
      icon: AlertTriangle,
      tag: isBangla ? "আপিল ভল্ট" : "Dispute Vault",
      gradient: "from-rose-500 to-amber-500",
      glowColor: "rgba(244, 63, 94, 0.4)",
      borderColor: "hover:border-rose-500/50",
    }
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative selection:bg-amber-500/30" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Smart Parking Garage & Map Background */}
      <ParkingCinematicBackground />

      <Navbar />

      <div className="py-14 relative overflow-hidden z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/25 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-5 shadow-sm backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span>{isBangla ? "স্বয়ংক্রিয় স্মার্ট পার্কিং গ্রিড • লাইডার সেন্সর সক্রিয়" : "Autonomous Smart Parking Grid • Active LiDAR"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white"
          >
            {t.parking.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed"
          >
            {t.parking.subtitle}
          </motion.p>

          {/* Quick Telemetry Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl"
          >
            <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-3.5 backdrop-blur-xl flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{isBangla ? "সেন্সর সক্রিয়" : "Sensors Active"}</p>
                <p className="text-sm font-black text-white">{isBangla ? "৯৯.৮% অনলাইন" : "99.8% Online"}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-3.5 backdrop-blur-xl flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{isBangla ? "খালি স্পট" : "Available Slots"}</p>
                <p className="text-sm font-black text-white">{isBangla ? "লাইভ ডিসপ্যাচ" : "Live Dispatched"}</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-950/70 border border-white/10 p-3.5 backdrop-blur-xl flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{isBangla ? "গেট সিস্টেম" : "Gate System"}</p>
                <p className="text-sm font-black text-white">{isBangla ? "স্বয়ংক্রিয় আরএফআইডি" : "Contactless RFID"}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * idx }}
            >
              <Link
                href={mod.href}
                className={`group relative rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-white/10 p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden min-h-[260px] ${mod.borderColor}`}
              >
                {/* Top specular hairline */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                {/* Hover Ambient Flare */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                  style={{ background: mod.glowColor }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-white shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-300`}>
                      <mod.icon className="h-7 w-7" />
                    </div>

                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-slate-300 group-hover:border-white/20 transition-colors">
                      {mod.tag}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white mb-2.5 group-hover:text-amber-300 transition-colors">
                    {mod.title}
                  </h2>

                  <p className="text-slate-300 text-sm leading-relaxed font-light">
                    {mod.desc}
                  </p>
                </div>

                <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
                    {t.common.openModule}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white group-hover:bg-white group-hover:text-slate-950 group-hover:border-white transition-all">
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}


