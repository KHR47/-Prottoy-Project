"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User, Phone, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { AuthCinematicBackground } from "@/components/auth/AuthCinematicBackground";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { useLanguage } from "@/context/LanguageContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { t, isBangla } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("citizen");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError(isBangla ? "পাসওয়ার্ড দুটি মিলছে না।" : "Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        phone,
        district,
        password,
        role,
      });

      router.push(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login");
    } catch (error: unknown) {
      setError(getErrorMessage(error, isBangla ? "নিবন্ধন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।" : "Registration failed."));
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden font-sans selection:bg-cyan-500/30 p-4" style={{ background: "var(--bg-background)" }}>
      {/* Hyper-Realistic Animated Smart City Background */}
      <AuthCinematicBackground />

      {/* Controls: Language and Theme Toggle */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-2xl md:grid md:grid-cols-2"
      >
        {/* Left Side - Branding */}
        <div className="hidden flex-col justify-between p-12 text-[var(--text-primary)] md:flex">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 shadow-lg shadow-teal-500/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">Prottoy <span className="text-xs text-teal-400 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">প্রত্যয়</span></p>
                <p className="text-sm font-medium text-teal-400">{t.nav.gridSubtitle}</p>
              </div>
            </div>
            <h1 className="mt-12 text-4xl font-black leading-tight tracking-tight lg:text-5xl">
              {isBangla ? "পরিবর্তনের" : "Be the change"} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                {isBangla ? "অংশীদার হোন।" : "you want to see."}
              </span>
            </h1>
            <p className="mt-6 max-w-sm text-lg text-slate-300 leading-relaxed">
              {t.auth.registerSubtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center gap-4 text-sm font-medium text-slate-400"
          >
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
            {t.auth.systemOnline}
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full flex-col justify-center bg-[var(--bg-surface)] p-8 sm:p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.auth.registerTitle}</h2>
              <p className="mt-2 text-slate-500">{isBangla ? "সদস্য হতে নিচের তথ্যগুলো পূরণ করুন।" : "Fill in the details below to join Prottoy."}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Google Fast Sign Up */}
            <div className="mb-6">
              <GoogleAuthButton text="signup_with" onError={(err) => setError(err)} />
              
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isBangla ? "অথবা তথ্য দিয়ে নিবন্ধন করুন" : "Or register with details"}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">{t.auth.nameLabel}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="name"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      type="text"
                      placeholder={t.auth.namePlaceholder}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">{t.auth.emailLabel}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      placeholder={t.auth.emailPlaceholder}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">{t.auth.phoneLabel}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="phone"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      type="tel"
                      placeholder="01734677866"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">{t.auth.districtLabel}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="district"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      value={district}
                      onChange={(event) => setDistrict(event.target.value)}
                      type="text"
                      placeholder={isBangla ? "ঢাকা" : "Dhaka"}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">{t.auth.roleLabel}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      id="role"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                    >
                      <option value="citizen">{t.auth.citizenRole}</option>
                      <option value="driver">{isBangla ? "ড্রাইভার (ট্রান্সপোর্ট)" : "Driver (Transport)"}</option>
                      <option value="attendant">{isBangla ? "পার্কিং অ্যাটেনডেন্ট" : "Parking Attendant"}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">{t.auth.passwordLabel}</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder={isBangla ? "একটি শক্তিশালী পাসওয়ার্ড দিন" : "Create a strong password"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">{isBangla ? "পাসওয়ার্ড নিশ্চিতকরণ" : "Confirm Password"}</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    type="password"
                    placeholder={isBangla ? "পাসওয়ার্ড পুনরায় দিন" : "Confirm your password"}
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                id="register-submit"
                className="mt-6 group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--accent)] px-4 py-3.5 text-sm font-bold text-[#fff] shadow-lg transition-all hover:bg-[var(--accent-hover)] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t.auth.registerButton}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-600">
              {t.auth.alreadyHaveAccount}{" "}
              <Link href="/login" className="font-bold text-teal-600 hover:text-teal-500 transition-colors">
                {t.auth.loginButton}
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-base)]" />}>
      <RegisterForm />
    </Suspense>
  );
}

