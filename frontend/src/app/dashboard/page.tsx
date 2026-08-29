"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useOptionalAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { AuthGate } from "@/components/ui/AuthGate";
import { BangladeshBackgroundMap } from "@/components/home/BangladeshBackgroundMap";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ShieldCheck,
  Scale,
  Car,
  PackageSearch,
  Building,
  Wrench,
  ArrowUpRight,
  Sparkles,
  Radio,
  Clock
} from "lucide-react";

export default function CitizenDashboard() {
  const { isReady, isGuest } = useOptionalAuth();
  const { t, isBangla } = useLanguage();
  const router = useRouter();

  const [stats, setStats] = useState({
    activeCitizens: "0",
    rawCitizensCount: 0,
    whistleblowerProtected: "100%",
    whistleblowerCount: 0,
    reportsResolved: "100%",
    resolvedReportsCount: 0,
    totalReportsCount: 0,
    verifiedPros: "0",
    rawProsCount: 0,
    reunitedItemsCount: 0,
    availableBaysCount: 0,
    totalBaysCount: 0,
  });

  useEffect(() => {
    api.get("/stats/public")
      .then((res) => {
        if (res.data) {
          setStats(res.data);
        }
      })
      .catch((e) => {
        console.error("Failed to load real dashboard stats:", e);
      });
  }, []);

  // Define the 6 Core Municipal Modules with full bilingual translations
  const modules = [
    {
      id: "reports",
      title: t.dashboard.modules.reportsTitle,
      tagline: t.dashboard.modules.reportsTagline,
      description: t.dashboard.modules.reportsDesc,
      icon: ShieldCheck,
      color: "teal",
      tag: t.dashboard.modules.reportsTag,
      stats: { primary: `${stats.totalReportsCount}`, label: isBangla ? "মোট অভিযোগ" : "Logged Issues" },
      glow: "from-teal-500/20 via-cyan-500/10 to-transparent",
      iconBg: "bg-teal-500/15 text-teal-400 border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.2)]",
      cardBorder: "border-white/10 hover:border-teal-500/40 hover:shadow-[0_20px_50px_-15px_rgba(20,184,166,0.3)]",
      primaryAction: { label: t.dashboard.modules.reportsAction, href: "/reports/new", requiresAuth: true, highlight: true },
      secondaryAction: { label: t.dashboard.modules.reportsSecondary, href: "/reports/public" },
    },
    {
      id: "ghush",
      title: t.dashboard.modules.ghushTitle,
      tagline: t.dashboard.modules.ghushTagline,
      description: t.dashboard.modules.ghushDesc,
      icon: Scale,
      color: "amber",
      tag: t.dashboard.modules.ghushTag,
      stats: { primary: stats.whistleblowerCount > 0 ? `${stats.whistleblowerCount}` : "Zero-Log", label: isBangla ? "হুইসেলব্লোয়ার ফাইল" : "Encrypted Claims" },
      glow: "from-amber-500/20 via-rose-500/10 to-transparent",
      iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
      cardBorder: "border-white/10 hover:border-amber-500/40 hover:shadow-[0_20px_50px_-15px_rgba(245,158,11,0.3)]",
      primaryAction: { label: t.dashboard.modules.ghushAction, href: "/ghush-reports/new", requiresAuth: false, highlight: true },
      secondaryAction: { label: t.dashboard.modules.ghushSecondary, href: "/ghush-reports" },
    },
    {
      id: "parking",
      title: t.dashboard.modules.parkingTitle,
      tagline: t.dashboard.modules.parkingTagline,
      description: t.dashboard.modules.parkingDesc,
      icon: Car,
      color: "emerald",
      tag: t.dashboard.modules.parkingTag,
      stats: { primary: `${stats.availableBaysCount}`, label: isBangla ? "খালি স্লট" : "Available Bays" },
      glow: "from-emerald-500/20 via-teal-500/10 to-transparent",
      iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
      cardBorder: "border-white/10 hover:border-emerald-500/40 hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.3)]",
      primaryAction: { label: t.dashboard.modules.parkingAction, href: "/find", requiresAuth: false, highlight: true },
      secondaryAction: { label: t.dashboard.modules.parkingSecondary, href: "/parking" },
    },
    {
      id: "lost-found",
      title: t.dashboard.modules.lostFoundTitle,
      tagline: t.dashboard.modules.lostFoundTagline,
      description: t.dashboard.modules.lostFoundDesc,
      icon: PackageSearch,
      color: "orange",
      tag: t.dashboard.modules.lostFoundTag,
      stats: { primary: `${stats.reunitedItemsCount}`, label: isBangla ? "ফেরত প্রদান" : "Reunited" },
      glow: "from-orange-500/20 via-amber-500/10 to-transparent",
      iconBg: "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]",
      cardBorder: "border-white/10 hover:border-orange-500/40 hover:shadow-[0_20px_50px_-15px_rgba(249,115,22,0.3)]",
      primaryAction: { label: t.dashboard.modules.lostFoundAction, href: "/lost-found/new", requiresAuth: false, highlight: true },
      secondaryAction: { label: t.dashboard.modules.lostFoundSecondary, href: "/lost-found" },
    },
    {
      id: "housing",
      title: t.dashboard.modules.housingTitle,
      tagline: t.dashboard.modules.housingTagline,
      description: t.dashboard.modules.housingDesc,
      icon: Building,
      color: "violet",
      tag: t.dashboard.modules.housingTag,
      stats: { primary: "Live", label: isBangla ? "যাচাইকৃত ফ্ল্যাট" : "Civic Registry" },
      glow: "from-violet-500/20 via-purple-500/10 to-transparent",
      iconBg: "bg-violet-500/15 text-violet-400 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]",
      cardBorder: "border-white/10 hover:border-violet-500/40 hover:shadow-[0_20px_50px_-15px_rgba(139,92,246,0.3)]",
      primaryAction: { label: t.dashboard.modules.housingAction, href: "/housing/new", requiresAuth: false, highlight: true },
      secondaryAction: { label: t.dashboard.modules.housingSecondary, href: "/housing" },
    },
    {
      id: "services",
      title: t.dashboard.modules.servicesTitle,
      tagline: t.dashboard.modules.servicesTagline,
      description: t.dashboard.modules.servicesDesc,
      icon: Wrench,
      color: "cyan",
      tag: t.dashboard.modules.servicesTag,
      stats: { primary: `${stats.verifiedPros}`, label: isBangla ? "যাচাইকৃত কারিগর" : "Vetted Pros" },
      glow: "from-cyan-500/20 via-teal-500/10 to-transparent",
      iconBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]",
      cardBorder: "border-white/10 hover:border-cyan-500/40 hover:shadow-[0_20px_50px_-15px_rgba(6,182,212,0.3)]",
      primaryAction: { label: t.dashboard.modules.servicesAction, href: "/services/new", requiresAuth: false, highlight: true },
      secondaryAction: { label: t.dashboard.modules.servicesSecondary, href: "/services" },
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 relative" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      {/* Futuristic Glowing Tactical Bangladesh Map Background */}
      <BangladeshBackgroundMap />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 w-full flex-grow flex flex-col gap-14 sm:gap-16 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. ELEVATED MINIMAL HERO SECTION */}
        {/* ========================================================================= */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto pt-4">
          
          {/* Status Badge with Glowing Live Beacon */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/30 text-xs font-mono font-semibold tracking-wide text-teal-300 mb-6 shadow-[0_0_25px_rgba(13,148,136,0.15)] backdrop-blur-2xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
            </span>
            <span className="text-white/90">{t.dashboard.badge}</span>
            <span className="text-white/20">•</span>
            <span className="text-teal-400 font-bold">{isGuest ? t.dashboard.guestBadge : t.dashboard.citizenBadge}</span>
          </motion.div>

          {/* Powerful, Premium Platform Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-6xl font-black tracking-tight mb-5 leading-[1.12]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 drop-shadow-[0_0_35px_rgba(13,148,136,0.35)]">
              {t.dashboard.heroTitleHighlight}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-xl"
          >
            {t.dashboard.heroDesc}
          </motion.p>
        </section>

        {/* ========================================================================= */}
        {/* 2. ELEVATED 4-METRIC MUNICIPAL VITALS STRIP (LIVE DATABASE DATA) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 max-w-5xl mx-auto w-full">
          <div className="bg-slate-950/80 border border-white/10 hover:border-teal-500/30 rounded-2xl p-4 sm:p-5 text-center backdrop-blur-2xl shadow-xl transition-all group">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-teal-400">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                {isBangla ? "নাগরিক সেবা" : "Registered Citizens"}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight group-hover:text-teal-300 transition-colors">
              {stats.activeCitizens}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isBangla ? "নিবন্ধিত নাগরিক অ্যাকাউন্ট" : "Active Citizen Accounts"}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-white/10 hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 text-center backdrop-blur-2xl shadow-xl transition-all group">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-amber-400">
              <Scale className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                {isBangla ? "গোপনীয়তা" : "Encrypted Vault"}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight group-hover:text-amber-300 transition-colors">
              {stats.whistleblowerCount > 0 ? `${stats.whistleblowerCount}` : "100%"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats.whistleblowerCount > 0 
                ? (isBangla ? "দাখিলকৃত ডসিয়ার" : "Logged Dossiers")
                : (isBangla ? "জিরো-নলেজ এনক্রিপশন" : "Zero-Knowledge Enforced")}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-center backdrop-blur-2xl shadow-xl transition-all group">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                {isBangla ? "সমাধানের হার" : "Resolution Rate"}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight group-hover:text-emerald-300 transition-colors">
              {stats.reportsResolved}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats.totalReportsCount > 0 
                ? `${stats.resolvedReportsCount}/${stats.totalReportsCount} ${isBangla ? "সমাধানকৃত" : "Resolved"}`
                : (isBangla ? "সব রিপোর্ট স্বচ্ছ ও সক্রিয়" : "Clean Ledger Status")}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-white/10 hover:border-orange-500/30 rounded-2xl p-4 sm:p-5 text-center backdrop-blur-2xl shadow-xl transition-all group">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-orange-400">
              <Wrench className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                {isBangla ? "যাচাইকৃত কারিগর" : "Vetted Trades"}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight group-hover:text-orange-300 transition-colors">
              {stats.verifiedPros}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isBangla ? "স্থানীয় সেবাদাতা কারিগর" : "Verified Trade Profiles"}
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. 6 CORE MODULES CLEAN GRID */}
        {/* ========================================================================= */}
        <section className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-teal-400 uppercase tracking-widest mb-1">
                <Radio className="w-3.5 h-3.5 animate-pulse text-teal-400" /> {isBangla ? "নাগরিক সেবা পোর্টাল" : "CIVIC CONTROL NODES"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isBangla ? `সকল নাগরিক পোর্টাল (${modules.length})` : `All Civic Portals (${modules.length})`}
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> {isBangla ? "৬টি পোর্টাল সক্রিয়" : "6 PORTALS LIVE"}
            </span>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {modules.map((mod) => (
              <motion.div
                key={mod.id}
                variants={itemVariants}
                onClick={() => router.push(mod.secondaryAction.href)}
                className={`group cursor-pointer flex flex-col justify-between bg-slate-950/85 hover:bg-slate-950/95 border ${mod.cardBorder} rounded-[2rem] p-7 transition-all duration-500 hover:-translate-y-1.5 relative backdrop-blur-2xl overflow-hidden`}
              >
                {/* Top Specular Hairline */}
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:via-teal-400/60 transition-colors" />

                {/* Ambient Colored Backlight Flare */}
                <div className={`absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br ${mod.glow} rounded-full blur-[70px] opacity-30 group-hover:opacity-85 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10">
                  {/* Card Header: Icon & Tag */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${mod.iconBg} group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300`}>
                      <mod.icon className="w-7 h-7" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-[10px] font-mono font-bold tracking-wider text-slate-300">
                        {mod.tag}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-900/90 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-black group-hover:border-teal-400 transition-all duration-300 shadow-sm">
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="mb-2.5">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">
                      {mod.tagline}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors mt-0.5 tracking-tight">
                      {mod.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
                    {mod.description}
                  </p>
                </div>

                {/* Bottom Action Strip with Primary CTA & Secondary Ghost Button */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10 relative z-10" onClick={(e) => e.stopPropagation()}>
                  {mod.primaryAction.requiresAuth && isGuest ? (
                    <AuthGate message={isBangla ? `এই সুবিধাটি ব্যবহারের জন্য লগইন করুন।` : `Sign in to access ${mod.primaryAction.label.toLowerCase()}.`}>
                      <span className="flex-1 text-center py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500 text-slate-950 text-xs font-black transition-all shadow-[0_4px_15px_-3px_rgba(13,148,136,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(13,148,136,0.6)] hover:scale-[1.02] cursor-pointer">
                        {mod.primaryAction.label}
                      </span>
                    </AuthGate>
                  ) : (
                    <Link
                      href={mod.primaryAction.href}
                      className="flex-1 text-center py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500 text-slate-950 text-xs font-black transition-all shadow-[0_4px_15px_-3px_rgba(13,148,136,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(13,148,136,0.6)] hover:scale-[1.02]"
                    >
                      {mod.primaryAction.label}
                    </Link>
                  )}

                  <Link
                    href={mod.secondaryAction.href}
                    className="flex-1 text-center py-2.5 px-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white border border-white/10 hover:border-white/30 text-xs font-bold transition-all"
                  >
                    {mod.secondaryAction.label}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

      </main>

      {/* Footer with Developer Dossier & Core Navigation Links */}
      <Footer />
    </div>
  );
}

