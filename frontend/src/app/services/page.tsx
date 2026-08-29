"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ServiceListing } from "@/types/service";
import { ServicesCinematicBackground } from "@/components/home/ServicesCinematicBackground";
import { 
  Wrench, 
  Plus, 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  Loader2,
  Zap,
  Droplets,
  HardHat,
  HeartPulse,
  Laptop,
  AlertCircle,
  XCircle,
  Clock,
  Check,
  X,
  SearchCode
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

const categoriesEn = [
  "All Categories",
  "Electricians & Wiring",
  "Plumbing & Sanitation",
  "Appliance & AC Repair",
  "Cleaning & Pest Control",
  "IT & Hardware Support",
  "Emergency Ambulance & Medical",
  "Carpentry & Masonry",
  "Auto & Motor Mechanics",
  "Other Local Services",
];

const categoriesBn = [
  "সকল ক্যাটাগরি",
  "ইলেকট্রিশিয়ান ও ওয়্যারিং",
  "প্লাম্বিং ও স্যানিটেশন",
  "এসি ও হোম অ্যাপ্লায়েন্স মেরামত",
  "ক্লিনিং ও পেস্ট কন্ট্রোল",
  "আইটি ও কম্পিউটার হার্ডওয়্যার",
  "জরুরি অ্যাম্বুলেন্স ও চিকিৎসা সেবা",
  "কাঠমিস্ত্রি ও রাজমিস্ত্রি",
  "গাড়ি ও মোটর মেকানিক",
  "অন্যান্য স্থানীয় কারিগরি সেবা",
];

const divisionsEn = [
  "All Divisions",
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

const divisionsBn = [
  "সকল বিভাগ",
  "ঢাকা",
  "চট্টগ্রাম",
  "সিলেট",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "রংপুর",
  "ময়মনসিংহ",
];

export default function ServicesPage() {
  const { user } = useOptionalAuth();
  const isAuthority = user?.role === "authority" || user?.role === "admin";
  const { t, isBangla } = useLanguage();
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const categories = isBangla ? categoriesBn : categoriesEn;
  const divisions = isBangla ? divisionsBn : divisionsEn;

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All Categories" && selectedCategory !== "সকল ক্যাটাগরি") params.append("category", selectedCategory);
      if (selectedDivision !== "All Divisions" && selectedDivision !== "সকল বিভাগ") params.append("divisionName", selectedDivision);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await api.get(`/services?${params.toString()}`);
      setServices(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, selectedDivision, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleModerate = async (id: number, status: 'APPROVED' | 'INSPECTING' | 'REJECTED') => {
    let notes = '';
    if (status === 'REJECTED') {
      const reason = window.prompt(
        isBangla
          ? "বাতিল করার কারণ অথবা ক্যাটাগরিতে অন্তর্ভুক্ত না করার কারণ লিখুন (নাগরিককে নোটিফিকেশন পাঠানো হবে):"
          : "Please state the reason for rejecting this service listing (user will receive notification with reason):"
      );
      if (reason === null) return;
      notes = reason;
    }

    setActionLoadingId(id);
    try {
      const res = await api.patch(`/services/${id}/moderate`, { status, notes });
      if (status === 'REJECTED') {
        setServices((prev) => prev.filter((s) => s.id !== id));
        toast.success(isBangla ? "তালিকাটি মুছে ফেলা হয়েছে এবং কারণসহ নোটিফিকেশন পাঠানো হয়েছে।" : "Listing removed and rejection reason notified to user.");
      } else {
        setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...res.data } : s)));
        toast.success(
          status === 'APPROVED'
            ? (isBangla ? "কারিগর সফলভাবে অনুমোদিত ও যাচাইকৃত হয়েছে!" : "Service approved and verified!")
            : (isBangla ? "কেসটি পরিদর্শনে স্থানান্তরিত হয়েছে।" : "Status set to Under Inspection.")
        );
      }
    } catch {
      toast.error(isBangla ? "অনুরোধ প্রক্রিয়া করতে ব্যর্থ হয়েছে।" : "Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans pb-24 relative" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Civic Services Background */}
      <ServicesCinematicBackground />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10">
        {/* Hero Header */}
        <div className="rounded-3xl bg-slate-950/80 p-8 sm:p-12 border border-white/10 shadow-2xl backdrop-blur-2xl mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest border border-cyan-500/30">
              <Wrench className="w-3.5 h-3.5" /> {isBangla ? "নাগরিক সেবা ও কারিগর ডিরেক্টরি" : "Civic Trade & Service Directory"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              {t.services.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
              {t.services.subtitle}
            </p>
          </div>

          {!isAuthority && (
            <Link
              href="/services/new"
              className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all shrink-0 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              {t.services.registerTrade}
            </Link>
          )}

          {isAuthority && (
            <div className="px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="font-bold block uppercase tracking-wider">{isBangla ? "অথরিটি অডিট মোড" : "Authority Oversight Mode"}</span>
              <span className="text-[11px] text-slate-400">{isBangla ? "নাগরিক কারিগরদের প্রোফাইল পরিদর্শন ও অনুমোদন করুন" : "Inspect and moderate pro trade submissions"}</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4 mb-8 backdrop-blur-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-grow max-w-lg">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search service name, technician, trade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {divisions.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter for Authority / Moderation */}
          {isAuthority && (
            <div className="flex items-center gap-2 pt-2 border-t border-white/10 overflow-x-auto pb-1">
              <span className="text-[11px] font-mono text-slate-400 mr-2">{isBangla ? "স্ট্যাটাস:" : "Audit Status:"}</span>
              {(["ALL", "PENDING", "INSPECTING", "APPROVED", "REJECTED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    selectedStatus === st
                      ? st === "APPROVED"
                        ? "bg-emerald-500 text-slate-950 shadow-md"
                        : st === "INSPECTING"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : st === "REJECTED"
                        ? "bg-rose-500 text-white shadow-md"
                        : st === "PENDING"
                        ? "bg-yellow-500 text-slate-950 shadow-md"
                        : "bg-white/20 text-white"
                      : "text-slate-400 hover:text-white bg-black/40"
                  }`}
                >
                  {st === "ALL" ? (isBangla ? "সকল" : "All") : st === "PENDING" ? (isBangla ? "অপেক্ষমান" : "Pending") : st === "INSPECTING" ? (isBangla ? "পরিদর্শন" : "Inspecting") : st === "APPROVED" ? (isBangla ? "অনুমোদিত" : "Approved") : (isBangla ? "বাতিল" : "Rejected")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            <p className="text-xs font-mono text-slate-400 mt-2">Loading service providers...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-950/60 border border-white/10 p-8">
            <Wrench className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Service Providers Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No matching service listings in this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item) => {
              const status = item.status || (item.isVerified ? "APPROVED" : "PENDING");
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 p-6 flex flex-col justify-between transition-all group shadow-lg shadow-black/50"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {item.category}
                      </span>

                      {status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" /> {isBangla ? "যাচাইকৃত কারিগর" : "Verified Pro"}
                        </span>
                      ) : status === "INSPECTING" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" /> {isBangla ? "পরিদর্শন চলমান" : "Under Inspection"}
                        </span>
                      ) : status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> {isBangla ? "বাতিলকৃত" : "Rejected"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/20">
                          <Clock className="w-3.5 h-3.5" /> {isBangla ? "অনুমোদন অপেক্ষমান" : "Pending Review"}
                        </span>
                      )}
                    </div>

                    {/* Title & Details */}
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed font-light">
                        {item.details}
                      </p>
                    </div>

                    {/* Rating & Location */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs font-mono text-slate-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{item.ratingAvg > 0 ? item.ratingAvg : "New"}</span>
                          <span className="text-slate-500 font-normal">({item.totalReviews} reviews)</span>
                        </div>

                        <div className="flex items-center gap-1 truncate text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{item.location || item.divisionName}</span>
                        </div>
                      </div>

                      {item.phone && (
                        <div className="flex items-center gap-1 text-slate-400 pt-1">
                          <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Authority Decision Action Bar */}
                  {isAuthority && (
                    <div className="mt-4 pt-3 border-t border-cyan-500/20 bg-cyan-950/20 rounded-2xl p-3 space-y-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                        {isBangla ? "অথরিটি সিদ্ধান্ত:" : "Authority Decision:"}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleModerate(item.id, 'INSPECTING')}
                          className="px-2 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <Clock className="w-3 h-3" /> {isBangla ? "পরিদর্শন" : "Inspect"}
                        </button>
                        <button
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleModerate(item.id, 'APPROVED')}
                          className="px-2 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <Check className="w-3 h-3" /> {isBangla ? "অনুমোদন" : "Approve"}
                        </button>
                        <button
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleModerate(item.id, 'REJECTED')}
                          className="px-2 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <X className="w-3 h-3" /> {isBangla ? "বাতিল" : "Reject"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      Listed {new Date(item.createdAt).toLocaleDateString()}
                    </span>

                    <Link
                      href={`/services/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                    >
                      Profile & Reviews <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
