"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { GhushReport, GhushStatus } from "@/types/ghush-report";
import { GhushCinematicBackground } from "@/components/home/GhushCinematicBackground";
import { 
  ShieldAlert, 
  Lock, 
  Building2, 
  Banknote, 
  MapPin, 
  Calendar, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  EyeOff,
  User,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function GhushReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const reportId = Number(resolvedParams.id);
  const router = useRouter();
  const { user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  const [report, setReport] = useState<GhushReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Verification state for admin/authority/officer
  const [verifyStatus, setVerifyStatus] = useState<GhushStatus>("VERIFIED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await api.get(`/ghush-reports/${reportId}`);
        setReport(res.data);
        if (res.data.reviewNotes) setReviewNotes(res.data.reviewNotes);
        if (res.data.status) setVerifyStatus(res.data.status);
      } catch (err) {
        setError(getErrorMessage(err, isBangla ? "ঘুষের তথ্য লোড করতে ব্যর্থ হয়েছে।" : "Failed to load report."));
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reportId, isBangla]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await api.patch(`/ghush-reports/${reportId}/verify`, {
        status: verifyStatus,
        reviewNotes,
      });
      toast.success(isBangla ? "অভিযোগের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।" : "Report verification status updated.");
      const res = await api.get(`/ghush-reports/${reportId}`);
      setReport(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, isBangla ? "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।" : "Failed to update verification status."));
    } finally {
      setIsVerifying(false);
    }
  };

  const isModerator =
    user && (user.role === "admin" || user.role === "authority" || user.role === "officer");

  const statusBadge = (status: GhushStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isBangla ? "যাচাইকৃত সত্য" : "Verified Authentic"}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5" />
            {isBangla ? "প্রত্যাখ্যাত / ভিত্তিহীন" : "Dismissed / Unfounded"}
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30">
            <Clock className="h-3.5 w-3.5" />
            {isBangla ? "তদন্ত ও অডিটাধীন" : "Under Audit Investigation"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            {isBangla ? "অপেক্ষমান পর্যালোচনা" : "Pending Verification"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold text-white mb-2">{isBangla ? "অভিযোগ পাওয়া যায়নি" : "Report Not Found"}</h2>
          <p className="text-slate-400 mb-6">{error || (isBangla ? "অনুরোধকৃত ডসিয়ারটি বিদ্যমান নেই।" : "The requested corruption dossier does not exist.")}</p>
          <Link href="/ghush-reports" className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white text-sm transition">
            ← {isBangla ? "দুর্নীতি বিরোধী ভল্টে ফিরে যান" : "Back to Whistleblower Vault"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      {/* Hyper-Realistic Animated ACC Raid Background */}
      <GhushCinematicBackground />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10">
        {/* Top Back Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/ghush-reports"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Corruption Feed
          </Link>

          <span className="text-xs font-mono text-slate-400">
            CASE_ID: #GHUSH_{report.id.toString().padStart(4, "0")}
          </span>
        </div>

        {/* Main Incident Card */}
        <div className="rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Top Status & Department */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {report.department && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/30">
                    <Building2 className="w-3.5 h-3.5" />
                    {report.department}
                  </span>
                )}
                {report.isAnonymous ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                    <EyeOff className="w-3 h-3" /> Anonymous Whistleblower
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                    <User className="w-3 h-3" /> Reported by {report.reportedBy?.name || "Citizen"}
                  </span>
                )}
              </div>
            </div>

            <div>{statusBadge(report.status)}</div>
          </div>

          {/* Title & Key Incident Metrics */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {report.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {report.amountInvolved && report.amountInvolved > 0 && (
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
                  <p className="text-[11px] font-mono font-bold uppercase text-amber-400 mb-1">
                    Bribe Demanded
                  </p>
                  <p className="text-2xl font-black text-amber-400 tracking-tight">
                    ৳ {Number(report.amountInvolved).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
                <p className="text-[11px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Location / Office
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {report.location || report.districtName || report.divisionName || "Not specified"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {report.divisionName ? `${report.divisionName} Division` : ""}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
                <p className="text-[11px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Date of Submission
                </p>
                <p className="text-sm font-bold text-white">
                  {new Date(report.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {report.incidentDate && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Incident: {new Date(report.incidentDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Incident Detailed Account
            </h3>
            <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-sm sm:text-base text-slate-200 leading-relaxed font-light whitespace-pre-wrap">
              {report.description}
            </div>
          </div>

          {/* Attached Evidence Gallery */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-rose-400" />
                Attached Evidentiary Files ({report.evidence?.length || 0})
              </h3>
            </div>

            {report.evidence && report.evidence.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.evidence.map((file) => {
                  return (
                    <div
                      key={file.id}
                      className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 group hover:border-rose-400 transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="p-2.5 rounded-xl bg-slate-900 text-rose-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">
                            {file.originalName}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB • {file.mimeType}
                          </p>
                        </div>
                      </div>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                        title="Download / View Evidence"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-400 italic">
                No evidentiary files were attached with this submission.
              </p>
            )}
          </div>

          {/* Official Verification Audit Details (if verified or reviewed) */}
          {(report.verifiedAt || report.reviewNotes) && (
            <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Official Anti-Corruption Audit Findings</span>
              </div>
              <p className="text-sm text-slate-200 font-light leading-relaxed">
                {report.reviewNotes || "This incident has been audited and verified by designated anti-corruption authority."}
              </p>
              {report.verifiedBy && (
                <p className="text-xs font-mono text-emerald-400/80 pt-2">
                  Audited by: {report.verifiedBy.name} ({report.verifiedBy.role}) on{" "}
                  {report.verifiedAt ? new Date(report.verifiedAt).toLocaleDateString() : ""}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Admin / Moderator Verification Console */}
        {isModerator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border-2 border-teal-500/50 p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Moderator & Authority Verification Console
                </h3>
                <p className="text-xs text-slate-400 font-light">
                  You are logged in as {user?.role?.toUpperCase()}. You can verify, investigate, or reject this claim.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Set Incident Verification Status *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["VERIFIED", "UNDER_REVIEW", "PENDING", "REJECTED"] as GhushStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setVerifyStatus(st)}
                      className={`p-3 rounded-xl border text-xs font-bold font-mono transition-all ${
                        verifyStatus === st
                          ? st === "VERIFIED"
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30"
                            : st === "UNDER_REVIEW"
                            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30"
                            : st === "REJECTED"
                            ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30"
                            : "bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30"
                          : "bg-black/60 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Official Moderator Findings & Review Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="State evidence validation outcome, officer dispatch status, disciplinary actions initiated, or grounds for dismissal..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-y"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/25 transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Updating Status...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Verification Outcome
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
