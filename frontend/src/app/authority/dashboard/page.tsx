"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { motion, type Variants } from "framer-motion";
import {
  ShieldCheck, Droplets, Flame, Zap, ChevronRight,
  Activity, Bus, Car, Clock, ShieldAlert,
  ArrowUpRight, Scale, PackageSearch, Building,
  Wrench, Map, AlertTriangle, CheckCircle2, Radio,
  Users, Layers
} from "lucide-react";
import { AuthorityCinematicBackground } from "@/components/home/AuthorityCinematicBackground";

export default function AuthorityDashboard() {
  const { isReady, user } = useRequireRole(["authority", "admin"]);
  const { t, isBangla } = useLanguage();
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState("");

  const [stats, setStats] = useState({
    activeCitizens: "0",
    whistleblowerCount: 0,
    reportsResolved: "100%",
    resolvedReportsCount: 0,
    totalReportsCount: 0,
    verifiedPros: "0",
    reunitedItemsCount: 0,
    availableBaysCount: 0,
    totalBaysCount: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      setGreeting(
        h < 12
          ? isBangla ? "শুভ সকাল" : "Good morning"
          : h < 18
          ? isBangla ? "শুভ অপরাহ্ন" : "Good afternoon"
          : isBangla ? "শুভ সন্ধ্যা" : "Good evening"
      );
      setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
    };
    tick();
    const id = setInterval(tick, 60_000);

    // Fetch real-time public telemetry
    api.get("/stats/public")
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((e) => console.error("Authority stats error:", e));

    return () => clearInterval(id);
  }, [isBangla]);

  const controlModules = [
    {
      href: "/authority/reports",
      title: isBangla ? "নাগরিক অভিযোগ ও ক্রাইম ট্রায়াজ" : "Civic & Crime Triage",
      badge: isBangla ? "স্মার্ট ডিসপ্যাচ" : "Smart Dispatch",
      description: isBangla 
        ? "নাগরিকদের দাখিলকৃত রিপোর্ট পর্যালোচনা করুন, এআই ভিত্তিক নিকটস্থ অফিসার সুপারিশ গ্রহণ করুন এবং সমাধানের অগ্রগতি পর্যবেক্ষণ করুন।"
        : "Review citizen-submitted infrastructure, public safety, and hazard reports. Dispatch closest field officers via load-balanced routing.",
      icon: ShieldCheck,
      color: "teal",
      statValue: `${stats.totalReportsCount}`,
      statLabel: isBangla ? "মোট রিপোর্ট" : "Logged Reports",
    },
    {
      href: "/ghush-reports",
      title: isBangla ? "দুর্নীতি ও ঘুষ অডিট ভল্ট" : "Whistleblower & ACC Vault",
      badge: isBangla ? "এনক্রিপ্টেড ডসিয়ার" : "Encrypted Audit",
      description: isBangla
        ? "দাখিলকৃত ঘুষের দাবি ও দুর্নীতির প্রমাণাদি (ছবি, ব্যাংক স্লিপ, অডিও) তদন্ত করুন এবং প্রাতিষ্ঠানিক স্ট্যাটাস আপডেট করুন।"
        : "Investigate anonymous corruption dossiers and submitted bribery evidence. Validate authentic whistleblower claims or flag dismissals.",
      icon: Scale,
      color: "amber",
      statValue: `${stats.whistleblowerCount}`,
      statLabel: isBangla ? "দাখিলকৃত ফাইল" : "Active Claims",
    },
    {
      href: "/operator/dashboard",
      title: isBangla ? "স্মার্ট পার্কিং ও রাজস্ব হাব" : "Smart Parking & Enforcement",
      badge: isBangla ? "রিয়েল-টাইম বে" : "Live Sensors",
      description: isBangla
        ? "সিটি পার্কিং লট, প্রতি ঘণ্টার ফি, সক্রিয় বুকিং পর্যবেক্ষণ করুন এবং অন-গ্রাউন্ড অ্যাটেনডেন্টদের ওভারস্টে জরিমানা নিরীক্ষা করুন।"
        : "Oversee parking hubs, configure peak hourly rates, monitor occupancy in real time, and audit attendant violation ticketing.",
      icon: Car,
      color: "emerald",
      statValue: `${stats.availableBaysCount}`,
      statLabel: isBangla ? "খালি স্লট" : "Available Bays",
    },
    {
      href: "/housing",
      title: isBangla ? "নাগরিক আবাসন ও ভাড়াটিয়া তদারকি" : "Civic Housing Oversight",
      badge: isBangla ? "ভাড়াটিয়া রিভিউ" : "Rental Registry",
      description: isBangla
        ? "নাগরিকদের জন্য তালিকাভুক্ত ফ্ল্যাট ভাড়া ও বাড়িওয়ালাদের ট্রাস্ট স্কোর রিভিউ যাচাই ও তদারকি করুন।"
        : "Audit rental housing listings, examine landlord integrity scores, and ensure fair municipal tenancy standards.",
      icon: Building,
      color: "violet",
      statValue: "Live",
      statLabel: isBangla ? "আবাসন লেজার" : "Civic Ledger",
    },
    {
      href: "/services",
      title: isBangla ? "পেশাদার কারিগর ও জরুরি সেবা" : "Vetted Trades & Services",
      badge: isBangla ? "যাচাইকৃত ব্যাজ" : "Certified Pros",
      description: isBangla
        ? "স্থানীয় ইলেকট্রিশিয়ান, প্লাম্বার ও মেকানিকদের প্রোফাইল, লাইসেন্স ও নাগরিক রেটিং তদারকি করুন।"
        : "Verify trade certifications, badges, and feedback for local plumbers, electricians, emergency mechanics, and repair technicians.",
      icon: Wrench,
      color: "cyan",
      statValue: `${stats.verifiedPros}`,
      statLabel: isBangla ? "তালিকাভুক্ত কারিগর" : "Verified Pros",
    },
    {
      href: "/lost-found",
      title: isBangla ? "হারানো ও প্রাপ্তি হেফাজত নোড" : "Lost & Found Custody Node",
      badge: isBangla ? "মালিকানা যাচাই" : "Reunion Vault",
      description: isBangla
        ? "হারানো জাতীয় পরিচয়পত্র, নথিপত্র ও মূল্যবান সামগ্রীর দাবি ও হস্তান্তর লগ মনিটর করুন।"
        : "Track municipal lost & found custody claims, ownership verification proofs, and citizen restitution cases.",
      icon: PackageSearch,
      color: "orange",
      statValue: `${stats.reunitedItemsCount}`,
      statLabel: isBangla ? "ফেরত হস্তান্তর" : "Reunited Items",
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; ring: string; borderHover: string; glow: string; text: string }> = {
    teal:   { bg: "bg-teal-500/15",   icon: "text-teal-600 dark:text-teal-400",   ring: "border-teal-500/30",   borderHover: "hover:border-teal-500/50 hover:shadow-teal-500/10",   glow: "from-teal-500/20",   text: "text-teal-600 dark:text-teal-400" },
    amber:  { bg: "bg-amber-500/15",  icon: "text-amber-600 dark:text-amber-400",  ring: "border-amber-500/30",  borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",  glow: "from-amber-500/20",  text: "text-amber-600 dark:text-amber-400" },
    emerald:{ bg: "bg-emerald-500/15",icon: "text-emerald-600 dark:text-emerald-400",ring: "border-emerald-500/30",borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",glow: "from-emerald-500/20",text: "text-emerald-600 dark:text-emerald-400" },
    violet: { bg: "bg-violet-500/15", icon: "text-violet-600 dark:text-violet-400", ring: "border-violet-500/30", borderHover: "hover:border-violet-500/50 hover:shadow-violet-500/10", glow: "from-violet-500/20", text: "text-violet-600 dark:text-violet-400" },
    cyan:   { bg: "bg-cyan-500/15",   icon: "text-cyan-600 dark:text-cyan-400",   ring: "border-cyan-500/30",   borderHover: "hover:border-cyan-500/50 hover:shadow-cyan-500/10",   glow: "from-cyan-500/20",   text: "text-cyan-600 dark:text-cyan-400" },
    orange: { bg: "bg-orange-500/15", icon: "text-orange-600 dark:text-orange-400", ring: "border-orange-500/30", borderHover: "hover:border-orange-500/50 hover:shadow-orange-500/10", glow: "from-orange-500/20", text: "text-orange-600 dark:text-orange-400" },
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 relative" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      {/* Hyperrealistic Animated Sovereign Authority Command Background */}
      <AuthorityCinematicBackground />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. ELEVATED COMMAND HEADER */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/85 p-8 sm:p-10 backdrop-blur-2xl shadow-xl dark:shadow-2xl"
        >
          {/* Specular Top Edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 dark:via-teal-400/40 to-transparent" />
          
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-inner">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-mono font-black uppercase tracking-widest border border-teal-500/30">
                    <Radio className="w-3 h-3 text-teal-500 dark:text-teal-400 animate-pulse" />
                    {isBangla ? "অথরিটি কমান্ড সেন্টার" : "AUTHORITY COMMAND CENTER"}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    ID: {user?.email}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {greeting}, {user?.name?.split(" ")[0] || "Authority"}.
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
                  {isBangla 
                    ? "শহরের নাগরিক অভিযোগ ট্রায়াজ, হুইসেলব্লোয়ার অডিট, স্মার্ট পার্কিং, আবাসন ও কারিগর সেবা নোড নিয়ন্ত্রণ করুন।" 
                    : "Municipal oversight console. Triage incoming civic hazards, audit anti-corruption claims, dispatch officers, and monitor civic programs."}
                </p>
              </div>
            </div>
            
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-black/50 px-5 py-3.5 backdrop-blur-xl">
              <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isBangla ? "স্থানীয় সময়" : "Local Telemetry"}
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{time || "—:—"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. 4-METRIC LIVE TELEMETRY ROW */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="rounded-2xl bg-white/85 dark:bg-slate-950/80 border border-slate-200/80 dark:border-white/10 p-4 backdrop-blur-xl flex items-center justify-between shadow-sm dark:shadow-none">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isBangla ? "নাগরিক অভিযোগ" : "Citizen Reports"}
              </p>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">{stats.totalReportsCount}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.resolvedReportsCount} {isBangla ? "সমাধানকৃত" : "Resolved"}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl bg-white/85 dark:bg-slate-950/80 border border-slate-200/80 dark:border-white/10 p-4 backdrop-blur-xl flex items-center justify-between shadow-sm dark:shadow-none">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isBangla ? "দুর্নীতি ডসিয়ার" : "Corruption Dossiers"}
              </p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.whistleblowerCount}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{isBangla ? "এনক্রিপ্ট সুরক্ষা" : "Encrypted Vault"}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl bg-white/85 dark:bg-slate-950/80 border border-slate-200/80 dark:border-white/10 p-4 backdrop-blur-xl flex items-center justify-between shadow-sm dark:shadow-none">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isBangla ? "স্মার্ট পার্কিং" : "Smart Bays"}
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.availableBaysCount}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.totalBaysCount} {isBangla ? "মোট স্লট" : "Total Bays"}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Car className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl bg-white/85 dark:bg-slate-950/80 border border-slate-200/80 dark:border-white/10 p-4 backdrop-blur-xl flex items-center justify-between shadow-sm dark:shadow-none">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isBangla ? "নাগরিক অ্যাকাউন্ট" : "Citizen Accounts"}
              </p>
              <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">{stats.activeCitizens}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.verifiedPros} {isBangla ? "পেশাদার কারিগর" : "Vetted Trades"}</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. 9-DOMAIN AUTHORITY CONTROL NODES GRID */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {isBangla ? `সকল নিয়ন্ত্রণ ও তদারকি নোড (${controlModules.length})` : `Ecosystem Control Nodes (${controlModules.length})`}
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {isBangla ? "সকল সেবা অনলাইন" : "Real-time Synchronized"}
            </span>
          </div>

          <motion.div 
            variants={container} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {controlModules.map((mod) => {
              const Icon = mod.icon;
              const style = colorMap[mod.color];

              return (
                <motion.div key={mod.href} variants={item}>
                  <Link
                    href={mod.href}
                    className={`group relative flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 p-6 sm:p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white dark:hover:bg-slate-950/95 shadow-lg dark:shadow-xl ${style.borderHover} overflow-hidden`}
                  >
                    {/* Ambient Glow */}
                    <div className={`absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow} to-transparent blur-[50px] opacity-15 dark:opacity-20 transition-opacity duration-500 group-hover:opacity-75`} />

                    <div className="relative z-10">
                      {/* Top Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${style.bg} ${style.ring} ${style.icon} transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            {mod.badge}
                          </span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-white group-hover:border-teal-500/30 dark:group-hover:border-white/30 transition-colors">
                            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                          {mod.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Telemetry Strip */}
                    <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          {mod.statLabel}
                        </span>
                        <span className={`text-sm font-black font-mono ${style.text}`}>
                          {mod.statValue}
                        </span>
                      </div>

                      <div className={`flex items-center gap-1 text-xs font-bold font-mono ${style.text} group-hover:translate-x-1 transition-transform`}>
                        <span>{isBangla ? "প্রবেশ করুন" : "Open Node"}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </main>
    </div>
  );
}

