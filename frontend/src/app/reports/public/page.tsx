"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { AuthGate } from "@/components/ui/AuthGate";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Report } from "@/types/report";
import { ReportsCinematicBackground } from "@/components/home/ReportsCinematicBackground";
import { ThumbsUp, MapPin, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function PublicReportsPage() {
  const { isGuest } = useOptionalAuth();
  const { t, isBangla } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await api.get("/reports/public");
        setReports(response.data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Could not load community reports."));
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  async function handleUpvote(reportId: number) {
    try {
      const res = await api.post(`/reports/${reportId}/upvote`);
      const { upvoted, upvoteCount, priority } = res.data;
      
      setReports((currentReports) => currentReports.map(r => {
        if (r.id === reportId) {
          return { ...r, upvoteCount, priority };
        }
        return r;
      }));

      if (upvoted) {
        toast.success(isBangla ? "আপনি এই সমস্যাটিতে সমর্থন জানিয়েছেন!" : "You supported this issue!");
      } else {
        toast(isBangla ? "সমর্থন প্রত্যাহার করা হয়েছে।" : "Removed your support.");
      }

    } catch {
      toast.error(isBangla ? "অপারেশন সম্পন্ন করা যায়নি।" : "Could not complete action.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Surveillance Grid Background */}
      <ReportsCinematicBackground />

      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-400 shadow-sm mb-3">
            <TrendingUp className="h-4 w-4 text-teal-400" /> {isBangla ? "নাগরিক অংশগ্রহণ ও স্বচ্ছতা" : "Community Engagement"}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            {t.reports.title}
          </h1>
          <p className="mt-2 text-slate-300 text-lg max-w-2xl">
            {t.reports.subtitle}
          </p>
        </motion.div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm mb-8">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100/50 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={report.id} 
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {report.priority === "high" && (
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-3xl">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-8 translate-x-[30%] translate-y-[30%] rotate-45 shadow-sm">
                      Hot
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <StatusBadge status={report.status} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 line-clamp-2">
                    {report.title}
                  </h3>
                  <p className="mb-4 text-sm text-slate-500 line-clamp-3">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-300" />
                    <span className="truncate">{report.upazilaName ? `${report.upazilaName}, ` : ""}{report.districtName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {isGuest ? (
                    <AuthGate message="Sign in to support this community issue and help it get resolved faster.">
                      <button 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm transition-all hover:bg-blue-600 hover:text-white"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Support ({report.upvoteCount || 0})
                      </button>
                    </AuthGate>
                  ) : (
                    <button 
                      onClick={() => handleUpvote(report.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm transition-all hover:bg-blue-600 hover:text-white"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Support ({report.upvoteCount || 0})
                    </button>
                  )}
                  
                  <Link 
                    href={`/reports/${report.id}`}
                    className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </motion.div>
            ))}
            
            {reports.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No public reports</h3>
                <p className="text-slate-500 mt-1">There are no civic issues reported in the community yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

