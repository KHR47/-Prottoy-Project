"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useOptionalAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { HousingCinematicBackground } from "@/components/home/HousingCinematicBackground";
import { 
  Building, 
  Upload, 
  X, 
  MapPin, 
  DollarSign, 
  Bed, 
  Phone, 
  FileText, 
  Loader2 
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

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

const rentTypesEn = ["Family / Bachelor", "Family Only", "Female Students Only", "Male Bachelor Only", "Commercial / Office"];
const rentTypesBn = ["ফ্যামিলি / ব্যাচেলর", "শুধুমাত্র ফ্যামিলি", "ছাত্রী / কর্মজীবী মহিলা", "ছাত্র / পুরুষ ব্যাচেলর", "বাণিজ্যিক / অফিস"];

export default function NewHousingPage() {
  const router = useRouter();
  const { user } = useOptionalAuth();
  const { t, isBangla } = useLanguage();

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [rent, setRent] = useState("");
  const [rooms, setRooms] = useState("2");
  const [rentType, setRentType] = useState(rentTypesEn[0]);
  const [divisionName, setDivisionName] = useState("Dhaka");
  const [districtName, setDistrictName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const divisions = isBangla ? divisionsBn : divisionsEn;
  const rentTypes = isBangla ? rentTypesBn : rentTypesEn;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected].slice(0, 8));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim() || !rent.trim()) {
      setError(isBangla ? "শিরোনাম, ঠিকানা এবং মাসিক ভাড়া আবশ্যক।" : "Please fill in title, address, and monthly rent.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("address", address);
      formData.append("description", description);
      formData.append("rent", rent);
      formData.append("rooms", rooms);
      formData.append("rentType", rentType);
      formData.append("divisionName", divisionName);
      if (districtName) formData.append("districtName", districtName);
      if (contactPhone) formData.append("contactPhone", contactPhone);

      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await api.post("/housing/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(isBangla ? "বাসার বিজ্ঞাপন সফলভাবে প্রকাশিত হয়েছে!" : "Housing listing created successfully!");
      router.push(`/housing/${res.data.id}`);
    } catch (err) {
      setError(getErrorMessage(err, isBangla ? "বিজ্ঞাপন প্রকাশে ব্যর্থ হয়েছে।" : "Failed to publish listing."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans pb-24 relative overflow-x-hidden" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Verified Housing Background */}
      <HousingCinematicBackground />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full flex-grow relative z-10">
        <div className="mb-8">
          <Link href="/housing" className="text-xs font-bold uppercase text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 mb-2">
            ← {isBangla ? "আবাসন তালিকায় ফিরে যান" : "Back to Housing Directory"}
          </Link>
          <span className="text-indigo-400 font-bold">
            {isBangla ? "নতুন বাসা বা ফ্ল্যাট ভাড়ার বিজ্ঞাপন" : "New Rental Listing"}
          </span>
        </div>

        {/* Header Card */}
        <div className="rounded-3xl bg-slate-950/80 p-8 border border-white/10 shadow-2xl backdrop-blur-2xl mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            {isBangla ? "নতুন বাসা বা ফ্ল্যাট ভাড়ার বিজ্ঞাপন দিন" : "Add a Rental Property Listing"}
          </h1>
          <p className="text-slate-300 text-sm mt-2 font-light">
            {isBangla 
              ? "সঠিক রুম সংখ্যা, ছবি ও ভাড়ার বিবরণ দিয়ে আপনার অ্যাপার্টমেন্ট বা কমার্শিয়াল স্পেসের বিজ্ঞাপন দিন।" 
              : "List apartments, flats, or commercial spaces with clear room specs and rent breakdown."}
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
                {isBangla ? "বিজ্ঞাপনের শিরোনাম *" : "Listing Title *"}
              </label>
              <input
                type="text"
                required
                placeholder={isBangla ? "যেমন: ধানমন্ডিতে ৩ বেডরুমের আলো-বাতাসপূর্ণ ফ্ল্যাট ভাড়া (জেনারেটর ও পার্কিং সহ)" : "e.g. Spacious 3-Bed Apartment with Balcony & Generator Backup in Dhanmondi"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "মাসিক ভাড়া (৳ টাকা) *" : "Monthly Rent (৳ BDT) *"}
                </label>
                <input
                  type="number"
                  required
                  placeholder="25000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "বেডরুম / রুম সংখ্যা *" : "Bedrooms / Rooms *"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "ভাড়াটিয়ার ধরন *" : "Tenant Policy *"}
                </label>
                <select
                  value={rentType}
                  onChange={(e) => setRentType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {rentTypes.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                  {isBangla ? "জেলা / এলাকা" : "District / Area"}
                </label>
                <input
                  type="text"
                  placeholder={isBangla ? "যেমন: উত্তরা সেক্টর ৪" : "e.g. Uttara Sector 4"}
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isBangla ? "বাড়িওয়ালা / যোগাযোগের নম্বর" : "Landlord / Contact Phone"}
                </label>
                <input
                  type="text"
                  placeholder="018XXXXXXXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "সম্পূর্ণ ঠিকানা *" : "Full Street Address *"}
              </label>
              <input
                type="text"
                required
                placeholder={isBangla ? "যেমন: বাড়ি ৪২, রোড ৭/এ, ধানমন্ডি, ঢাকা" : "e.g. House 42, Road 7/A, Dhanmondi, Dhaka"}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isBangla ? "বিস্তারিত বিবরণ ও সুবিধাসমূহ" : "Detailed Description & Features"}
              </label>
              <textarea
                rows={4}
                placeholder={isBangla ? "স্কয়ার ফিট, তলা, লিফট, পার্কিং স্লট, ওয়াসা পানির প্রাপ্যতা, গ্যাস/বিদ্যুৎ প্রিপেইড মিটার, সার্ভিস চার্জ..." : "Mention square footage, floor level, lift access, parking slot, WASA water pump status, prepaid gas/electricity meters, service charges..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>
          </div>

          {/* Image Uploads */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {isBangla ? "বাসার ছবি (সর্বোচ্চ ৮টি ছবি)" : "Property Photos (Up to 8 images)"}
            </label>
            <label className="border-2 border-dashed border-white/20 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 hover:bg-black/60">
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
              href="/housing"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
            >
              {isBangla ? "বাতিল" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {isBangla ? "প্রকাশ হচ্ছে..." : "Publishing..."}
                </>
              ) : (
                isBangla ? "বাসার বিজ্ঞাপন প্রকাশ করুন" : "Publish Rental Property"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
