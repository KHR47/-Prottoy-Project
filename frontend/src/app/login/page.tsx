"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight, ShieldCheck, Eye } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { AuthCinematicBackground } from "@/components/auth/AuthCinematicBackground";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { useLanguage } from "@/context/LanguageContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { t, isBangla } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      saveAuth(response.data.accessToken, response.data.user);

      // If there's a redirect param, go there instead of the default role-based route
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      const role = response.data.user.role;

      if (role === "citizen") router.push("/dashboard");
      else if (role === "authority") router.push("/authority/dashboard");
      else if (role === "officer") router.push("/officer/reports");
      else if (role === "driver") router.push("/driver/dashboard");
      else if (role === "attendant") router.push("/attendant/dashboard");
      else router.push("/admin/dashboard");
    } catch (error: unknown) {
      setError(getErrorMessage(error, isBangla ? "লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।" : "Login failed."));
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[var(--bg-base)]">
      {/* Dynamic Animated Cinematic Backdrop */}
      <AuthCinematicBackground />

      <motion.section 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl grid lg:grid-cols-12 min-h-[640px]"
      >
        {/* Left Side: Modern Interactive Hero Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border-r border-white/10">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-teal-500/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-black shadow-lg shadow-teal-500/20">
                P
              </div>
              <span className="text-xl font-bold tracking-tight">Prottoy</span>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isBangla ? "সুরক্ষিত নাগরিক গ্রিড" : "Verified Civic Ecosystem"}
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-snug">
                {isBangla ? "নাগরিক সেবা ও স্বচ্ছতা নিশ্চিতের জাতীয় প্ল্যাটফর্ম।" : "Unified civic transparency for every citizen."}
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                {isBangla 
                  ? "রাস্তাঘাট, ইউটিলিটি রিপোর্ট, দুর্নীতি হুইসেলব্লোয়িং এবং স্থানীয় সেবা এক ঠিকানায়।" 
                  : "Track reports, submit anti-corruption files, and access municipal services."}
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>© 2026 Prottoy Project</span>
            <span className="font-mono text-teal-400 font-semibold">256-Bit SSL</span>
          </div>
        </div>

        {/* Right Side: Clean Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white text-slate-900">
          <div className="flex items-center justify-between gap-3 mb-8">
            <Link href="/" className="lg:hidden flex items-center gap-2 font-bold text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white font-black text-sm">P</div>
              Prottoy
            </Link>
            <div className="flex items-center gap-2 ml-auto">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isBangla ? "স্বাগতম" : "Welcome back"}</h2>
              <p className="mt-2 text-slate-500">{isBangla ? "অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন।" : "Please enter your details to sign in."}</p>
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

            {/* Google Fast Sign In */}
            <div className="mb-6">
              <GoogleAuthButton text="signin_with" onError={(err) => setError(err)} />
              
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isBangla ? "অথবা ইমেইল দিয়ে" : "Or with email"}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">{t.auth.emailLabel}</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">{t.auth.passwordLabel}</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600" />
                  <span className="text-sm font-medium text-slate-600">{isBangla ? "স্মরণে রাখুন" : "Remember me"}</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-bold text-teal-600 hover:text-teal-500">
                  {t.auth.forgotPassword}
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                id="login-submit"
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--accent)] px-4 py-3.5 text-sm font-bold text-[#fff] shadow-lg transition-all hover:bg-[var(--accent-hover)] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t.auth.loginButton}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-600">
              {t.auth.dontHaveAccount}{" "}
              <Link href="/register" className="font-bold text-teal-600 hover:text-teal-500 transition-colors">
                {t.auth.registerButton}
              </Link>
            </p>

            <Link
              href="/dashboard"
              className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
              {isBangla ? "অতিথি হিসেবে দেখুন" : "Continue as Guest"}
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-base)]" />}>
      <LoginForm />
    </Suspense>
  );
}

