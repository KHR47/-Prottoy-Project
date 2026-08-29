"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { ServiceListing } from "@/types/service";
import { ServicesCinematicBackground } from "@/components/home/ServicesCinematicBackground";
import { VoteWidget } from "@/components/common/VoteWidget";
import { CommentThread } from "@/components/common/CommentThread";
import { 
  Wrench, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  Loader2,
  MessageSquarePlus,
  CheckCircle2
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const serviceId = Number(resolvedParams.id);
  const { user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  const [service, setService] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review submission
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchService = async () => {
    try {
      const res = await api.get(`/services/${serviceId}`);
      setService(res.data);
    } catch (err) {
      setError(getErrorMessage(err, isBangla ? "সেবা প্রোফাইল লোড করতে ব্যর্থ হয়েছে।" : "Failed to load service profile."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBody.trim()) {
      toast.error(isBangla ? "অনুগ্রহ করে আপনার রিভিউ লিখুন।" : "Please write a review comment.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.post(`/services/${serviceId}/reviews`, {
        rating: reviewRating,
        comment: reviewBody,
      });

      toast.success(isBangla ? "রিভিউ সফলভাবে পোস্ট করা হয়েছে!" : "Review posted successfully!");
      setReviewBody("");
      setShowReviewForm(false);
      fetchService();
    } catch (err) {
      toast.error(getErrorMessage(err, isBangla ? "রিভিউ দাখিলে ব্যর্থ হয়েছে।" : "Failed to post review."));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={{ background: "var(--bg-background)" }}>
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold text-white mb-2">{isBangla ? "প্রোফাইল খুঁজে পাওয়া যায়নি" : "Service Not Found"}</h2>
          <p className="text-slate-400 mb-6">{error || (isBangla ? "অনুরোধকৃত সেবা প্রোফাইলটি নেই।" : "The requested service profile does not exist.")}</p>
          <Link href="/services" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm transition">
            ← {isBangla ? "সেবা তালিকায় ফিরে যান" : "Back to Services"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      {/* Hyper-Realistic Animated Civic Services Background */}
      <ServicesCinematicBackground />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10 space-y-8">
        {/* Top Back & ID */}
        <div className="flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Services Directory
          </Link>
          <span className="text-xs font-mono text-slate-400">
            PROVIDER_ID: #SRV_{service.id.toString().padStart(4, "0")}
          </span>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                {service.category}
              </span>

              {service.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" /> {service.trustBadge}
                </span>
              )}
            </div>

            <VoteWidget targetType="service" targetId={service.id} layout="horizontal" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {service.name}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{service.ratingAvg > 0 ? service.ratingAvg : "New"}</span>
              </div>
              <span className="text-xs text-slate-400">
                ({service.totalReviews} verified community review{service.totalReviews === 1 ? "" : "s"})
              </span>
            </div>
          </div>

          {/* Contact Direct Callout */}
          <div className="p-6 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Direct Phone</p>
                <a
                  href={`tel:${service.phone}`}
                  className="text-sm font-bold text-white hover:text-cyan-400 transition-colors"
                >
                  {service.phone || "Not provided"}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Service Coverage</p>
                <p className="text-sm font-bold text-white truncate">{service.location || service.divisionName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Email Contact</p>
                <p className="text-sm font-bold text-white truncate">{service.email || "Via phone"}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Services, Skills & Pricing Overview
            </h3>
            <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-sm sm:text-base text-slate-200 leading-relaxed font-light whitespace-pre-wrap">
              {service.details}
            </div>
          </div>
        </div>

        {/* Client Reviews Section */}
        <div className="rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Community Client Reviews ({service.reviews?.length || 0})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ratings on punctuality, fair pricing, workmanship quality, and professional behavior.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              {showReviewForm ? "Close Form" : "Write Review"}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleReviewSubmit}
              className="p-6 rounded-2xl bg-black/60 border border-cyan-500/40 space-y-4"
            >
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Service Rating (1 - 5 Stars) *
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
                  Review Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the work done, price charged, timeliness, tools brought, and if you would recommend them..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-y"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
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
          {service.reviews && service.reviews.length > 0 ? (
            <div className="space-y-4">
              {service.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {rev.author?.name || "Verified Citizen"}
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
                    Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-400 text-center py-6">
              No client reviews yet. Have you used this service? Leave the first review!
            </p>
          )}
        </div>

        {/* Universal Threaded Comments */}
        <CommentThread targetType="service" targetId={service.id} title="Service Discussion & Inquiries" />
      </main>
    </div>
  );
}
