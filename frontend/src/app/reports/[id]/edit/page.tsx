"use client";

import { useParams, useRouter } from "next/navigation";
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

export default function EditReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
  const [isReady, setIsReady] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const categoriesResponse = await api.get("/categories");
        setCategories(categoriesResponse.data);

        const res = await api.get(`/reports/${params.id}`);
        const data = res.data;

        if (data.status !== "submitted" && !data.updateAllowed) {
          router.push(`/reports/${params.id}`);
          return;
        }

        setTitle(data.title);
        setDescription(data.description);
        setType(data.type);
        setLocation(data.location);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setDivisionName(data.divisionName || "");
        setDistrictName(data.districtName || "");
        setUpazilaName(data.upazilaName || "");
        setCategoryId(data.category?.id?.toString() || "");

        setIsReady(true);
      } catch (err) {
        setError("Could not load report or required data.");
      }
    }
    loadData();
  }, [params.id, router]);

  const filteredCategories = categories.filter(
    (category) => category.type === type,
  );

  async function handleMapClick(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
    setIsAutofilling(true);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      
      if (data && data.display_name) {
        setLocation(data.display_name);
        
        if (data.address) {
          const addr = data.address || {};
          let searchDiv = "";
          let searchDist = "";
          let searchUpz = "";

          // Smart parsing from display_name
          if (data.display_name) {
            const parts = data.display_name.split(",").map((p: string) => p.trim());
            for (const part of parts) {
              if (part.toLowerCase().includes("division")) searchDiv = part;
              else if (part.toLowerCase().includes("district")) searchDist = part;
              else if (part.toLowerCase().includes("upazila") || part.toLowerCase().includes("thana")) searchUpz = part;
            }
          }

          // Fallback to OSM address properties
          if (!searchDiv) searchDiv = addr.state || addr.region || "";
          if (!searchDist) searchDist = addr.state_district || addr.city || "";
          if (!searchUpz) {
            // Check if county is actually an upazila (common in BD)
            if (addr.county && !addr.county.toLowerCase().includes("district")) {
              searchUpz = addr.county;
            } else {
              searchUpz = addr.suburb || addr.city_district || addr.town || addr.neighbourhood || addr.village || "";
            }
          }
          
          setDivisionName(searchDiv);
          setDistrictName(searchDist);
          setUpazilaName(searchUpz);
        } else {
          setDivisionName("");
          setDistrictName("");
          setUpazilaName("");
        }
      }
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
    } finally {
      setIsAutofilling(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Bangladesh')}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        handleMapClick(lat, lon);
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!divisionName || !districtName) {
      setError("Please click on the map to set a valid location containing at least a District and Division.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.patch(`/reports/${params.id}`, {
        title,
        description,
        type,
        location,
        divisionName,
        districtName,
        upazilaName,
        categoryId: Number(categoryId),
        latitude,
        longitude,
      });

      // Upload new files if any
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          try {
            await api.post(`/reports/${params.id}/documents`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (uploadError) {
            console.error("Failed to upload document:", uploadError);
          }
        }
      }

      setSuccess("Your report has been updated securely.");
      setTimeout(() => {
        router.push(`/reports/${params.id}`);
      }, 1500);

    } catch (error: unknown) {
      setError(getErrorMessage(error, "Report update failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 shadow-sm ring-1 ring-teal-600/10 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Citizen Intake Portal
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Edit Report
            </h1>
            <p className="mt-2 text-slate-500 text-lg max-w-xl">
              Update the details of your report below.
            </p>
          </div>
          <Link
            href="/reports/my"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:shadow-md hover:ring-slate-300"
          >
            View My Reports <ChevronRight className="h-4 w-4 opacity-50" />
          </Link>
        </motion.div>

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
                <h2 className="text-xl font-bold text-slate-900">What happened?</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Report Type
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
                        {item === "civic" ? "Civic Issue" : "Safety / Crime"}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Issue Category
                  </span>
                  <select
                    className={fieldClass}
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    required
                  >
                    <option value="" disabled>Select the type of problem...</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Short Title
                  </span>
                  <input
                    placeholder="e.g. Broken street light on Main St."
                    className={fieldClass}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Detailed Description
                  </span>
                  <textarea
                    placeholder="Describe the issue in detail. If possible, mention specific landmarks or conditions..."
                    className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-950 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400 hover:border-slate-300 shadow-sm"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                  />
                </label>

                <div className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Add More Attachments (Photos, PDFs)
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
                      <span className="font-bold text-slate-700">Click to upload files</span>
                      <span className="text-xs text-slate-500">Maximum size 5MB per file</span>
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
                  <h2 className="text-xl font-bold text-slate-900">Where is it?</h2>
                  {isAutofilling && (
                    <span className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Auto-filling...
                    </span>
                  )}
                </div>
                
                <div className="flex max-w-sm w-full gap-2 relative z-10">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search location..."
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
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
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
                      Click anywhere on the map to automatically fill your location
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 mt-2">
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Division</span>
                      <div className="text-sm font-semibold text-slate-900">{divisionName || "—"}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">District</span>
                      <div className="text-sm font-semibold text-slate-900">{districtName || "—"}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thana / Upazila</span>
                      <div className="text-sm font-semibold text-slate-900">
                        {upazilaName || "—"}
                      </div>
                    </div>
                  </div>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Exact Address / Street</span>
                    <input
                      placeholder="e.g. 123 Main Street, near the central park..."
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
                    Privacy Options
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-lg">
                    If enabled, your name will be hidden from the public and assigned officers. The system will still record your identity for audit purposes.
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
                  <span className="ml-3 text-sm font-semibold text-slate-700">Submit Anonymously</span>
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
                    <Loader2 className="h-5 w-5 animate-spin" /> Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 relative z-10">
                    Update Report <Send className="h-4 w-4" />
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
                <h3 className="text-lg font-black text-slate-900">Reporting Guide</h3>
              </div>
              
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 ring-4 ring-white shadow-sm mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Be specific</h4>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      Provide a clear title and detailed description. Mention landmarks to help officers locate the issue faster.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-white shadow-sm mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Use the map</h4>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      Clicking on the map is the fastest way to report. It automatically fetches the correct administrative zones for you.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-white shadow-sm mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Track progress</h4>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      Once submitted, you&apos;ll be able to see status updates and comments from the assigned officers in real-time.
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
                  <h3 className="font-bold text-white">Emergency?</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    If this is a life-threatening emergency or a crime currently in progress, please call <span className="font-black text-white">999</span> immediately.
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
