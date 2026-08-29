"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { AuthGate } from "@/components/ui/AuthGate";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { GhushReport, GhushStatus, GhushStats } from "@/types/ghush-report";
import { GhushCinematicBackground } from "@/components/home/GhushCinematicBackground";
import { 
  ShieldAlert, 
  Lock, 
  Plus, 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Paperclip, 
  MapPin, 
  Calendar,
  Banknote,
  ArrowUpRight,
  EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

const departmentsEn = [
  "All Departments",
  "Land & Registration",
  "Traffic & Transport Police",
  "Passport & Immigration",
  "Municipal Corporation",
  "Tax, Customs & VAT",
  "Law Enforcement",
  "Utility Boards (DESCO/WASA)",
  "Health & Hospitals",
  "Education & Licensing",
];

const departmentsBn = [
  "সকল বিভাগ",
  "ভূমি ও রেজিস্ট্রি অফিস",
  "ট্রাফিক ও পরিবহন পুলিশ",
  "পাসপোর্ট ও ইমিগ্রেশন",
  "সিটি কর্পোরেশন",
  "কর, শুল্ক ও ভ্যাট",
  "আইন প্রয়োগকারী সংস্থা",
  "ইউটিলিটি বোর্ড (ডেসকো/ওয়াসা)",
  "স্বাস্থ্য ও হাসপাতাল",
  "শিক্ষা ও লাইসেন্সিং",
];

export default function GhushReportsPage() {
  const { user, isGuest } = useOptionalAuth();
  const { t, isBangla } = useLanguage();
  const [reports, setReports] = useState<GhushReport[]>([]);
  const [stats, setStats] = useState<GhushStats>({
    total: 0,
    verified: 0,
    underReview: 0,
    pending: 0,
    totalBribeAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const departments = isBangla ? departmentsBn : departmentsEn;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [reportsRes, statsRes] = await Promise.all([
          api.get("/ghush-reports"),
          api.get("/ghush-reports/stats"),
        ]);
        setReports(reportsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load bribery reports."));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.department && r.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.districtName && r.districtName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchDept =
      selectedDept === "All Departments" || selectedDept === "সকল বিভাগ" || r.department === selectedDept;

    const matchStatus =
      selectedStatus === "ALL" || r.status === selectedStatus;

    return matchSearch && matchDept && matchStatus;
  });

  const getStatusBadge = (status: GhushStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {isBangla ? "যাচাইকৃত সত্য" : "VERIFIED AUTHENTIC"}
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-600 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            {isBangla ? "তদন্তাধীন" : "INVESTIGATION ACTIVE"}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            {isBangla ? "প্রত্যাখ্যাত" : "REJECTED"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {isBangla ? "অপেক্ষমান" : "PENDING AUDIT"}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative selection:bg-rose-500/30" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Ghush Whistleblower & Cryptographic Grid Background */}
      <GhushCinematicBackground />

      <Navbar />

      {/* Hero Header */}
      <div className="pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold uppercase tracking-widest mb-4 border border-rose-500/40 backdrop-blur-md">
                <Lock className="w-3.5 h-3.5" /> {isBangla ? "১০০% গোপনীয় হুইসেলব্লোয়ার সুরক্ষা" : "100% Anonymous Whistleblower Protection"}
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                {t.ghush.title}
              </h1>
              <p className="text-slate-200 text-base sm:text-lg font-light leading-relaxed max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {t.ghush.subtitle}
              </p>
            </div>

            {/* Submission Action Button - Hidden for Authority / Officer */}
            {user?.role !== "authority" && user?.role !== "officer" && (
              <div className="shrink-0">
                <Link
                  href="/ghush-reports/new"
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition-all shadow-2xl shadow-rose-600/40 hover:scale-[1.03] border border-rose-400/30"
                >
                  <ShieldAlert className="w-5 h-5" />
                  {t.ghush.submitDossier}
                </Link>
              </div>
            )}
          </div>

          {/* Quick Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-mono font-bold uppercase text-slate-400">{isBangla ? "মোট অভিযোগ" : "Total Claims"}</p>
              <p className="text-3xl font-black text-white mt-1">{isBangla ? stats.total.toLocaleString("bn-BD") : stats.total}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{isBangla ? "দাখিলকৃত কেস" : "Reported Cases"}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-mono font-bold uppercase text-emerald-400">{isBangla ? "যাচাইকৃত ঘুষ" : "Verified Bribery"}</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">{isBangla ? stats.verified.toLocaleString("bn-BD") : stats.verified}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{isBangla ? "প্রমাণ নিশ্চিত" : "Evidence Confirmed"}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-mono font-bold uppercase text-blue-400">{isBangla ? "তদন্তাধীন" : "Under Investigation"}</p>
              <p className="text-3xl font-black text-blue-400 mt-1">{isBangla ? stats.underReview.toLocaleString("bn-BD") : stats.underReview}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{isBangla ? "অডিট চলমান" : "Moderator Audit"}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-mono font-bold uppercase text-amber-400">{isBangla ? "উন্মোচিত পরিমাণ" : "Amount Exposed"}</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                ৳ {isBangla ? stats.totalBribeAmount.toLocaleString("bn-BD") : stats.totalBribeAmount.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{isBangla ? "দাবিকৃত মোট ঘুষ" : "Documented Bribes"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Filterable Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-grow relative z-10">
        {/* Controls: Search, Department Pills, Status Filter */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by department, officer, location, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Status filters */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {["ALL", "VERIFIED", "UNDER_REVIEW", "PENDING", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all backdrop-blur-md ${
                    selectedStatus === st
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400/40"
                      : "bg-slate-950/70 text-slate-300 border border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Department Pills Scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all backdrop-blur-md ${
                  selectedDept === dept
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/60 font-bold shadow-md shadow-rose-500/10"
                    : "bg-slate-950/70 text-slate-300 border border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-950/60 animate-pulse border border-white/10"
              />
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-slate-950/70 rounded-3xl border border-white/10 backdrop-blur-xl">
            <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-xl font-bold text-white">No Reports Found</h3>
            <p className="text-sm text-slate-400 mt-1">
              No corruption reports match your current search and department filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl p-6 shadow-2xl hover:shadow-rose-950/20 hover:border-white/25 transition-all duration-300"
              >
                <div>
                  {/* Top Status & Anonymous Indicator */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {getStatusBadge(report.status)}
                    {report.isAnonymous ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
                        <EyeOff className="w-3 h-3" /> Anonymous
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[120px]">
                        By {report.reportedBy?.name || "Citizen"}
                      </span>
                    )}
                  </div>

                  {/* Title & Department */}
                  <div className="mb-3">
                    {report.department && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{report.department}</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white line-clamp-2">
                      {report.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 line-clamp-3 mb-4 font-light leading-relaxed">
                    {report.description}
                  </p>

                  {/* Bribe Amount & Location */}
                  <div className="space-y-1.5 mb-6 text-xs text-slate-400">
                    {report.amountInvolved && report.amountInvolved > 0 && (
                      <div className="flex items-center gap-2 font-bold text-amber-400">
                        <Banknote className="w-4 h-4" />
                        <span>৳ {Number(report.amountInvolved).toLocaleString()} Bribe Demanded</span>
                      </div>
                    )}
                    {(report.location || report.districtName) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.location ? `${report.location}, ` : ""}{report.districtName || report.divisionName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Authority Decision Action Bar */}
                {(user?.role === "authority" || user?.role === "admin" || user?.role === "officer") && (
                  <div className="my-3 pt-3 border-t border-rose-500/20 bg-rose-950/20 rounded-2xl p-3 space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                      {isBangla ? "হুইসেলব্লোয়ার অডিট সিদ্ধান্ত:" : "Whistleblower Audit Decision:"}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.patch(`/ghush-reports/${report.id}/verify`, { status: "UNDER_REVIEW" });
                            setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, ...res.data } : r)));
                            toast.success(isBangla ? "কেসটি অডিট/তদন্তাধীনে চিহ্নিত হয়েছে।" : "Set to Under Investigation.");
                          } catch {
                            toast.error(isBangla ? "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।" : "Failed to update status.");
                          }
                        }}
                        className="px-2 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Clock className="w-3 h-3" /> {isBangla ? "তদন্ত" : "Inspect"}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.patch(`/ghush-reports/${report.id}/verify`, { status: "VERIFIED" });
                            setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, ...res.data } : r)));
                            toast.success(isBangla ? "ঘুষের অভিযোগ যাচাইকৃত ও নিশ্চিত হয়েছে!" : "Bribery claim verified!");
                          } catch {
                            toast.error(isBangla ? "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।" : "Failed to update status.");
                          }
                        }}
                        className="px-2 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" /> {isBangla ? "যাচাই" : "Verify"}
                      </button>
                      <button
                        onClick={async () => {
                          const reason = window.prompt(
                            isBangla
                              ? "ঘুষ/দুর্নীতির অভিযোগ বাতিলের কারণ লিখুন (নাগরিককে নোটিফিকেশন পাঠানো হবে):"
                              : "Please state the reason for rejecting/dismissing this bribery claim (user will receive notification with reason):"
                          );
                          if (reason === null) return;
                          try {
                            await api.patch(`/ghush-reports/${report.id}/verify`, { status: "REJECTED", reviewNotes: reason });
                            setReports((prev) => prev.filter((r) => r.id !== report.id));
                            toast.success(isBangla ? "অভিযোগটি মুছে ফেলা হয়েছে এবং কারণসহ নোটিফিকেশন পাঠানো হয়েছে।" : "Report removed and rejection reason notified to whistleblower.");
                          } catch {
                            toast.error(isBangla ? "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।" : "Failed to update status.");
                          }
                        }}
                        className="px-2 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <XCircle className="w-3 h-3" /> {isBangla ? "বাতিল" : "Dismiss"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer: Evidence Attachment Count & View Details Link */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                    <Paperclip className="w-3.5 h-3.5 text-rose-400" />
                    <span>{report.evidence?.length || 0} Files Attached</span>
                  </div>

                  <Link
                    href={`/ghush-reports/${report.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    View Claim <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
