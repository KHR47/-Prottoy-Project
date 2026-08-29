"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { GhushCinematicBackground } from "@/components/home/GhushCinematicBackground";
import { 
  ShieldAlert, 
  Lock, 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Banknote, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Loader2,
  EyeOff,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const departmentsEn = [
  "Land & Registration",
  "Traffic & Transport Police",
  "Passport & Immigration",
  "Municipal Corporation",
  "Tax, Customs & VAT",
  "Law Enforcement",
  "Utility Boards (DESCO/WASA/Titas)",
  "Health & Hospitals",
  "Education & Licensing",
  "Public Works & Tenders",
  "Other Government Office",
];

const departmentsBn = [
  "ভূমি ও রেজিস্ট্রি অফিস",
  "ট্রাফিক ও পরিবহন পুলিশ",
  "পাসপোর্ট ও ইমিগ্রেশন",
  "সিটি কর্পোরেশন / পৌরসভা",
  "কর, শুল্ক ও ভ্যাট",
  "আইন প্রয়োগকারী সংস্থা",
  "বিদ্যুৎ/পানি/গ্যাস বোর্ড (DESCO/WASA/Titas)",
  "স্বাস্থ্য ও সরকারি হাসপাতাল",
  "শিক্ষা ও লাইসেন্সিং",
  "গণপূর্ত ও টেন্ডার",
  "অন্যান্য সরকারি দপ্তর",
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

export default function NewGhushReportPage() {
  const router = useRouter();
  const { user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState(departmentsEn[0]);
  const [amountInvolved, setAmountInvolved] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [location, setLocation] = useState("");
  const [divisionName, setDivisionName] = useState("Dhaka");
  const [districtName, setDistrictName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const departments = isBangla ? departmentsBn : departmentsEn;
  const divisions = isBangla ? divisionsBn : divisionsEn;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected].slice(0, 10)); // Max 10 files
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError(isBangla ? "শিরোনাম ও ঘটনার বিবরণ অবশ্যই পূরণ করুন।" : "Please fill in both the title and incident details.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isAnonymous", String(isAnonymous));
      formData.append("department", department);
      if (amountInvolved) formData.append("amountInvolved", amountInvolved);
      if (incidentDate) formData.append("incidentDate", incidentDate);
      if (location) formData.append("location", location);
      if (divisionName) formData.append("divisionName", divisionName);
      if (districtName) formData.append("districtName", districtName);

      files.forEach((file) => {
        formData.append("evidence", file);
      });

      const res = await api.post("/ghush-reports/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(isBangla ? "ঘুষের তথ্য নিরাপদে দাখিল করা হয়েছে।" : "Ghush report submitted securely.");
      router.push(`/ghush-reports/${res.data.id}`);
    } catch (err) {
      setError(getErrorMessage(err, isBangla ? "অভিযোগ দাখিলে ব্যর্থ হয়েছে।" : "Failed to submit corruption report."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans pb-24 relative overflow-x-hidden">
      {/* Hyper-Realistic Animated ACC Raid Background */}
      <GhushCinematicBackground />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/ghush-reports" className="hover:text-white">
            {t.nav.ghush}
          </Link>
          <span>/</span>
          <span className="text-rose-400 font-bold">
            {isBangla ? "নতুন দুর্নীতির অভিযোগ দাখিল" : "New Whistleblower Claim"}
          </span>
        </div>

        {/* Header card */}
        <div className="rounded-3xl bg-slate-950/80 p-8 border border-white/10 shadow-2xl backdrop-blur-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold uppercase tracking-widest mb-3 border border-rose-500/40">
            <Lock className="w-3.5 h-3.5" /> {isBangla ? "এনক্রিপ্টকৃত ও সম্পূর্ণ সুরক্ষিত" : "Encrypted & Protected"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.ghush.submitDossier}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-light mt-2 leading-relaxed">
            {isBangla 
              ? "ঘটনার বিস্তারিত বিবরণ দিন এবং প্রমাণাদি (ছবি, অডিও, ব্যাংক রসিদ বা স্লিপ) সংযুক্ত করুন। আপনার পরিচয় ১০০% গোপন রাখা সম্ভব।" 
              : "Provide details of the incident and upload any evidentiary proof (photos, audio files, receipts, bank records). Your identity can remain 100% anonymous."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Anonymity Switcher */}
          <div className="p-6 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {isBangla ? "হুইসেলব্লোয়ার গোপনীয়তা বিকল্প" : "Whistleblower Privacy Option"}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  isAnonymous
                    ? "bg-rose-500/20 border-rose-500/60 shadow-lg shadow-rose-500/10"
                    : "bg-black/50 border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${isAnonymous ? "bg-rose-600 text-white" : "bg-white/10 text-slate-400"}`}>
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {isBangla ? "সম্পূর্ণ বেনামে দাখিল করুন (প্রস্তাবিত)" : "Submit Anonymously (Recommended)"}
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5 font-light">
                    {isBangla 
                      ? "আপনার নাম ও পরিচয় সাধারণ নাগরিক ও তালিকা থেকে ১০০% আড়াল থাকবে।" 
                      : "Your name and identity are completely hidden from public listings and reports."}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  !isAnonymous
                    ? "bg-teal-500/20 border-teal-500/60 shadow-lg shadow-teal-500/10"
                    : "bg-black/50 border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${!isAnonymous ? "bg-teal-600 text-white" : "bg-white/10 text-slate-400"}`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {isBangla ? "যাচাইকৃত নাগরিক হিসেবে দাখিল করুন" : "Submit as Verified Citizen"}
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5 font-light">
                    {isBangla 
                      ? "বিশ্বস্ত হুইসেলব্লোয়ার ব্যাজের জন্য আপনার নাগরিক অ্যাকাউন্ট লিঙ্ক করুন।" 
                      : "Link your citizen profile to this report for verified whistleblower credentials."}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Incident Details */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white">
              {isBangla ? "ঘুষ / দুর্নীতির বিবরণ" : "Incident Information"}
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "অভিযোগের শিরোনাম *" : "Incident Title *"}
              </label>
              <input
                type="text"
                required
                placeholder={isBangla ? "যেমন: রাজউকে ভবন নকশা অনুমোদনের জন্য ২০,০০০ টাকা ঘুষ দাবি" : "e.g. ৳ 20,000 bribe demanded for building plan approval at RAJUK"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Department & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "সরকারি দপ্তর / প্রতিষ্ঠান *" : "Department / Organization *"}
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "দাবিকৃত ঘুষের পরিমাণ (৳ টাকা)" : "Bribe Amount Demanded (৳ BDT)"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    placeholder="50000"
                    value={amountInvolved}
                    onChange={(e) => setAmountInvolved(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Location & Division */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "বিভাগ *" : "Division *"}
                </label>
                <select
                  value={divisionName}
                  onChange={(e) => setDivisionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  {divisions.map((div) => (
                    <option key={div} value={div} className="bg-slate-900 text-white">
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "জেলা / থানা" : "District / Upazila"}
                </label>
                <input
                  type="text"
                  placeholder={isBangla ? "যেমন: ধানমন্ডি, ঢাকা" : "e.g. Dhanmondi, Dhaka"}
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "ঘটনার তারিখ" : "Incident Date"}
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Exact Location details */}
            <div>
              <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "নির্দিষ্ট অবস্থান / অফিস রুম / কাউন্টার" : "Specific Location / Office / Room / Counter"}
              </label>
              <input
                type="text"
                placeholder={isBangla ? "যেমন: রুম ৩০৪, ভূমি উপ-রেজিস্ট্রি অফিস, তেজগাঁও" : "e.g. Room 304, Land Sub-Registry Office, Tejgaon"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "ঘটনার ক্রমানুসারে পূর্ণাঙ্গ বিবরণ *" : "Detailed Account of the Incident *"}
              </label>
              <textarea
                required
                rows={5}
                placeholder={isBangla 
                  ? "কি সেবা চেয়েছিলেন, কর্মকর্তা বা দালাল কি বলেছিল, কত টাকা ও কিভাবে দাবি করা হয়েছে, নাম বা পদবী জানা থাকলে তা উল্লেখ করুন..." 
                  : "Describe what happened chronologically: what service was requested, what the official or intermediary said, how the money was asked, names or designations if known..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Evidence Attachments */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {isBangla ? "প্রমাণাদি ও নথিপত্র (ঐচ্ছিক তবে অত্যন্ত গুরুত্বপূর্ণ)" : "Evidentiary Files (Optional but Recommended)"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-light">
                {isBangla 
                  ? "রসিদ, ব্যাংক স্লিপ, অডিও রেকর্ডিং, ছবি বা পিডিএফ প্রমাণাদি যুক্ত করুন (সর্বোচ্চ ১০টি ফাইল, প্রতি ফাইল ৫ মেগাবাইট)।" 
                  : "Attach photos of documents, receipts, bank slips, audio recordings, or PDF proof. (Max 10 files, 5MB each)."}
              </p>
            </div>

            {/* Dropzone */}
            <label className="border-2 border-dashed border-white/20 hover:border-rose-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 hover:bg-black/60">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-white">
                {isBangla ? "ফাইল আপলোড করতে ক্লিক করুন বা টেনে এনে ড্রপ করুন" : "Click to upload or drag & drop files"}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                PNG, JPG, PDF, DOC, DOCX
              </p>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-white/15 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate text-white font-semibold">{file.name}</span>
                      <span className="text-slate-400 shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/ghush-reports"
              className="px-6 py-3.5 rounded-xl border border-[var(--border)] text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
            >
              {isBangla ? "বাতিল" : "Cancel"}
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {isBangla ? "এনক্রিপ্ট করে দাখিল হচ্ছে..." : "Submitting Encrypted Report..."}
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" /> {isBangla ? "দুর্নীতির অভিযোগ দাখিল করুন" : "Submit Ghush Report"}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
