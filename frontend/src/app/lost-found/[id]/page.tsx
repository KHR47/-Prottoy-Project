"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { LostFoundItem, LostFoundStatus } from "@/types/lost-found";
import { LostFoundCinematicBackground } from "@/components/home/LostFoundCinematicBackground";
import { VoteWidget } from "@/components/common/VoteWidget";
import { CommentThread } from "@/components/common/CommentThread";
import { 
  PackageSearch, 
  MapPin, 
  Tag, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  User,
  ShieldCheck,
  HelpCircle,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function LostFoundDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const itemId = Number(resolvedParams.id);
  const { user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Claim Modal
  const [claimMessage, setClaimMessage] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Status Change (for reporter or admin)
  const [newStatus, setNewStatus] = useState<LostFoundStatus>("RETURNED");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchItem = async () => {
    try {
      const res = await api.get(`/lost-found/${itemId}`);
      setItem(res.data);
      if (res.data.status) setNewStatus(res.data.status);
    } catch (err) {
      setError(getErrorMessage(err, isBangla ? "পোস্টের বিবরণ লোড করতে ব্যর্থ হয়েছে।" : "Failed to load item details."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimMessage.trim()) return;

    setIsClaiming(true);
    try {
      await api.post(`/lost-found/${itemId}/claim`, { message: claimMessage });
      toast.success(isBangla ? "মালিকানা দাবি সফলভাবে পোস্ট করা হয়েছে!" : "Claim request submitted to owner!");
      setClaimMessage("");
      setShowClaimModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, isBangla ? "দাবি দাখিলে ব্যর্থ হয়েছে।" : "Failed to submit claim."));
    } finally {
      setIsClaiming(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await api.patch(`/lost-found/${itemId}/status`, {
        status: newStatus,
        resolutionNotes,
      });
      toast.success(isBangla ? "স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!" : "Status updated successfully!");
      fetchItem();
    } catch (err) {
      toast.error(getErrorMessage(err, isBangla ? "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।" : "Failed to update status."));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isOwnerOrAdmin =
    user && (user.id === item?.reportedBy?.id || user.role === "admin");

  if (loading) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold text-white mb-2">{isBangla ? "পোস্ট খুঁজে পাওয়া যায়নি" : "Item Not Found"}</h2>
          <p className="text-slate-400 mb-6">{error || (isBangla ? "অনুরোধকৃত পোস্টটি আর বিদ্যমান নেই।" : "The requested post does not exist.")}</p>
          <Link href="/lost-found" className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white text-sm transition">
            ← {isBangla ? "হারানো ও প্রাপ্তি তালিকায় ফিরে যান" : "Back to Lost & Found"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      {/* Hyper-Realistic Animated Civic Lost & Found Vault Background */}
      <LostFoundCinematicBackground />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10 space-y-8">
        {/* Top Back & ID */}
        <div className="flex items-center justify-between">
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
          </Link>
          <span className="text-xs font-mono text-slate-400">
            CASE_ID: #LF_{item.id.toString().padStart(4, "0")}
          </span>
        </div>

        {/* Main Item Card */}
        <div className="rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                  item.type === "LOST"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : "bg-teal-500/20 text-teal-300 border-teal-500/30"
                }`}
              >
                {item.type === "LOST" ? "🚨 LOST ITEM" : "🎁 FOUND ITEM"}
              </span>

              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                  item.status === "ACTIVE"
                    ? "bg-amber-500/20 text-amber-300"
                    : item.status === "RETURNED" || item.status === "FOUND"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                STATUS: {item.status}
              </span>
            </div>

            <VoteWidget targetType="lost-found" targetId={item.id} layout="horizontal" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {item.title}
          </h1>

          {/* Photo Gallery */}
          {item.images && item.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {item.images.map((img, i) => (
                <div
                  key={i}
                  className="h-52 rounded-2xl overflow-hidden bg-black/60 border border-white/10"
                >
                  <img
                    src={img}
                    alt={`${item.title} photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <p className="text-[11px] font-mono uppercase text-slate-400 mb-1">Category</p>
              <p className="text-sm font-bold text-white truncate">{item.category || "General"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <p className="text-[11px] font-mono uppercase text-slate-400 mb-1">Location</p>
              <p className="text-sm font-bold text-white truncate">
                {item.location || item.districtName || item.divisionName || "Not specified"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <p className="text-[11px] font-mono uppercase text-slate-400 mb-1">Reported On</p>
              <p className="text-sm font-bold text-white">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Item Details & Marks
            </h3>
            <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-sm sm:text-base text-slate-200 leading-relaxed font-light whitespace-pre-wrap">
              {item.description}
            </div>
          </div>

          {/* Contact / Reward / Action Bar */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              {item.rewardAmount && item.rewardAmount > 0 ? (
                <p className="text-base font-black text-amber-400">
                  Reward Offered: ৳ {Number(item.rewardAmount).toLocaleString()}
                </p>
              ) : (
                <p className="text-sm font-bold text-white">Civic Return Protocol</p>
              )}
              {item.contact && (
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Direct Contact: {item.contact}
                </p>
              )}
            </div>

            {item.status === "ACTIVE" && (
              <>
                {user && item.reportedBy && user.id === item.reportedBy.id ? (
                  <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                    <span className="font-bold block">
                      {isBangla ? "আপনি এই আইটেমটি পোস্ট করেছেন" : "You posted this listing"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isBangla ? "নিজের পোস্টে দাবি করা যাবে না" : "Cannot claim an item you posted yourself"}
                    </span>
                  </div>
                ) : user && (user.role === "authority" || user.role === "admin" || user.role === "officer") ? (
                  <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                    <span className="font-bold block">
                      {isBangla ? "অথরিটি / অফিসার অ্যাকাউন্ট" : "Authority / Officer Mode"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isBangla ? "অথরিটি দাবি দাখিল করতে পারে না" : "Authorities cannot claim citizen items"}
                    </span>
                  </div>
                ) : !user ? (
                  <Link
                    href="/login"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs font-mono shadow-lg shadow-amber-500/20 transition-all shrink-0"
                  >
                    {isBangla ? "লগইন করে দাবি করুন" : "Login to Submit Claim"}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs font-mono shadow-lg shadow-amber-500/20 transition-all shrink-0"
                  >
                    🎁 {isBangla ? "মালিকানা দাবি দাখিল করুন" : "Submit Ownership Claim"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Claim info if claimed */}
          {item.claimedBy && (
            <div className="p-6 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Claim In Progress
              </div>
              <p className="text-xs text-slate-300">
                Claimed by <span className="font-bold text-white">{item.claimedBy.name}</span> on{" "}
                {item.claimedAt ? new Date(item.claimedAt).toLocaleDateString() : ""}
              </p>
              {item.claimMessage && (
                <p className="text-xs text-slate-300 italic pt-1">
                  Message: &quot;{item.claimMessage}&quot;
                </p>
              )}
            </div>
          )}

          {/* Resolution notes if returned */}
          {item.resolutionNotes && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-xs font-bold text-emerald-400">Resolution Details:</p>
              <p className="text-xs text-slate-200 mt-1">{item.resolutionNotes}</p>
            </div>
          )}
        </div>

        {/* Claim Modal */}
        {showClaimModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="rounded-3xl bg-slate-950 border border-white/20 p-8 max-w-lg w-full space-y-4 shadow-2xl">
              <h3 className="text-xl font-bold text-white">Claim Ownership of this Item</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Provide proof or identifiable details (such as wallpaper on the phone, exact serial fragment, contents of the bag, or identifying marks) that only the true owner would know.
              </p>

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <textarea
                  required
                  rows={4}
                  placeholder="Describe secret proof of ownership..."
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-y"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isClaiming}
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black"
                  >
                    {isClaiming ? "Submitting..." : "Send Claim to Finder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Owner / Admin Status Resolution Console */}
        {isOwnerOrAdmin && (
          <div className="rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white">Listing Management (Author / Admin)</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {(["ACTIVE", "FOUND", "RETURNED", "EXPIRED"] as LostFoundStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      newStatus === st
                        ? "bg-amber-500 text-black border-amber-400 shadow-md"
                        : "bg-black/60 text-slate-400 border-white/10"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Resolution notes (e.g. Returned to owner via Dhanmondi police station)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                disabled={updatingStatus}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono"
              >
                {updatingStatus ? "Saving..." : "Save Status"}
              </button>
            </form>
          </div>
        )}

        {/* Universal Threaded Comments */}
        <CommentThread targetType="lost-found" targetId={item.id} title="Item Clarification & Community Thread" />
      </main>
    </div>
  );
}
