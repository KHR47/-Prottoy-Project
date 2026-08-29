"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { HousingListing } from "@/types/housing";
import { HousingCinematicBackground } from "@/components/home/HousingCinematicBackground";
import { VoteWidget } from "@/components/common/VoteWidget";
import { CommentThread } from "@/components/common/CommentThread";
import { 
  Building, 
  MapPin, 
  Bed, 
  Star, 
  Phone, 
  Calendar, 
  ArrowLeft, 
  User, 
  Upload, 
  X, 
  Loader2,
  ShieldCheck,
  CheckCircle2,
  MessageSquarePlus
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function HousingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);
  const { user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  const [listing, setListing] = useState<HousingListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/housing/${listingId}`);
      setListing(res.data);
    } catch (err) {
      setError(getErrorMessage(err, isBangla ? "বাসার বিবরণ লোড করতে ব্যর্থ হয়েছে।" : "Failed to load housing listing."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBody.trim()) return;

    setIsSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append("rating", String(reviewRating));
      formData.append("body", reviewBody);
      reviewFiles.forEach((file) => {
        formData.append("proofImages", file);
      });

      await api.post(`/housing/${listingId}/review`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(isBangla ? "বাড়িওয়ালার রিভিউ সফলভাবে জমা হয়েছে!" : "Landlord review submitted!");
      setReviewBody("");
      setReviewFiles([]);
      setShowReviewForm(false);
      fetchListing();
    } catch (err) {
      toast.error(getErrorMessage(err, isBangla ? "রিভিউ দাখিলে ব্যর্থ হয়েছে।" : "Failed to submit review."));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold text-white mb-2">{isBangla ? "তালিকা খুঁজে পাওয়া যায়নি" : "Listing Not Found"}</h2>
          <p className="text-slate-400 mb-6">{error || (isBangla ? "অনুরোধকৃত বাসার বিজ্ঞাপনটি বিদ্যমান নেই।" : "The requested listing does not exist.")}</p>
          <Link href="/housing" className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-sm transition">
            ← {isBangla ? "আবাসন তালিকায় ফিরে যান" : "Back to Housing"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      {/* Hyper-Realistic Animated Verified Housing Background */}
      <HousingCinematicBackground />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10 space-y-8">
        {/* Top Back & ID */}
        <div className="flex items-center justify-between">
          <Link
            href="/housing"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Housing Directory
          </Link>
          <span className="text-xs font-mono text-slate-400">
            PROP_ID: #HOUSE_{listing.id.toString().padStart(4, "0")}
          </span>
        </div>

        {/* Main Property Card */}
        <div className="rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-mono font-black border border-emerald-500/30">
                ৳ {Number(listing.rent).toLocaleString()} / month
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {listing.ratingAvg > 0 ? `${listing.ratingAvg} / 5` : "No ratings yet"}
                <span className="text-slate-400">({listing.totalReviews})</span>
              </div>
            </div>

            <VoteWidget targetType="housing" targetId={listing.id} layout="horizontal" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {listing.title}
          </h1>

          {/* Photo Gallery */}
          {listing.images && listing.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {listing.images.map((img, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl overflow-hidden bg-black/60 border border-white/10"
                >
                  <img
                    src={img}
                    alt={`${listing.title} photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <p className="text-[11px] font-mono uppercase text-slate-400 mb-1">Address & Area</p>
              <p className="text-sm font-bold text-white truncate">{listing.address}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{listing.divisionName} Division</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <p className="text-[11px] font-mono uppercase text-slate-400 mb-1">Specifications</p>
              <p className="text-sm font-bold text-white">{listing.rooms} Bedrooms</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Policy: {listing.rentType}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <p className="text-[11px] font-mono uppercase text-slate-400 mb-1">Landlord Contact</p>
              <p className="text-sm font-bold text-indigo-400 truncate">
                {listing.contactPhone || listing.owner?.email || "Contact via portal"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Listed: {new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Property Overview & Utilities
              </h3>
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-sm sm:text-base text-slate-200 leading-relaxed font-light whitespace-pre-wrap">
                {listing.description}
              </div>
            </div>
          )}
        </div>

        {/* Tenant Reviews & Landlord Ratings Section */}
        <div className="rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Tenant Reviews ({listing.reviews?.length || 0})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentic feedback on water supply, electricity backup, landlord behavior, and maintenance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              {showReviewForm ? "Close Form" : "Write Tenant Review"}
            </button>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleReviewSubmit}
              className="p-6 rounded-2xl bg-black/60 border border-indigo-500/40 space-y-4"
            >
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Overall Rating (1 - 5 Stars) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-xl border transition-all ${
                        reviewRating >= star
                          ? "bg-amber-500/20 border-amber-400 text-amber-400"
                          : "bg-black/40 border-white/10 text-slate-500"
                      }`}
                    >
                      <Star className={`w-5 h-5 ${reviewRating >= star ? "fill-amber-400" : ""}`} />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tenant Experience & Safety Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details on water pump schedule, electricity meter fairness, noise level, security guard, deposit return experience..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Publish Review"
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* Review List */}
          {listing.reviews && listing.reviews.length > 0 ? (
            <div className="space-y-4">
              {listing.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-xs font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {rev.author?.name || "Verified Tenant"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-light pl-9 whitespace-pre-wrap">
                    {rev.body}
                  </p>

                  <p className="text-[10px] font-mono text-slate-500 pl-9">
                    Posted on {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-400 text-center py-6">
              No tenant reviews yet. Be the first tenant or neighbor to post a review!
            </p>
          )}
        </div>

        {/* Universal Threaded Comments */}
        <CommentThread targetType="housing" targetId={listing.id} title="Community Questions & Discussion" />
      </main>
    </div>
  );
}
