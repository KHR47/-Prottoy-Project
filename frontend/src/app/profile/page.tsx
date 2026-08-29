"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, saveAuth, getToken } from "@/lib/auth";
import type { User } from "@/types/user";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { User as UserIcon, Mail, Phone, MapPin, Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const { t, isBangla } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
    password: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setFormData({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      district: currentUser.district || "",
      password: "",
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const body: any = {
        name: formData.name,
        phone: formData.phone,
        district: formData.district,
      };
      
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await api.patch("/users/me", body);
      const updatedUser = res.data;
      
      const token = getToken();
      if (token) {
        saveAuth(token, updatedUser);
      }
      
      setUser(updatedUser);
      setFormData((prev) => ({ ...prev, password: "" }));
      setMessage({ type: "success", text: isBangla ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || err.message || (isBangla ? "আপডেট ব্যর্থ হয়েছে।" : "Failed to update profile") });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ background: "var(--bg-background)" }}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                {isBangla ? "যাচাইকৃত প্রোফাইল" : "Verified Profile"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                {t.nav.profile}
              </h1>
              <p className="mt-1 text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                {isBangla ? "আপনার ব্যক্তিগত তথ্য ও নিরাপত্তা সেটিংস পরিচালনা করুন।" : "View and manage your account information and credentials."}
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-2xl font-black text-white shadow-xl shadow-teal-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium border ${
                message.type === "success"
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <p>{message.text}</p>
            </motion.div>
          )}

          {/* Form Card */}
          <div
            className="rounded-3xl border p-6 sm:p-10 shadow-xl backdrop-blur-xl"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                    {t.auth.nameLabel}
                  </label>
                  <div className="relative">
                    <UserIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      style={{
                        background: "var(--bg-elevated)",
                        borderColor: "var(--border-strong)",
                        color: "var(--text-primary)",
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                    {t.auth.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={user.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm opacity-60 cursor-not-allowed"
                      style={{
                        background: "var(--bg-elevated)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                    {t.auth.phoneLabel}
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      style={{
                        background: "var(--bg-elevated)",
                        borderColor: "var(--border-strong)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                    {t.auth.districtLabel}
                  </label>
                  <div className="relative">
                    <MapPin className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder={isBangla ? "ঢাকা" : "Dhaka"}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      style={{
                        background: "var(--bg-elevated)",
                        borderColor: "var(--border-strong)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                  {isBangla ? "নতুন পাসওয়ার্ড (পরিবর্তন করতে চাইলে)" : "New Password (Optional)"}
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isBangla ? "অপরিবর্তিত রাখতে খালি রাখুন" : "Leave blank to keep unchanged"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    style={{
                      background: "var(--bg-elevated)",
                      borderColor: "var(--border-strong)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold px-8 py-3.5 text-sm shadow-xl shadow-teal-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
