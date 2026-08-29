"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useRequireRole } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Report, ReportStatus } from "@/types/report";
import type { User } from "@/types/user";
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  MapPin, 
  Search,
  Sparkles,
  ExternalLink,
  Filter
} from "lucide-react";
import { AuthorityCinematicBackground } from "@/components/home/AuthorityCinematicBackground";

const statuses: ("all" | ReportStatus)[] = [
  "all",
  "submitted",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
];

const priorityStyles: Record<string, string> = {
  low: "bg-slate-800 text-slate-300 border border-slate-700",
  medium: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  high: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  critical: "bg-red-500/20 text-red-400 border border-red-500/30 font-bold",
};

export default function AuthorityReportsPage() {
  const { isReady } = useRequireRole(["authority", "admin"]);
  const { t, isBangla } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [selectedOfficers, setSelectedOfficers] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchReportData() {
    const [reportsResponse, officersResponse] = await Promise.all([
      api.get("/reports"),
      api.get("/users/officers"),
    ]);

    return {
      reports: reportsResponse.data,
      officers: officersResponse.data,
    };
  }

  async function loadData() {
    const data = await fetchReportData();
    setReports(data.reports);
    setOfficers(data.officers);
  }

  useEffect(() => {
    if (!isReady) return;
    let isActive = true;

    async function run() {
      try {
        const data = await fetchReportData();
        if (!isActive) return;
        setReports(data.reports);
        setOfficers(data.officers);
      } catch (error: unknown) {
        if (isActive) {
          setError(getErrorMessage(error, "Could not load reports."));
        }
      }
    }

    void run();

    return () => {
      isActive = false;
    };
  }, [isReady]);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (statusFilter !== "all") {
      list = list.filter((report) => report.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => 
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.districtName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reports, statusFilter, searchQuery]);

  const submittedCount = reports.filter((r) => r.status === "submitted").length;
  const assignedCount = reports.filter((r) => r.status === "assigned" || r.status === "in_progress").length;
  const criticalCount = reports.filter((r) => r.priority === "critical").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  function getSuggestedOfficer(report: Report) {
    if (!officers.length) return null;

    const scoredOfficers = officers.map((officer) => {
      let score = 0;
      const officerDistrict = (officer as any).district;
      const reportDistrict = report.districtName;
      const isLocal = officerDistrict && reportDistrict && officerDistrict === reportDistrict;
      if (isLocal) score += 100;

      const workload = reports.filter(
        (r) =>
          r.assignedOfficer?.id === officer.id &&
          (r.status === "assigned" || r.status === "in_progress")
      ).length;

      score -= workload * 10;
      return { officer, score, workload, isLocal };
    });

    scoredOfficers.sort((a, b) => b.score - a.score);
    return scoredOfficers[0];
  }

  async function assignReport(reportId: number) {
    setError("");
    setMessage("");

    const officerId = selectedOfficers[reportId];
    if (!officerId) {
      setError(isBangla ? "অনুগ্রহ করে প্রথমে একজন অফিসার নির্বাচন করুন।" : "Please select an officer first.");
      return;
    }

    try {
      await api.patch(`/reports/${reportId}/assign`, {
        officerId: Number(officerId),
      });

      setMessage(isBangla ? "অফিসার সফলভাবে নিয়োগ দেওয়া হয়েছে।" : "Report assigned to officer successfully.");
      await loadData();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Assignment failed."));
    }
  }

  if (!isReady) return null;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 relative" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      {/* Hyperrealistic Animated Sovereign Authority Command Background */}
      <AuthorityCinematicBackground />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-black uppercase tracking-widest border border-teal-500/30">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                {isBangla ? "অথরিটি রিপোর্ট ট্রায়াজ" : "AUTHORITY INCIDENT TRIAGE"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isBangla ? "নাগরিক অভিযোগ ও ক্রাইম রিপোর্ট" : "Incoming Civic Reports"}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              {isBangla 
                ? "শহরের বিভিন্ন এলাকা থেকে আসা জরুরি রিপোর্ট পর্যালোচনা করুন এবং ক্ষেত্রবিশেষে উপযুক্ত দায়িত্বপ্রাপ্ত অফিসারদের দায়িত্ব অর্পণ করুন।"
                : "Evaluate civic infrastructure and hazard reports. Utilize AI location dispatch to assign optimal field responders."}
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 backdrop-blur-xl">
              <p className="text-[10px] font-mono font-bold uppercase text-slate-400">
                {isBangla ? "নতুন দাখিল" : "Submitted"}
              </p>
              <p className="text-2xl font-black text-amber-400">{submittedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 backdrop-blur-xl">
              <p className="text-[10px] font-mono font-bold uppercase text-slate-400">
                {isBangla ? "দায়িত্ব অর্পিত" : "Assigned"}
              </p>
              <p className="text-2xl font-black text-sky-400">{assignedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 backdrop-blur-xl">
              <p className="text-[10px] font-mono font-bold uppercase text-slate-400">
                {isBangla ? "জরুরি / ক্রিটিকাল" : "Critical"}
              </p>
              <p className="text-2xl font-black text-rose-400">{criticalCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 backdrop-blur-xl">
              <p className="text-[10px] font-mono font-bold uppercase text-slate-400">
                {isBangla ? "সমাধানকৃত" : "Resolved"}
              </p>
              <p className="text-2xl font-black text-emerald-400">{resolvedCount}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-3.5 py-2 text-xs font-mono font-bold capitalize transition-all ${
                  statusFilter === status
                    ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                    : "border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                {status === "all" ? (isBangla ? "সকল (" + reports.length + ")" : "All (" + reports.length + ")") : status.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isBangla ? "শিরোনাম বা এলাকা দিয়ে খুঁজুন..." : "Filter by title or location..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
            />
          </div>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Reports List */}
        <div className="grid gap-5">
          {filteredReports.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">
                {isBangla ? "কোনো রিপোর্ট পাওয়া যায়নি" : "No Reports Found"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isBangla ? "নির্বাচিত ক্যাটাগরি বা সার্চ অনুযায়ী কোনো রেকর্ড নেই।" : "No civic reports match your filter criteria."}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const suggestion = report.status === "submitted" ? getSuggestedOfficer(report) : null;

              return (
                <article
                  key={report.id}
                  className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 sm:p-7 backdrop-blur-2xl shadow-xl transition-all hover:border-white/20 relative overflow-hidden group"
                >
                  <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
                    
                    {/* Left Details */}
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${priorityStyles[report.priority]}`}>
                          {report.priority}
                        </span>
                        <StatusBadge status={report.status} />
                        <span className="text-[11px] font-mono text-slate-400 ml-1">
                          #{report.id} • {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                        {report.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300 max-w-3xl font-light">
                        {report.description}
                      </p>

                      {/* Meta attributes */}
                      <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4 border-t border-white/10">
                        <div>
                          <dt className="font-mono text-slate-400 uppercase text-[10px]">{isBangla ? "নাগরিক" : "Citizen"}</dt>
                          <dd className="mt-0.5 text-white font-medium">
                            {report.isAnonymous ? (isBangla ? "গোপনীয়" : "Anonymous") : (report.reportedBy?.name || "Citizen")}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-mono text-slate-400 uppercase text-[10px]">{isBangla ? "ক্যাটাগরি" : "Category"}</dt>
                          <dd className="mt-0.5 text-white font-medium">{report.category?.name || "General"}</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-slate-400 uppercase text-[10px]">{isBangla ? "এলাকা ও ওয়ার্ড" : "District / Upazila"}</dt>
                          <dd className="mt-0.5 text-white font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                            <span>{report.upazilaName ? `${report.upazilaName}, ` : ""}{report.districtName || "Dhaka"}</span>
                          </dd>
                        </div>
                        <div>
                          <dt className="font-mono text-slate-400 uppercase text-[10px]">{isBangla ? "দায়িত্বপ্রাপ্ত" : "Assigned Officer"}</dt>
                          <dd className="mt-0.5 font-medium text-teal-400">
                            {report.assignedOfficer?.name || (isBangla ? "অপেক্ষমান" : "Unassigned")}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Right Action & AI Dispatch Box */}
                    <div className="flex min-w-[280px] lg:max-w-xs flex-col gap-3 shrink-0">
                      {suggestion && (
                        <div className="rounded-2xl bg-teal-950/50 p-4 border border-teal-500/30 relative overflow-hidden">
                          <div className="flex items-center gap-1.5 mb-1.5 text-teal-300 text-[10px] font-mono font-black uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            <span>AI Smart Dispatch</span>
                          </div>
                          <p className="font-bold text-white text-sm mb-1">{suggestion.officer.name}</p>
                          <div className="flex justify-between text-[11px] text-slate-400 mb-3">
                            <span>{isBangla ? "চলতি কেস:" : "Workload:"} <strong className="text-white">{suggestion.workload}</strong></span>
                            <span>{suggestion.isLocal ? "📍 Local Officer" : "District Match"}</span>
                          </div>
                          <button
                            onClick={() => setSelectedOfficers({ ...selectedOfficers, [report.id]: String(suggestion.officer.id) })}
                            className="w-full text-xs font-mono font-bold text-teal-300 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 py-1.5 rounded-xl transition-all"
                          >
                            {isBangla ? "সুপারিশ গ্রহণ করুন" : "Select Recommended"}
                          </button>
                        </div>
                      )}

                      {/* Assignment Selector */}
                      <div className="flex flex-col gap-2">
                        <select
                          className="w-full h-10 rounded-xl border border-white/15 bg-slate-900 px-3 text-xs font-medium text-white outline-none transition focus:border-teal-500"
                          value={selectedOfficers[report.id] || ""}
                          onChange={(e) => setSelectedOfficers({ ...selectedOfficers, [report.id]: e.target.value })}
                        >
                          <option value="">{isBangla ? "-- দায়িত্বপ্রাপ্ত অফিসার বাছুন --" : "-- Select Officer --"}</option>
                          {officers.map((officer) => (
                            <option key={officer.id} value={officer.id}>
                              {officer.name} {officer.badgeNumber ? `(${officer.badgeNumber})` : ""}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => assignReport(report.id)}
                          className="w-full py-2 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md shadow-teal-500/20"
                        >
                          {isBangla ? "অফিসার নিয়োগ করুন" : "Assign Officer"}
                        </button>
                      </div>

                      <Link
                        href={`/reports/${report.id}`}
                        className="inline-flex items-center justify-center gap-1 text-xs font-mono font-semibold text-slate-400 hover:text-white mt-1 transition-colors"
                      >
                        <span>{isBangla ? "বিস্তারিত দেখুন" : "View Full Docket"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}


