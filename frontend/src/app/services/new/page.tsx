"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { ServicesCinematicBackground } from "@/components/home/ServicesCinematicBackground";
import { 
  Wrench, 
  Upload, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  FileText, 
  Loader2 
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const categoriesEn = [
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
  "ইলেকট্রিশিয়ান ও ওয়্যারিং",
  "প্লাম্বিং ও ড্রেনেজ সার্ভিস",
  "এসি ও ফ্রিজ মেরামত",
  "ক্লিনিং ও পেস্ট কন্ট্রোল",
  "আইটি ও কম্পিউটার সাপোর্ট",
  "জরুরি অ্যাম্বুলেন্স সেবা",
  "কার্পেন্টার ও রাজমিস্ত্রি",
  "গাড়ি ও বাইক মেকানিক",
  "অন্যান্য স্থানীয় সেবা",
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

export default function NewServicePage() {
  const router = useRouter();
  const { user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoriesEn[0]);
  const [details, setDetails] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [divisionName, setDivisionName] = useState("Dhaka");
  const [districtName, setDistrictName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = isBangla ? categoriesBn : categoriesEn;
  const divisions = isBangla ? divisionsBn : divisionsEn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !details.trim() || !phone.trim()) {
      setError(isBangla ? "কারিগর/প্রতিষ্ঠানের নাম, বিবরণ ও ফোন নম্বর পূরণ করুন।" : "Please fill in trade provider name, details, and phone number.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await api.post("/services/new", {
        name,
        category,
        details,
        phone,
        email: email || undefined,
        location: location || undefined,
        divisionName,
        districtName: districtName || undefined,
      });

      toast.success(isBangla ? "কারিগর প্রোফাইল সফলভাবে নিবন্ধিত হয়েছে!" : "Service profile registered in directory!");
      router.push(`/services/${res.data.id}`);
    } catch (err) {
      setError(getErrorMessage(err, isBangla ? "কারিগর প্রোফাইল প্রকাশে ব্যর্থ হয়েছে।" : "Failed to register service."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans pb-24 relative overflow-x-hidden" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Services Background */}
      <ServicesCinematicBackground />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/services" className="text-xs font-bold uppercase text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mb-2">
            ← {isBangla ? "সেবা ও কারিগর তালিকায় ফিরে যান" : "Back to Services Directory"}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {isBangla ? "নতুন সেবা প্রোফাইল যোগ করুন" : "Register a Local Trade or Service"}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            {isBangla ? "আপনার বিশ্বস্ত সেবা বা কারিগরি দক্ষতা স্থানীয় নাগরিকদের সাথে শেয়ার করুন।" : "Register your local trade, emergency services, or skilled repair profile."}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 mb-6 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "ব্যবসা প্রতিষ্ঠান / টেকনিশিয়ানের নাম *" : "Business / Technician Name *"}
              </label>
              <input
                type="text"
                required
                placeholder={isBangla ? "যেমন: মাস্টার ইলেকট্রিশিয়ান ও এসি সার্ভিসিং পয়েন্ট" : "e.g. Master Electrician & AC Servicing Center"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "সেবা বা ট্রেড ক্যাটাগরি *" : "Trade Category *"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                  {isBangla ? "যোগাযোগের ফোন নম্বর *" : "Phone Number *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                  {isBangla ? "কার্য এলাকা / ওয়ার্ড" : "Operating Area / Ward"}
                </label>
                <input
                  type="text"
                  placeholder={isBangla ? "যেমন: মিরপুর ১০, পল্লবী" : "e.g. Mirpur 10, Pallabi"}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "ইমেইল (ঐচ্ছিক)" : "Email (Optional)"}
                </label>
                <input
                  type="email"
                  placeholder="contact@trade.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "প্রদত্ত সেবা ও দক্ষতার বিবরণ *" : "Services Offered & Experience Details *"}
              </label>
              <textarea
                required
                rows={4}
                placeholder={isBangla ? "আপনার বিশেষায়িত সেবা (যেমন: জরুরি ওয়্যারিং, ডিবি বোর্ড ফিটিং, মোটর রিওয়াইন্ডিং, পাইপ লিকেজ সমাধান, হোম ভিজিট ইত্যাদি) উল্লেখ করুন..." : "Detail your specializations (e.g. emergency wiring, DB board fitting, motor rewiring, pipe leak detection, home visits, warranty)..."}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-y"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/services"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
            >
              {isBangla ? "বাতিল" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {isBangla ? "নিবন্ধন হচ্ছে..." : "Registering..."}
                </>
              ) : (
                isBangla ? "সেবা প্রোফাইল প্রকাশ করুন" : "Publish Service Profile"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
