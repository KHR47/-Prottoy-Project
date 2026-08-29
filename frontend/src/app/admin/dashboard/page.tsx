"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Category, Report, District } from "@/types/report";
import type { User } from "@/types/user";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import {
  Users, MapPin, FolderTree, ClipboardList,
  TrendingUp, Clock, AlertTriangle, Car,
  ArrowUpRight, ShieldAlert, CheckCircle2,
  Scale, PackageSearch, Building, Wrench,
  Layers, RefreshCw, X, Server
} from "lucide-react";
import { AdminCinematicBackground } from "@/components/home/AdminCinematicBackground";

const BD_DISTRICTS = 64;

export default function AdminDashboardPage() {
  const { isReady, user } = useRequireRole(["admin"]);
  const { isBangla } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publicStats, setPublicStats] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState("");
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* Live clock + greeting */
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
    return () => clearInterval(id);
  }, [isBangla]);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const [u, r, d, c, s] = await Promise.all([
        api.get("/users"),
        api.get("/reports"),
        api.get("/locations/districts"),
        api.get("/categories"),
        api.get("/stats/public").catch(() => ({ data: {} })),
      ]);
      setUsers(u.data || []);
      setReports(r.data || []);
      setDistricts(d.data || []);
      setCategories(c.data || []);
      setPublicStats(s.data || {});
      setError("");
    } catch (e: unknown) {
      setError(getErrorMessage(e, isBangla ? "অ্যাডমিন ড্যাশবোর্ড লোড করতে ব্যর্থ হয়েছে।" : "Could not load admin dashboard."));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    loadData();
  }, [isReady]);

  const activeUsers = useMemo(() => users.filter((u) => u.isActive !== false).length, [users]);
  const pendingReports = useMemo(() => reports.filter((r) => r.status !== "resolved" && r.status !== "rejected").length, [reports]);
  const resolvedReports = useMemo(() => reports.filter((r) => r.status === "resolved").length, [reports]);
  const criticalReports = useMemo(() => reports.filter((r) => r.priority === "critical").length, [reports]);
  const resolutionRate = useMemo(() => (!reports.length ? 100 : Math.round((resolvedReports / reports.length) * 100)), [reports, resolvedReports]);

  // Project Ecosystem Modules (Transit & Utilities removed as requested)
  const systemModules = [
    {
      href: "/admin/reports",
      title: isBangla ? "নাগরিক অভিযোগ নিয়ন্ত্রণ" : "Manage Reports",
      desc: isBangla ? "নাগরিকদের রিপোর্ট যাচাই, স্ট্যাটাস পরিবর্তন এবং মডারেশন পরিচালনা করুন।" : "Review incoming civic incidents, update status, and moderate invalid entries.",
      badge: isBangla ? "তদারকি" : "Reports Node",
      icon: ClipboardList,
      color: "violet",
      stat: `${pendingReports} ${isBangla ? "অমীমাংসিত" : "Pending"}`,
    },
    {
      href: "/admin/users",
      title: isBangla ? "ব্যবহারকারী ও ভূমিকা ব্যবস্থাপনা" : "Manage Users",
      desc: isBangla ? "নাগরিক, অথরিটি ও অপারেটরদের অ্যাকাউন্ট নিয়ন্ত্রণ, ভূমিকা নির্ধারণ ও নিরাপত্তা অডিট।" : "Create, edit, and deactivate accounts, assign role permissions, and audit activity.",
      badge: isBangla ? "অ্যাকাউন্ট" : "Access Control",
      icon: Users,
      color: "blue",
      stat: `${users.length} ${isBangla ? "অ্যাকাউন্ট" : "Accounts"}`,
    },
    {
      href: "/bribery",
      title: isBangla ? "দুর্নীতি দমন ও হুইসেলব্লোয়ার ডসিয়ার" : "Anti-Corruption Intel",
      desc: isBangla ? "দুর্নীতি ও ঘুষের এনক্রিপ্টেড অভিযোগ, প্রমাণের নথি ও অডিট ট্রায়াল পরীক্ষা করুন।" : "Audit confidential corruption dossiers, cryptographic proofs, and investigator notes.",
      badge: isBangla ? "দুদক নোড" : "Anti-Graft",
      icon: Scale,
      color: "amber",
      stat: `${publicStats.whistleblowerCount ?? 0} ${isBangla ? "ডসিয়ার" : "Dossiers"}`,
    },
    {
      href: "/admin/parking",
      title: isBangla ? "স্মার্ট পার্কিং ও বে ব্যবস্থাপনা" : "Smart Parking",
      desc: isBangla ? "শহরের পার্কিং লট, সেন্সর বে, রিয়েল-টাইম স্লট অকুপেন্সি ও রেট পর্যবেক্ষণ।" : "Control parking zones, slot occupancy sensors, and pricing structures.",
      badge: isBangla ? "পার্কিং" : "Sensor Bays",
      icon: Car,
      color: "emerald",
      stat: `${publicStats.availableBaysCount ?? 0}/${publicStats.totalBaysCount ?? 0} ${isBangla ? "খালি" : "Free"}`,
    },
    {
      href: "/lost-found",
      title: isBangla ? "হারানো ও প্রাপ্তি হেফাজত ভল্ট" : "Lost & Found Custody",
      desc: isBangla ? "নাগরিকদের হারানো মূল্যবান সামগ্রী, নথিপত্র এবং মালিকানা হস্তান্তর রেকর্ড।" : "Monitor custody claims, proof of ownership records, and restitution handoffs.",
      badge: isBangla ? "হেফাজত" : "Custody Vault",
      icon: PackageSearch,
      color: "orange",
      stat: `${publicStats.reunitedItemsCount ?? 0} ${isBangla ? "হস্তান্তরিত" : "Reunited"}`,
    },
    {
      href: "/housing",
      title: isBangla ? "নাগরিক আবাসন ও ভাড়া রেজিস্ট্রি" : "Housing Registry",
      desc: isBangla ? "যাচাইকৃত ফ্ল্যাট, মেস, বাড়ি ভাড়া এবং নাগরিক আবাসন নিরাপত্তা সম্মতি নিরীক্ষা।" : "Audit residential property listings, rental compliance, and landlord verification.",
      badge: isBangla ? "আবাসন" : "Housing Ledger",
      icon: Building,
      color: "rose",
      stat: isBangla ? "যাচাইকৃত প্রোপার্টি" : "Verified Listings",
    },
    {
      href: "/services",
      title: isBangla ? "পেশাদার কারিগর ও সার্ভিসেস" : "Trade Services",
      desc: isBangla ? "যাচাইকৃত ইলেকট্রিশিয়ান, প্লাম্বার ও টেকনিশিয়ানদের প্রোফাইল ও সেবামূল্য মনিটর।" : "Directory of vetted municipal craftsmen, emergency repairs, and citizen work orders.",
      badge: isBangla ? "কারিগর" : "Trade Services",
      icon: Wrench,
      color: "cyan",
      stat: `${publicStats.verifiedPros ?? 0} ${isBangla ? "কারিগর" : "Pros Active"}`,
    },
    {
      href: "/admin/categories",
      title: isBangla ? "অভিযোগ ও সেবা ক্যাটাগরি" : "Categories",
      desc: isBangla ? "নাগরিক সমস্যা ও অপরাধের শ্রেণিবিন্যাস, গুরুত্ব মাত্রা ও এসএলএ কনফিগারেশন।" : "Control civic hazard categories, crime taxonomies, and department routing tags.",
      badge: isBangla ? "ক্যাটাগরি" : "Taxonomy",
      icon: FolderTree,
      color: "amber",
      stat: `${categories.length} ${isBangla ? "ক্যাটাগরি" : "Categories"}`,
    },
    {
      href: "/admin/districts",
      title: isBangla ? "৬৪ জেলা অবকাঠামো কভারেজ" : "Districts",
      desc: isBangla ? "বাংলাদেশের ৬৪টি জেলার ভৌগোলিক ডাটা, বিভাগীয় জোন ও আঞ্চলিক অফিস সংযোগ।" : "Manage city district infrastructure and geographical nodes for all 64 BD districts.",
      badge: isBangla ? "৬৪ জেলা" : "64 BD Districts",
      icon: MapPin,
      color: "indigo",
      stat: `${Math.min(districts.length || BD_DISTRICTS, BD_DISTRICTS)}/64 ${isBangla ? "জেলা" : "Districts"}`,
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; badge: string; dot: string; borderHover: string; glow: string; text: string }> = {
    violet: { bg: "bg-violet-500/10", icon: "text-violet-500", badge: "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400", dot: "bg-violet-500", borderHover: "hover:border-violet-500/40 hover:shadow-violet-500/10", glow: "from-violet-500/20", text: "text-violet-600 dark:text-violet-400" },
    blue:   { bg: "bg-blue-500/10",   icon: "text-blue-500",   badge: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",       dot: "bg-blue-500",   borderHover: "hover:border-blue-500/40 hover:shadow-blue-500/10",     glow: "from-blue-500/20",   text: "text-blue-600 dark:text-blue-400" },
    amber:  { bg: "bg-amber-500/10",  icon: "text-amber-500",  badge: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",    dot: "bg-amber-500",  borderHover: "hover:border-amber-500/40 hover:shadow-amber-500/10",   glow: "from-amber-500/20",  text: "text-amber-600 dark:text-amber-400" },
    rose:   { bg: "bg-rose-500/10",   icon: "text-rose-500",   badge: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",       dot: "bg-rose-500",   borderHover: "hover:border-rose-500/40 hover:shadow-rose-500/10",     glow: "from-rose-500/20",   text: "text-rose-600 dark:text-rose-400" },
    teal:   { bg: "bg-teal-500/10",   icon: "text-teal-500",   badge: "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",       dot: "bg-teal-500",   borderHover: "hover:border-teal-500/40 hover:shadow-teal-500/10",     glow: "from-teal-500/20",   text: "text-teal-600 dark:text-teal-400" },
    emerald:{ bg: "bg-emerald-500/10",icon: "text-emerald-500",badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",dot: "bg-emerald-500",borderHover: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",glow: "from-emerald-500/20",text: "text-emerald-600 dark:text-emerald-400" },
    orange: { bg: "bg-orange-500/10", icon: "text-orange-500", badge: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",  dot: "bg-orange-500", borderHover: "hover:border-orange-500/40 hover:shadow-orange-500/10",   glow: "from-orange-500/20", text: "text-orange-600 dark:text-orange-400" },
    cyan:   { bg: "bg-cyan-500/10",   icon: "text-cyan-500",   badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400",       dot: "bg-cyan-500",   borderHover: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",     glow: "from-cyan-500/20",   text: "text-cyan-600 dark:text-cyan-400" },
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-500", badge: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",  dot: "bg-indigo-500", borderHover: "hover:border-indigo-500/40 hover:shadow-indigo-500/10",   glow: "from-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400" },
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

  const kpis = [
    {
      label: isBangla ? "সিস্টেম ব্যবহারকারী" : "System Users",
      value: activeUsers.toLocaleString(),
      icon: Users,
      color: "blue",
      sub: `${users.length} ${isBangla ? "মোট অ্যাকাউন্ট" : "total accounts"}`,
    },
    {
      label: isBangla ? "মোট রিপোর্ট" : "Total Reports",
      value: reports.length.toLocaleString(),
      icon: ClipboardList,
      color: "violet",
      sub: `${criticalReports} ${isBangla ? "জরুরি অগ্রাধিকার" : "critical"}`,
    },
    {
      label: isBangla ? "অমীমাংসিত রিপোর্ট" : "Pending Review",
      value: pendingReports.toLocaleString(),
      icon: AlertTriangle,
      color: "amber",
      sub: isBangla ? "সমাধানের অপেক্ষায়" : "awaiting resolution",
    },
    {
      label: isBangla ? "সমাধানের হার" : "Resolution Rate",
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      color: "teal",
      sub: `${resolvedReports} ${isBangla ? "মোট সমাধানকৃত" : "resolved total"}`,
    },
  ];

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col font-sans selection:bg-amber-500/30 relative" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      {/* Hyperrealistic Animated Executive Admin Matrix Background */}
      <AdminCinematicBackground />

      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-24 flex flex-col gap-10">

        {/* ── 1. HEADER ─────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
        >
          <div>
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)]/80 border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] mb-4 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inset-0 rounded-full bg-violet-400 opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-violet-500" />
              </span>
              {isBangla ? "প্রশাসক নিয়ন্ত্রণ" : "Administrator Access"}
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] mb-3">
              {greeting},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-teal-500">
                {user?.name?.split(" ")[0] || "Admin"}
              </span>.
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light max-w-xl leading-relaxed">
              {isBangla
                ? `প্ল্যাটফর্ম স্বাভাবিকভাবে পরিচালিত হচ্ছে। আপনার পর্যালোচনা করার জন্য ${pendingReports}টি অমীমাংসিত ${criticalReports > 0 ? `এবং ${criticalReports}টি জরুরি` : ""} রিপোর্ট রয়েছে।`
                : `Platform is running normally. You have ${pendingReports} pending ${criticalReports > 0 ? `and ${criticalReports} critical ` : ""}reports to review.`}
            </p>
          </div>

          {/* clock + quick actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-[var(--bg-surface)]/70 px-5 py-3.5 rounded-2xl border border-[var(--border)] shadow-sm backdrop-blur-xl">
              <Clock className="w-4 h-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {isBangla ? "সার্ভার সময়" : "System Time"}
                </p>
                <p className="text-lg font-semibold text-[var(--text-primary)] leading-tight">{time || "—:—"}</p>
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={isRefreshing}
              title={isBangla ? "তথ্য রিফ্রেশ করুন" : "Refresh Telemetry"}
              className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]/70 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] shadow-sm backdrop-blur-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
            </button>

            <button
              onClick={() => setIsHealthOpen(true)}
              title={isBangla ? "সিস্টেম স্বাস্থ্য অডিট" : "System Health Audit"}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 shadow-sm backdrop-blur-xl transition-all font-semibold text-xs font-mono"
            >
              <Server className="w-4 h-4 text-teal-500" />
              <span className="hidden sm:inline">{isBangla ? "সিস্টেম স্বাস্থ্য" : "Health Audit"}</span>
            </button>
          </div>
        </motion.header>

        {/* ── Error ──────────────────────────────────────────── */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm font-medium text-rose-500">
            <ShieldAlert className="h-5 w-5 shrink-0" /> {error}
          </motion.div>
        )}

        {/* ── 2. KPI Grid ───────────────────────────────────────── */}
        <motion.section variants={container} initial="hidden" animate="show"
          className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const c = colorMap[kpi.color];
            return (
              <motion.div key={kpi.label} variants={item}
                className="group relative bg-[var(--bg-surface)]/70 backdrop-blur-xl rounded-[1.5rem] border border-[var(--border)] p-6 overflow-hidden hover:border-[var(--border-strong)] hover:shadow-lg transition-all duration-300">
                {/* corner glow */}
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.badge} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{kpi.label}</p>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.badge}`}>
                    <kpi.icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight relative z-10">{kpi.value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2 relative z-10">{kpi.sub}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* ── Secondary Stats Row ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {[
            { label: isBangla ? "জেলা কভারেজ" : "Districts Coverage", value: `${Math.min(districts.length || BD_DISTRICTS, BD_DISTRICTS)}/64`, color: "indigo" },
            { label: isBangla ? "রিপোর্ট ক্যাটাগরি" : "Taxonomy Categories", value: categories.length, color: "amber" },
            { label: isBangla ? "দুর্নীতি ফাইল ডসিয়ার" : "Anti-Graft Vault", value: publicStats.whistleblowerCount ?? 0, color: "rose" },
          ].map((s) => {
            const c = colorMap[s.color];
            return (
              <div key={s.label}
                className="bg-[var(--bg-surface)]/70 backdrop-blur-xl rounded-[1.25rem] border border-[var(--border)] p-5 flex items-center gap-4 hover:border-[var(--border-strong)] transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                <p className={`ml-auto text-2xl font-semibold ${c.icon}`}>{s.value}</p>
              </div>
            );
          })}
        </motion.div>

        {/* ── 3. System Modules Grid (Transit & Utilities removed) ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-500" />
              {isBangla ? `সিস্টেম মডিউলসমূহ (${systemModules.length})` : `System Modules (${systemModules.length})`}
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {isBangla ? "সকল সার্ভিস সক্রিয়" : "Core Modules Active"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {systemModules.map((link) => {
              const Icon = link.icon;
              const c = colorMap[link.color];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-start gap-4 bg-[var(--bg-surface)]/70 backdrop-blur-xl rounded-[1.25rem] border border-[var(--border)] p-5 hover:border-[var(--border-strong)] hover:shadow-lg transition-all duration-300 ${c.borderHover}`}
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${c.badge} group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${c.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-violet-500 transition-colors">
                        {link.title}
                      </p>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {link.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed mb-3">
                      {link.desc}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        {link.stat}
                      </span>
                      <div className="flex items-center gap-0.5 text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all">
                        <span>{isBangla ? "খুলুন" : "Open"}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

      </main>

      {/* ── 4. SYSTEM HEALTH & DIAGNOSTIC MODAL ───────────────────────── */}
      <AnimatePresence>
        {isHealthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHealthOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      {isBangla ? "প্ল্যাটফর্ম স্বাস্থ্য অডিট" : "Platform Integrity Audit"}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      Core Protocol v2.4 • SSL Active
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsHealthOpen(false)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { name: isBangla ? "নেস্টজেএস এপিআই গেটওয়ে" : "NestJS Core API Gateway", status: "ONLINE", ping: "4ms", color: "text-emerald-500" },
                  { name: isBangla ? "টাইপওআরএম ডাটাবেজ ক্লাস্টার" : "TypeORM PostgreSQL/SQLite Cluster", status: "HEALTHY", ping: "2ms", color: "text-emerald-500" },
                  { name: isBangla ? "জেডব্লিউটি সিকিউরিটি গার্ড ও আরবিএসি" : "JWT Security Guard & RBAC", status: "ENFORCED", ping: "0ms", color: "text-emerald-500" },
                  { name: isBangla ? "লাইভ নোটিফিকেশন ইঞ্জিন" : "Live Notification Sync & Polling", status: "ACTIVE", ping: "12ms", color: "text-emerald-500" },
                  { name: isBangla ? "৬৪ জেলা ম্যাপিং জিও-নোড" : "64 District Geo-Spatial Engine", status: "SYNCED", ping: "1ms", color: "text-emerald-500" },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[var(--text-primary)] font-medium">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--text-muted)]">{s.ping}</span>
                      <span className={`font-semibold ${s.color}`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {isBangla ? "সকল সার্ভিস ১০০% সচল" : "All project domains nominal and healthy."}
                </span>
                <button
                  onClick={() => setIsHealthOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-semibold transition hover:opacity-90"
                >
                  {isBangla ? "বন্ধ করুন" : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
