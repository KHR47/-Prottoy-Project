"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { LostFoundType } from "@/types/lost-found";
import { LostFoundCinematicBackground } from "@/components/home/LostFoundCinematicBackground";
import { 
  PackageSearch, 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  Tag, 
  Phone, 
  Gift, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const categoriesEn = [
  "Wallets & IDs",
  "Phones & Electronics",
  "Keys & Access Cards",
  "Bags & Backpacks",
  "Documents & Certificates",
  "Jewelry & Watches",
  "Vehicles & Bicycles",
  "Pets & Animals",
  "Other Valuables",
];

const categoriesBn = [
  "মানিব্যাগ ও জাতীয় পরিচয়পত্র",
  "মোবাইল ও ইলেকট্রনিক্স",
  "চাবি ও অ্যাক্সেস কার্ড",
  "ব্যাগ ও লাগেজ",
  "ডকুমেন্ট ও সার্টিফিকেট",
  "জুয়েলারি ও ঘড়ি",
  "যানবাহন ও সাইকেল",
  "পোষা প্রাণী",
  "অন্যান্য মূল্যবান সামগ্রী",
];

const divisionsEn = [
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
  "ঢাকা",
  "চট্টগ্রাম",
  "সিলেট",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "রংপুর",
  "ময়মনসিংহ",
];

export default function NewLostFoundPage() {
  const router = useRouter();
  const { user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  const [type, setType] = useState<LostFoundType>("LOST");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categoriesEn[0]);
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [divisionName, setDivisionName] = useState("Dhaka");
  const [districtName, setDistrictName] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = isBangla ? categoriesBn : categoriesEn;
  const divisions = isBangla ? divisionsBn : divisionsEn;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected].slice(0, 6));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError(isBangla ? "শিরোনাম ও বিস্তারিত বিবরণ পূরণ করুন।" : "Please fill in title and description.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      if (contact) formData.append("contact", contact);
      if (location) formData.append("location", location);
      if (divisionName) formData.append("divisionName", divisionName);
      if (districtName) formData.append("districtName", districtName);
      if (rewardAmount) formData.append("rewardAmount", rewardAmount);

      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await api.post("/lost-found/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(isBangla ? "পোস্ট সফলভাবে দাখিল করা হয়েছে!" : "Lost & Found post created successfully!");
      router.push(`/lost-found/${res.data.id}`);
    } catch (err) {
      setError(getErrorMessage(err, isBangla ? "পোস্ট দাখিলে ব্যর্থ হয়েছে।" : "Failed to create post."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans pb-24 relative overflow-x-hidden" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Lost & Found Background */}
      <LostFoundCinematicBackground />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10">
        <div className="mb-8">
          <Link href="/lost-found" className="text-xs font-bold uppercase text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 mb-2">
            ← {isBangla ? "হারানো ও প্রাপ্তি তালিকায় ফিরে যান" : "Back to Lost & Found"}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {t.lostFound.formTitle}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            {isBangla ? "সঠিক তথ্য ও ছবি দিয়ে হারানো জিনিস পুনরুদ্ধার বা মালিকের কাছে পৌঁছে দিতে সহায়তা করুন।" : "Submit details and photos to report an item you lost or found."}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 mb-6 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div className="p-6 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {isBangla ? "পোস্টের ধরন *" : "Listing Category *"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("LOST")}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  type === "LOST"
                    ? "bg-rose-500/20 border-rose-500 text-white font-bold shadow-lg shadow-rose-500/10"
                    : "bg-black/50 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {isBangla ? "🚨 আমি কোনো কিছু হারিয়েছি" : "🚨 I Lost Something"}
              </button>

              <button
                type="button"
                onClick={() => setType("FOUND")}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  type === "FOUND"
                    ? "bg-teal-500/20 border-teal-500 text-white font-bold shadow-lg shadow-teal-500/10"
                    : "bg-black/50 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {isBangla ? "🎁 আমি একটি জিনিস পেয়েছি" : "🎁 I Found an Item"}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "জিনিসের নাম ও শিরোনাম *" : "Item Title *"}
              </label>
              <input
                type="text"
                required
                placeholder={isBangla ? "যেমন: ধানমন্ডি ২৭ এর কাছে এনআইডি কার্ডসহ কালো চামড়ার মানিব্যাগ" : "e.g. Black leather wallet with NID card near Dhanmondi 27"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "ক্যাটাগরি *" : "Category *"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "যোগাযোগের ফোন / ইমেইল" : "Contact Phone / Email"}
                </label>
                <input
                  type="text"
                  placeholder={isBangla ? "যেমন: ০১৭XXXXXXXX বা email@domain.com" : "e.g. 017XXXXXXXX or user@gmail.com"}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "বিভাগ *" : "Division *"}
                </label>
                <select
                  value={divisionName}
                  onChange={(e) => setDivisionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {divisions.map((d) => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "এলাকা / রাস্তার বিবরণ" : "Area / Street Location"}
                </label>
                <input
                  type="text"
                  placeholder={isBangla ? "যেমন: বনানী ১১, লেক ভিউ রোড" : "e.g. Banani 11, Lake View Rd"}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "পুরস্কার / ইনাম (৳ টাকা - ঐচ্ছিক)" : "Reward (৳ BDT - Optional)"}
                </label>
                <input
                  type="number"
                  placeholder={isBangla ? "যেমন: ১০০০" : "e.g. 1000"}
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "বিস্তারিত বিবরণ ও শনাক্তকরণ চিহ্ন *" : "Detailed Description & Identifiable Marks *"}
              </label>
              <textarea
                required
                rows={4}
                placeholder={isBangla ? "রঙ, ব্র্যান্ড, বিশেষ কোনো দাগ, স্টিকার বা জিনিসপত্রের তালিকা সংক্ষেপে লিখুন (গোপন পাসওয়ার্ড বা পিন কোড প্রকাশ করবেন না)..." : "Mention distinctive features (color, brand, serial fragments, stickers, contents without revealing full secret codes)..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-y"
              />
            </div>
          </div>

          {/* Image Uploads */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {isBangla ? "ফটোগ্রাফ সংযুক্ত করুন (সর্বোচ্চ ৬টি ছবি)" : "Attach Photographs (Up to 6 images)"}
            </label>
            <label className="border-2 border-dashed border-white/20 hover:border-amber-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 hover:bg-black/60">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <p className="text-xs font-bold text-white">
                {isBangla ? "ছবি আপলোড করতে ক্লিক করুন" : "Click to upload photos"}
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {files.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1 text-rose-400 hover:text-rose-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/lost-found"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
            >
              {isBangla ? "বাতিল" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {isBangla ? "প্রকাশ হচ্ছে..." : "Publishing..."}
                </>
              ) : (
                isBangla ? "পোস্ট প্রকাশ করুন" : "Publish Listing"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
