"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Category, ReportType, Division, District, Upazila, Thana } from "@/types/report";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Send, 
  Loader2,
  ChevronRight,
  Info,
  Paperclip,
  X,
  Search
} from "lucide-react";

const MapPicker = dynamic(() => import("@/components/reports/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-100/50 rounded-2xl animate-pulse flex items-center justify-center border-2 border-dashed border-slate-200">
      <div className="flex items-center gap-2 text-slate-400 font-medium">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading Map...
      </div>
    </div>
  ),
});

const fieldClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-950 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400 hover:border-slate-300 shadow-sm";

import { ReportsCinematicBackground } from "@/components/home/ReportsCinematicBackground";
import { useLanguage } from "@/context/LanguageContext";
import { getUser } from "@/lib/auth";

export default function NewReportPage() {
  const { t, isBangla } = useLanguage();
  const currentUser = getUser();
  const isAuthorityOrOfficer = currentUser?.role === "authority" || currentUser?.role === "officer";
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ReportType>("civic");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();

  const [divisionName, setDivisionName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [upazilaName, setUpazilaName] = useState("");
  
  const [categoryId, setCategoryId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get("/categories");
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(
    (category) => category.type === type,
  );

  async function handleMapClick(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
    setIsAutofilling(true);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      
      if (data && data.address) {
        const addr = data.address;
        const autoLocation = [
          addr.road,
          addr.suburb || addr.neighbourhood || addr.residential,
          addr.city || addr.town || addr.village
        ].filter(Boolean).join(", ");

        if (autoLocation) setLocation(autoLocation);
        if (addr.state) setDivisionName(addr.state.replace(" Division", ""));
        if (addr.state_district || addr.county || addr.city) {
          setDistrictName((addr.state_district || addr.county || addr.city).replace(" District", ""));
        }
        if (addr.suburb || addr.neighbourhood) {
          setUpazilaName(addr.suburb || addr.neighbourhood);
        }
      }
    } catch (err) {
      console.error("Reverse geocode failed:", err);
    } finally {
      setIsAutofilling(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Bangladesh")}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        handleMapClick(lat, lon);
      } else {
        setError(isBangla ? "কোন লোকেশন খুঁজে পাওয়া যায়নি。" : "Location not found in Bangladesh.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError(isBangla ? "লোকেশন সার্চ ব্যর্থ হয়েছে。" : "Failed to search location.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        type,
        location,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        divisionName: divisionName || undefined,
        districtName: districtName || undefined,
        upazilaName: upazilaName || undefined,
        categoryId: Number(categoryId),
        isAnonymous,
      };

      const response = await api.post("/reports", payload);
      const reportId = response.data.id;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        await api.post(`/reports/${reportId}/attachments`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setTitle("");
      setDescription("");
      setLocation("");
      setCategoryId("");
      setFiles([]);
      setLatitude(undefined);
      setLongitude(undefined);
      setDivisionName("");
      setDistrictName("");
      setUpazilaName("");
      setSuccess(isBangla ? "আপনার রিপোর্ট সফলভাবে দাখিল করা হয়েছে এবং পর্যালোচনার জন্য জমা হয়েছে。" : "Your report has been submitted securely and is now under review.");
    } catch (error: unknown) {
      setError(getErrorMessage(error, isBangla ? "রিপোর্ট দাখিলে ব্যর্থ হয়েছে。" : "Report submission failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Crime & Civic Grid Background */}
      <ReportsCinematicBackground />

      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              {isBangla ? "নাগরিক রিপোর্ট গ্রহণ পোর্টাল" : "Citizen Intake Portal"}
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              {t.reports.formTitle}
            </h1>
            <p className="mt-2 text-slate-300 text-lg max-w-xl">
              {t.reports.formDesc}
            </p>
          </div>
          <Link
            href="/reports/my"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900/80 border border-white/10 px-6 py-2.5 text-sm font-bold text-slate-200 shadow-sm transition-all hover:bg-slate-800"
          >
            {isBangla ? "আমার রিপোর্ট দেখুন" : "View My Reports"} <ChevronRight className="h-4 w-4 opacity-50" />
          </Link>
        </motion.div>

        {isAuthorityOrOfficer && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">
                  {isBangla ? "অথরিটি / অফিসার একাউন্ট সনাক্ত হয়েছে" : "Authority / Officer Role Active"}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isBangla 
                    ? "অথরিটি একাউন্টসমূহ রিপোর্ট ট্রায়াজ, অনুমোদন ও অফিসার নিয়োগ পরিচালনার জন্য নিবেদিত। সাধারণ নাগরিক হিসেবে দাখিল করার জন্য নাগরিক একাউন্ট ব্যবহার করুন।"
                    : "Authority accounts oversee triage, officer dispatch, and resolution approvals. Report submission is reserved for verified citizens."}
                </p>
              </div>
            </div>
            <Link
              href="/authority/reports"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shrink-0 transition-all shadow-md shadow-amber-500/20"
            >
              {isBangla ? "অথরিটি ট্রায়াজে যান" : "Go to Authority Triage"}
            </Link>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_24rem] items-start">
          {/* Main Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-8"
          >
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
                <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
            
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-900 shadow-sm">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-teal-600" />
                <p className="text-sm font-medium">{success}</p>
              </motion.div>
            )}

            {/* SECTION 1: Issue Details */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-400 to-emerald-600 rounded-l-3xl"></div>
              
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isBangla ? "ঘটনা বা সমস্যার বিবরণ" : "What happened?"}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {isBangla ? "রিপোর্টের ধরন *" : "Report Type *"}
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2 p-1.5 bg-slate-100/50 rounded-2xl">
                    {(["civic", "crime"] as ReportType[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setType(item);
                          setCategoryId("");
                        }}
                        className={`relative rounded-xl px-4 py-3 text-sm font-bold capitalize transition-all duration-200 ${
                          type === item
                            ? "bg-white text-teal-700 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                        }`}
                      >
                        {item === "civic" 
                          ? (isBangla ? "নাগরিক সমস্যা (Civic)" : "Civic Issue") 
                          : (isBangla ? "নিরাপত্তা ও অপরাধ (Crime)" : "Safety / Crime")}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.reports.categoryLabel} *
                  </span>
                  <select
                    className={fieldClass}
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    required
                  >
                    <option value="" disabled>{isBangla ? "সমস্যার ক্যাটাগরি নির্বাচন করুন..." : "Select the type of problem..."}</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.reports.titleLabel} *
                  </span>
                  <input
                    placeholder={isBangla ? "যেমন: মেইন রোডে ভাঙা সড়ক বাতি ও গর্ত" : "e.g. Broken street light on Main St."}
                    className={fieldClass}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.reports.descLabel} *
                  </span>
                  <textarea
                    placeholder={isBangla ? "সমস্যাটির বিস্তারিত বিবরণ লিখুন। আশপাশের চেনার মতো স্থান বা ল্যান্ডমার্ক উল্লেখ করুন..." : "Describe the issue in detail. If possible, mention specific landmarks or conditions..."}
                    className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-950 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400 hover:border-slate-300 shadow-sm"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                  />
                </label>

                <div className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.reports.uploadLabel}
                  </span>
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-all hover:bg-slate-100 hover:border-teal-300">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                        }
                      }}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mb-2">
                        <Paperclip className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-slate-700">
                        {isBangla ? "ফাইল আপলোড করতে ক্লিক করুন" : "Click to upload files"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {isBangla ? "প্রতি ফাইলের সর্বোচ্চ সাইজ ৫ মেগাবাইট" : "Maximum size 5MB per file"}
                      </span>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
                          <span className="truncate max-w-[200px] font-medium text-slate-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Location Details */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-indigo-600 rounded-l-3xl"></div>
              
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {isBangla ? "ঘটনাস্থলের অবস্থান" : "Where is it?"}
                  </h2>
                  {isAutofilling && (
                    <span className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {isBangla ? "স্বয়ংক্রিয় পূরণ হচ্ছে..." : "Auto-filling..."}
                    </span>
                  )}
                </div>
                
                <div className="flex max-w-sm w-full gap-2 relative z-10">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={isBangla ? "লোকেশন সার্চ করুন..." : "Search location..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch(e as any);
                        }
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                  </div>
                  <Button type="button" onClick={handleSearch as any} disabled={isSearching} className="h-10 shrink-0">
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : (isBangla ? "অনুসন্ধান" : "Search")}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="relative rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-inner group/map">
                  <MapPicker
                    latitude={latitude}
                    longitude={longitude}
                    onChange={handleMapClick}
                  />
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-[1000] flex justify-center">
                    <div className="bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-400" />
                      {isBangla ? "মানচিত্রের যে কোন স্থানে ক্লিক করে অবস্থান নির্ধারণ করুন" : "Click anywhere on the map to automatically fill your location"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 mt-2">
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {isBangla ? "বিভাগ" : "Division"}
                      </span>
                      <div className="text-sm font-semibold text-slate-900">{divisionName || "—"}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {isBangla ? "জেলা" : "District"}
                      </span>
                      <div className="text-sm font-semibold text-slate-900">{districtName || "—"}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {isBangla ? "থানা / উপজেলা" : "Thana / Upazila"}
                      </span>
                      <div className="text-sm font-semibold text-slate-900">
                        {upazilaName || "—"}
                      </div>
                    </div>
                  </div>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      {t.reports.locationLabel} *
                    </span>
                    <input
                      placeholder={isBangla ? "যেমন: হাউজ ১২, রোড ৪, ব্লক সি, বনানী, ঢাকা" : "e.g. 123 Main Street, near the central park..."}
                      className={fieldClass}
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 3: Privacy */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-400 to-fuchsia-600 rounded-l-3xl"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {isBangla ? "গোপনীয়তা সেটিংস" : "Privacy Options"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-lg">
                    {isBangla 
                      ? "এটি চালু রাখলে আপনার নাম সাধারণ নাগরিক ও তদন্তকারী অফিসারের কাছ থেকে গোপন থাকবে।" 
                      : "If enabled, your name will be hidden from the public and assigned officers."}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isAnonymous} 
                    onChange={(e) => setIsAnonymous(e.target.checked)} 
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600"></div>
                  <span className="ml-3 text-sm font-semibold text-slate-700">
                    {isBangla ? "বেনামে রিপোর্ট করুন" : "Submit Anonymously"}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
              <Button 
                type="submit" 
                className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl shadow-lg shadow-teal-500/20 group relative overflow-hidden"
                disabled={isSubmitting}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> {isBangla ? "দাখিল হচ্ছে..." : "Submitting..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 relative z-10">
                    {t.reports.submitBtn} <Send className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </motion.form>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-6 hidden lg:flex flex-col gap-6"
          >
            {/* Guide Card */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/50">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <Info className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {isBangla ? "রিপোর্ট গাইডলাইন" : "Reporting Guide"}
                </h3>
              </div>
              
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 ring-4 ring-white shadow-sm mt-0.5">
                    ১
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isBangla ? "স্পষ্ট বিবরণ দিন" : "Be specific"}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {isBangla 
                        ? "স্পষ্ট শিরোনাম ও বিস্তারিত বিবরণ দিন যাতে অফিসাররা দ্রুত সমস্যা শনাক্ত করতে পারেন।" 
                        : "Provide a clear title and detailed description. Mention landmarks to help officers locate the issue faster."}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-white shadow-sm mt-0.5">
                    ২
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isBangla ? "মানচিত্র ব্যবহার করুন" : "Use the map"}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {isBangla 
                        ? "মানচিত্রে ক্লিক করলে স্বয়ংক্রিয়ভাবে বিভাগ, জেলা ও থানা নির্ধারিত হয়ে যায়।" 
                        : "Clicking on the map is the fastest way to report. It automatically fetches the correct administrative zones for you."}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-white shadow-sm mt-0.5">
                    ৩
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isBangla ? "অগ্রগতি ট্র্যাক করুন" : "Track progress"}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {isBangla 
                        ? "রিপোর্ট জমা দেওয়ার পর 'আমার রিপোর্ট' থেকে লাইভ অগ্রগতি ও অফিসারের মন্তব্য দেখতে পাবেন।" 
                        : "Once submitted, you'll be able to see status updates and comments from the assigned officers in real-time."}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Emergency Card */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-500/20 blur-2xl"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="rounded-xl bg-red-500/20 p-2 text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    {isBangla ? "জরুরি প্রয়োজন?" : "Emergency?"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {isBangla 
                      ? "জীবন-হুমকিপূর্ণ জরুরি অবস্থা বা চলমান কোনো অপরাধের জন্য অবিলম্বে ৯৯৯ এ কল করুন।" 
                      : "If this is a life-threatening emergency or a crime currently in progress, please call 999 immediately."}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  );
}
