"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { LostFoundItem, LostFoundType, LostFoundStatus } from "@/types/lost-found";
import { LostFoundCinematicBackground } from "@/components/home/LostFoundCinematicBackground";
import { 
  PackageSearch, 
  Plus, 
  Search, 
  MapPin, 
  Tag, 
  Eye, 
  Loader2, 
  HelpCircle,
  Clock,
  Check,
  X,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

const categoriesEn = [
  "All Categories",
  "National ID & Passport",
  "Wallet & Bank Cards",
  "Smartphone & Tablet",
  "Laptop & Electronics",
  "Keys & Keychain",
  "Bag, Backpack & Luggage",
  "Jewelry & Watches",
  "Vehicle Documents",
  "Pet & Animals",
  "Other Belongings",
];

const categoriesBn = [
  "সকল ক্যাটাগরি",
  "জাতীয় পরিচয়পত্র ও পাসপোর্ট",
  "মানিব্যাগ ও ব্যাংক কার্ড",
  "স্মার্টফোন ও ট্যাবলেট",
  "ল্যাপটপ ও ইলেকট্রনিক্স",
  "চাবি ও কি-রিং",
  "ব্যাগ, ব্যাকপ্যাক ও লাগেজ",
  "স্বর্ণালংকার ও ঘড়ি",
  "গাড়ির কাগজপত্র",
  "পোষা প্রাণী",
  "অন্যান্য সামগ্রী",
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

export default function LostFoundPage() {
  const { user } = useOptionalAuth();
  const isAuthority = user?.role === "authority" || user?.role === "admin";
  const { t, isBangla } = useLanguage();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | LostFoundType>("ALL");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const categories = isBangla ? categoriesBn : categoriesEn;
  const divisions = isBangla ? divisionsBn : divisionsEn;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.append("type", activeTab);
      if (selectedCategory !== "All Categories" && selectedCategory !== "সকল ক্যাটাগরি") params.append("category", selectedCategory);
      if (selectedDivision !== "All Divisions" && selectedDivision !== "সকল বিভাগ") params.append("divisionName", selectedDivision);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await api.get(`/lost-found?${params.toString()}`);
      setItems(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab, selectedCategory, selectedDivision, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleModerate = async (id: number, status: LostFoundStatus) => {
    let resolutionNotes = '';
    if (status === 'REJECTED') {
      const reason = window.prompt(
        isBangla
          ? "হারানো/প্রাপ্তি পোস্ট বাতিল করার কারণ লিখুন (নাগরিককে নোটিফিকেশন পাঠানো হবে):"
          : "Please state the reason for rejecting this lost/found post (user will receive notification with reason):"
      );
      if (reason === null) return;
      resolutionNotes = reason;
    }

    setActionLoadingId(id);
    try {
      const res = await api.patch(`/lost-found/${id}/status`, { status, resolutionNotes });
      if (status === 'REJECTED') {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success(isBangla ? "পোস্টটি মুছে ফেলা হয়েছে এবং কারণসহ নোটিফিকেশন পাঠানো হয়েছে।" : "Item removed from ledger and rejection reason notified to poster.");
      } else {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...res.data } : item)));
        toast.success(
          status === 'ACTIVE'
            ? (isBangla ? "আইটেমটি পাবলিক লেজারে সক্রিয় ও অনুমোদিত হয়েছে!" : "Item approved to public ledger!")
            : status === 'INSPECTING'
            ? (isBangla ? "কেসটি পরিদর্শনে স্থানান্তরিত হয়েছে।" : "Status set to Under Inspection.")
            : (isBangla ? "মালিকের কাছে হস্তান্তর নিশ্চিত করা হয়েছে।" : "Marked as Returned to owner.")
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
      <LostFoundCinematicBackground />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10">
        <div className="rounded-3xl bg-slate-950/80 p-8 sm:p-12 border border-white/10 shadow-2xl backdrop-blur-2xl mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest border border-amber-500/30">
              <PackageSearch className="w-3.5 h-3.5" /> {isBangla ? "নাগরিক হারানো ও প্রাপ্তি পোর্টাল" : "Civic Lost & Found Portal"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              {t.lostFound.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
              {t.lostFound.subtitle}
            </p>
          </div>

          {!isAuthority && (
            <Link
              href="/lost-found/new"
              className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/30 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              {t.lostFound.postItem}
            </Link>
          )}

          {isAuthority && (
            <div className="px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <span className="font-bold block uppercase tracking-wider">{isBangla ? "হেফাজত ও মালিকানা অডিট" : "Custody & Verification Console"}</span>
              <span className="text-[11px] text-slate-400">{isBangla ? "নাগরিক দাবি ও হস্তান্তর লগ পরিদর্শন করুন" : "Inspect claims and approve restitution"}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4 mb-8 backdrop-blur-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10">
              {(["ALL", "LOST", "FOUND"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeTab === tab
                      ? tab === "LOST"
                        ? "bg-rose-500 text-white shadow-md"
                        : tab === "FOUND"
                        ? "bg-teal-500 text-black shadow-md"
                        : "bg-white/20 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "ALL" ? (isBangla ? "সকল আইটেম" : "All Items") : tab === "LOST" ? (isBangla ? "🚨 হারানো" : "🚨 Lost Items") : (isBangla ? "🎁 প্রাপ্তি" : "🎁 Found Items")}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-grow max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isBangla ? "নাম বা এলাকা খুঁজুন..." : "Search item name, brand, location..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors"
              >
                {isBangla ? "খুঁজুন" : "Search"}
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {divisions.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAuthority && (
            <div className="flex items-center gap-2 pt-2 border-t border-white/10 overflow-x-auto pb-1">
              <span className="text-[11px] font-mono text-slate-400 mr-2">{isBangla ? "হেফাজত স্ট্যাটাস:" : "Custody Status:"}</span>
              {(["ALL", "PENDING", "ACTIVE", "INSPECTING", "RETURNED", "REJECTED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    selectedStatus === st
                      ? st === "ACTIVE"
                        ? "bg-emerald-500 text-slate-950 shadow-md"
                        : st === "INSPECTING"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : st === "RETURNED"
                        ? "bg-cyan-500 text-slate-950 shadow-md"
                        : st === "REJECTED"
                        ? "bg-rose-500 text-white shadow-md"
                        : st === "PENDING"
                        ? "bg-yellow-500 text-slate-950 shadow-md"
                        : "bg-white/20 text-white"
                      : "text-slate-400 hover:text-white bg-black/40"
                  }`}
                >
                  {st === "ALL" ? (isBangla ? "সকল" : "All") : st === "PENDING" ? (isBangla ? "অপেক্ষমান" : "Pending") : st === "ACTIVE" ? (isBangla ? "অনুমোদিত ও সক্রিয়" : "Approved") : st === "INSPECTING" ? (isBangla ? "পরিদর্শন" : "Inspecting") : st === "RETURNED" ? (isBangla ? "হস্তান্তরিত" : "Returned") : (isBangla ? "বাতিল" : "Rejected")}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-xs font-mono text-slate-400 mt-2">Loading custody ledger...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-950/60 border border-white/10 p-8">
            <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Matching Items Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No reported lost or found belongings in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 p-6 flex flex-col justify-between transition-all group shadow-lg shadow-black/50"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase ${
                        item.type === "LOST"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      }`}
                    >
                      {item.type === "LOST" ? (isBangla ? "🚨 হারানো" : "🚨 LOST") : (isBangla ? "🎁 প্রাপ্তি" : "🎁 FOUND")}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        item.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : item.status === "INSPECTING"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : item.status === "RETURNED" || item.status === "FOUND"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : item.status === "REJECTED"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      }`}
                    >
                      {item.status === "ACTIVE" ? (isBangla ? "অনুমোদিত" : "Active & Verified") : item.status === "INSPECTING" ? (isBangla ? "পরিদর্শন" : "Inspecting") : item.status === "RETURNED" ? (isBangla ? "হস্তান্তরিত" : "Returned") : item.status === "REJECTED" ? (isBangla ? "বাতিল" : "Rejected") : (isBangla ? "অপেক্ষমান" : "Pending Review")}
                    </span>
                  </div>

                  {item.images && item.images.length > 0 && (
                    <div className="h-44 w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 relative">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{item.location || item.divisionName || "Location not given"}</span>
                    </div>

                    {item.category && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{item.category}</span>
                      </div>
                    )}

                    {item.rewardAmount && item.rewardAmount > 0 && (
                      <div className="text-amber-400 font-bold">
                        Reward: ৳ {Number(item.rewardAmount).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {isAuthority && (
                  <div className="mt-4 pt-3 border-t border-amber-500/20 bg-amber-950/20 rounded-2xl p-3 space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {isBangla ? "হেফাজত ও অডিট সিদ্ধান্ত:" : "Custody Audit Decision:"}
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleModerate(item.id, 'INSPECTING')}
                        className="px-1.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Clock className="w-3 h-3" /> {isBangla ? "পরিদর্শন" : "Inspect"}
                      </button>
                      <button
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleModerate(item.id, 'ACTIVE')}
                        className="px-1.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Check className="w-3 h-3" /> {isBangla ? "অনুমোদন" : "Approve"}
                      </button>
                      <button
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleModerate(item.id, 'RETURNED')}
                        className="px-1.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" /> {isBangla ? "ফেরত" : "Return"}
                      </button>
                      <button
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleModerate(item.id, 'REJECTED')}
                        className="px-1.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <X className="w-3 h-3" /> {isBangla ? "বাতিল" : "Reject"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/lost-found/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 font-mono transition-colors"
                  >
                    {isAuthority || (user && item.reportedBy && user.id === item.reportedBy.id)
                      ? (isBangla ? "বিস্তারিত দেখুন" : "View Details")
                      : (isBangla ? "দাবি ও বিবরণ" : "View & Claim")}{" "}
                    <Eye className="w-3.5 h-3.5" />
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
