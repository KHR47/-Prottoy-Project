"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Car, Plus, Trash2, Loader2, Bike, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TYPE_ICONS: Record<string, any> = { car: Car, bike: Bike, ev: Zap, truck: Car };

const EMPTY_FORM = { plateNumber: "", type: "car", brand: "", model: "", color: "" };

export default function VehiclesPage() {
  const { t, isBangla } = useLanguage();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get("/parking/my-vehicles").then(r => setVehicles(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!form.plateNumber) return;
    setSubmitting(true);
    try {
      await api.post("/parking/vehicles", form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || (isBangla ? "যানবাহন যোগ করতে ব্যর্থ হয়েছে" : "Failed to add vehicle"));
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isBangla ? "আপনি কি নিশ্চিতভাবে এই যানটি মুছে ফেলতে চান?" : "Remove this vehicle?")) return;
    try { await api.delete(`/parking/vehicles/${id}`); load(); }
    catch (e: any) { alert(e?.response?.data?.message || (isBangla ? "ত্রুটি হয়েছে" : "Error")); }
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">{t.parking.manageVehicles}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {isBangla ? "দ্রুত স্বয়ংক্রিয় পার্কিং ও আরএফআইডি গেটের জন্য আপনার যানবাহন যুক্ত করুন।" : "Manage registered vehicles and RFID tags for smart parking."}
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 px-5 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-teal-600/30"
          >
            <Plus className="h-4 w-4" />
            {showForm ? (isBangla ? "বন্ধ করুন" : "Close Form") : (isBangla ? "নতুন যানবাহন যোগ করুন" : "Add Vehicle")}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAdd} className="mb-8 rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">
              {isBangla ? "নতুন গাড়ির বিবরণ" : "Add New Vehicle Details"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">
                  {isBangla ? "লাইসেন্স প্লেট নম্বর *" : "License Plate *"}
                </label>
                <input 
                  type="text" 
                  placeholder={isBangla ? "যেমন: ঢাকা মেট্রো-গ ১১-২২৩৩" : "e.g. DHAKA-METRO-GA-11-2233"}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  value={form.plateNumber} 
                  onChange={e => setForm({ ...form, plateNumber: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">
                  {isBangla ? "যানবাহনের ধরন" : "Vehicle Type"}
                </label>
                <select 
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  value={form.type} 
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="car">{isBangla ? "কার / প্রাইভেট কার" : "Car"}</option>
                  <option value="bike">{isBangla ? "মোটরসাইকেল / স্কুটার" : "Motorbike"}</option>
                  <option value="ev">{isBangla ? "ইলেকট্রিক ভেহিকল (EV)" : "Electric Vehicle (EV)"}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">
                  {isBangla ? "ব্র্যান্ড / নির্মাতা" : "Brand / Maker"}
                </label>
                <input 
                  type="text" 
                  placeholder={isBangla ? "যেমন: টয়োটা, হোন্ডা" : "e.g. Toyota, Honda"}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  value={form.brand} 
                  onChange={e => setForm({ ...form, brand: e.target.value })} 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">
                  {isBangla ? "মডেল ও রঙ" : "Model & Color"}
                </label>
                <input 
                  type="text" 
                  placeholder={isBangla ? "যেমন: অ্যাক্সিও - সাদা" : "e.g. Axio - White"}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  value={form.model} 
                  onChange={e => setForm({ ...form, model: e.target.value })} 
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                {isBangla ? "বাতিল" : "Cancel"}
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-teal-600/30 disabled:opacity-50"
              >
                {submitting ? (isBangla ? "সংরক্ষণ হচ্ছে..." : "Saving...") : (isBangla ? "সংরক্ষণ করুন" : "Save Vehicle")}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-400" /></div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-12 text-center backdrop-blur-xl">
            <Car className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white">{isBangla ? "কোন সংরক্ষিত যানবাহন নেই" : "No vehicles registered"}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {isBangla ? "সহজ পার্কিং বুকিংয়ের জন্য আপনার প্রথম গাড়ি বা বাইকটি যুক্ত করুন।" : "Add your vehicle details above to enable instant smart bookings."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {vehicles.map(v => {
              const Icon = TYPE_ICONS[v.type] || Car;
              return (
                <div key={v.id} className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl backdrop-blur-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-mono text-base font-black text-white">{v.plateNumber}</p>
                      <p className="text-xs text-slate-400">
                        {[v.brand, v.model].filter(Boolean).join(" • ") || (isBangla ? "সাধারণ যান" : "Standard Vehicle")}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
