"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to reset password. The link might be expired."));
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm w-full max-w-md mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black text-emerald-900 mb-3 tracking-tight">Password Reset</h3>
        <p className="text-base text-emerald-700 mb-8 leading-relaxed">
          Your password has been successfully updated. You can now log in with your new credentials.
        </p>
        <Link href="/login" className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20">
          Return to Login <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Set new password</h2>
        <p className="mt-2 text-[var(--text-secondary)]">Please enter and confirm your new password below.</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">New Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="password"
              className="block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] py-3 pl-11 pr-4 text-[var(--text-primary)] placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">Confirm Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="confirmPassword"
              className="block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] py-3 pl-11 pr-4 text-[var(--text-primary)] placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading || !token}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--accent)] px-4 py-3.5 text-sm font-bold text-[#fff] shadow-lg transition-all hover:bg-[var(--accent-hover)] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-70 mt-6"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Update Password
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-base)] font-sans p-4">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full bg-teal-600/20 blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[40%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)]/60 shadow-2xl backdrop-blur-xl md:grid md:grid-cols-2"
      >
        <div className="hidden flex-col justify-between p-12 text-[var(--text-primary)] md:flex border-r border-[var(--border)]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">SmartCity</p>
                <p className="text-sm font-medium text-teal-400">Security</p>
              </div>
            </div>
            <h1 className="mt-12 text-4xl font-black leading-tight tracking-tight lg:text-5xl">
              Secure your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                account.
              </span>
            </h1>
            <p className="mt-6 max-w-sm text-lg text-[var(--text-secondary)] leading-relaxed">
              Create a strong password to keep your SmartCity account and personal data safe.
            </p>
          </motion.div>
        </div>

        <div className="flex w-full flex-col justify-center bg-[var(--bg-surface)] p-8 sm:p-12">
          <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.section>
    </main>
  );
}
