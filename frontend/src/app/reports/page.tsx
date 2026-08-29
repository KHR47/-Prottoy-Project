"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { AuthGate } from "@/components/ui/AuthGate";
import { ReportsCinematicBackground } from "@/components/home/ReportsCinematicBackground";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  PlusCircle, 
  FileText, 
  Map, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ReportingHubPage() {
  const { isReady, isGuest, user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  if (!isReady) return null;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative pb-16" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Surveillance Grid Background */}
      <ReportsCinematicBackground />

      <Navbar />

      <div className="py-12 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-500 p-2 rounded-lg shadow-lg shadow-teal-500/30">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{t.reports.title}</h1>
          </div>
          <p className="text-slate-300 max-w-2xl text-lg">
            {t.reports.subtitle}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
        >
          {/* Authority / Officer / Citizen Routing */}
          {user?.role === "authority" ? (
            <Link href="/authority/reports" className="group relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-teal-500/30 shadow-sm hover:shadow-md hover:border-teal-400 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/15 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="relative">
                <ShieldCheck className="h-8 w-8 text-teal-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                  {isBangla ? "নাগরিক রিপোর্ট ট্রায়াজ ও অফিসার নিয়োগ" : "Civic Triage & Officer Dispatch"}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {isBangla ? "দাখিলকৃত রিপোর্ট পর্যবেক্ষণ করুন, এআই ভিত্তিক নিকটস্থ অফিসার সুপারিশ গ্রহণ করুন এবং সমাধানের অগ্রগতি তদারকি করুন।" : "Review incoming hazard & crime reports, approve status updates, and dispatch field officers."}
                </p>
                <div className="flex items-center text-teal-400 font-bold text-sm">
                  {isBangla ? "অথরিটি ট্রায়াজে প্রবেশ করুন" : "Access Authority Triage"} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ) : user?.role === "officer" ? (
            <Link href="/officer/reports" className="group relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/30 shadow-sm hover:shadow-md hover:border-cyan-400 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/15 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="relative">
                <ShieldAlert className="h-8 w-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {isBangla ? "দায়িত্বপ্রাপ্ত অভিযোগ" : "My Assigned Cases"}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {isBangla ? "কর্তৃপক্ষ কর্তৃক আপনাকে বরাদ্দকৃত কেসসমূহ দেখুন ও সমাধান হালনাগাদ করুন।" : "View and update cases assigned to you for field investigation and resolution."}
                </p>
                <div className="flex items-center text-cyan-400 font-bold text-sm">
                  {isBangla ? "দায়িত্বপ্রাপ্ত কেসে যান" : "Go to Assigned Cases"} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ) : isGuest ? (
            <AuthGate message={isBangla ? "নাগরিক সমস্যা বা অভিযোগ দাখিল করতে লগইন করুন।" : "Sign in to report civic issues or safety concerns to the city authorities."}>
              <div className="group relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-md hover:border-teal-300 transition-all overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <PlusCircle className="h-8 w-8 text-teal-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">{t.reports.fileNew}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {isBangla ? "ভাঙা রাস্তা, ড্রেনেজ বা বাতির সমস্যা সরাসরি রিপোর্ট করুন।" : "Notice a broken street light, pothole, or civic issue? Report it instantly."}
                  </p>
                  <div className="flex items-center text-teal-400 font-bold text-sm">
                    {isBangla ? "লগইন করে দাখিল করুন" : "Sign in to Report"} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </AuthGate>
          ) : (
            <Link href="/reports/new" className="group relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-md hover:border-teal-300 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="relative">
                <PlusCircle className="h-8 w-8 text-teal-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">{t.reports.fileNew}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {isBangla ? "ভাঙা রাস্তা, ড্রেনেজ বা বাতির সমস্যা সরাসরি রিপোর্ট করুন।" : "Notice a broken street light, pothole, or civic issue? Report it instantly."}
                </p>
                <div className="flex items-center text-teal-400 font-bold text-sm">
                  {isBangla ? "রিপোর্ট শুরু করুন" : "Start Report"} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )}

          {/* Community Feed & Ledger */}
          <Link href="/reports/public" className="group relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative">
              <TrendingUp className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{isBangla ? "পাবলিক অভিযোগ লেজার" : "Community Reports"}</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {isBangla ? "নাগরিকদের করা অভিযোগ ও সমাধানের লাইভ অগ্রগতি দেখুন।" : "Browse and support civic issues reported by your community."}
              </p>
              <div className="flex items-center text-blue-400 font-bold text-sm">
                {isBangla ? "লেজার ব্রাউজ করুন" : "Browse Ledger"} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Anti-Bribery Vault */}
          <Link href="/ghush-reports" className="group relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-md hover:border-rose-400 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative">
              <ShieldAlert className="h-8 w-8 text-rose-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">{t.ghush.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {t.ghush.subtitle}
              </p>
              <div className="flex items-center text-rose-400 font-bold text-sm">
                {isBangla ? "ভল্ট ব্রাউজ করুন" : "Anti-Corruption Vault"} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* My Submitted Reports */}
          {isGuest ? (
            <AuthGate message={isBangla ? "আপনার পূর্ববর্তী রিপোর্ট দেখতে লগইন করুন।" : "Sign in to view and track your submitted reports."}>
              <div className="group relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-md hover:border-amber-300 transition-all overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <FileText className="h-8 w-8 text-amber-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">{isBangla ? "আমার অভিযোগ ট্র্যাকার" : "My Reports"}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {isBangla ? "আপনার দাখিলকৃত রিপোর্টের অবস্থা ও অফিসারের সমাধান ট্র্যাক করুন।" : "Track status, officer updates, and final resolutions of all your submitted reports."}
                  </p>
                  <div className="flex items-center text-amber-400 font-bold text-sm">
                    {isBangla ? "লগইন করে দেখুন" : "Sign in to View"} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </AuthGate>
          ) : (
            <Link href="/reports/my" className="group relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-md hover:border-amber-300 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="relative">
                <FileText className="h-8 w-8 text-amber-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">{isBangla ? "আমার অভিযোগ ট্র্যাকার" : "My Reports"}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {isBangla ? "আপনার দাখিলকৃত রিপোর্টের অবস্থা ও অফিসারের সমাধান ট্র্যাক করুন।" : "Track status, officer updates, and final resolutions of all your submitted reports."}
                </p>
                <div className="flex items-center text-amber-400 font-bold text-sm">
                  {isBangla ? "ইতিহাস দেখুন" : "View History"} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )}
        </motion.div>
      </main>
    </div>
  );
}
