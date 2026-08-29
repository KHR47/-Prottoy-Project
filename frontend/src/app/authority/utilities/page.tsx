"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Droplets, 
  Flame, 
  Zap,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Radio
} from "lucide-react";

export default function AuthorityUtilitiesHub() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const { isBangla } = useLanguage();

  if (!isReady) return null;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/85 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-inner">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-black uppercase tracking-widest border border-blue-500/30">
                    <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
                    {isBangla ? "ইউটিলিটি গ্রিড কন্ট্রোল" : "UTILITY COMMAND CENTER"}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {isBangla ? "সিটি ইউটিলিটি ও অবকাঠামো হাব" : "Municipal Utility Command"}
                </h1>
                <p className="mt-2 text-slate-300 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
                  {isBangla
                    ? "ওয়াসা পানি সরবরাহ, তিতাস গ্যাস নেটওয়ার্ক এবং ডেসকো বিদ্যুৎ স্মার্ট মিটারের কেন্দ্রীয় তদারকি ও ফল্ট ডিটেকশন।"
                    : "Oversee critical city utility grids. Monitor pressure levels, configure automated tariff billing, isolate pipeline faults, and dispatch emergency repair crews."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3 Main Utility Grid Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Water */}
          <Link 
            href="/authority/water/dashboard" 
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-8 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-950/95 shadow-xl overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/20 blur-[50px] opacity-30 group-hover:opacity-75 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Droplets className="h-7 w-7" />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-900 border border-white/10 text-slate-400 flex items-center justify-center group-hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {isBangla ? "পানি ব্যবস্থাপনা (ওয়াসা)" : "Water Management"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-8">
                {isBangla 
                  ? "স্মার্ট পানির মিটার, মাসিক পানির বিলিং, পাম্প স্টেশন ও পাইপলাইন লিকেজ মেরামত দল নিয়ন্ত্রণ করুন।"
                  : "Oversee the city water grid. Monitor active smart meters, calculate automated billing, manage physical pumps, and dispatch leak repair teams."}
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-blue-400">
              <span>{isBangla ? "ওয়াসা কন্ট্রোল নোড" : "WASA Grid"}</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {isBangla ? "প্রবেশ করুন" : "Open Console"} <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Gas */}
          <Link 
            href="/authority/gas/dashboard" 
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-8 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-950/95 shadow-xl overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-500/20 blur-[50px] opacity-30 group-hover:opacity-75 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Flame className="h-7 w-7" />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-900 border border-white/10 text-slate-400 flex items-center justify-center group-hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                {isBangla ? "গ্যাস নেটওয়ার্ক (তিতাস)" : "Gas Network"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-8">
                {isBangla
                  ? "হাই-প্রেসার গ্যাস পাইপলাইন, আবাসিক সংযোগ, ট্যারিফ রেট এবং গ্যাস মিটার সমস্যা সমাধান।"
                  : "Monitor high-pressure main lines, oversee residential line gas connections, configure tariffs, and resolve smart meter faults."}
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-amber-400">
              <span>{isBangla ? "তিতাস গ্যাস নোড" : "Titas Gas Grid"}</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {isBangla ? "প্রবেশ করুন" : "Open Console"} <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Electricity */}
          <Link 
            href="/authority/electricity/dashboard" 
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-8 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/50 hover:bg-slate-950/95 shadow-xl overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-yellow-500/20 blur-[50px] opacity-30 group-hover:opacity-75 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Zap className="h-7 w-7" />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-900 border border-white/10 text-slate-400 flex items-center justify-center group-hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                {isBangla ? "বিদ্যুৎ গ্রিড (ডেসকো/ডিপিডিসি)" : "Power Grid"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-8">
                {isBangla
                  ? "সাবস্টেশন লোড ট্র্যাকিং, স্মার্ট প্রিপেইড মিটার এবং পিক আওয়ারে লোড-ব্যালেন্সিং নিয়ন্ত্রণ।"
                  : "Track substation loads, manage smart prepaid meters, and orchestrate grid load-balancing during peak hours."}
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-yellow-400">
              <span>{isBangla ? "ডেসকো পাওয়ার গ্রিড" : "DESCO Power Grid"}</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {isBangla ? "প্রবেশ করুন" : "Open Console"} <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

