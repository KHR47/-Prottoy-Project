"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setSuccess(true);
      
      // For MVP purposes, if a mockToken is returned, automatically redirect to reset
      if (response.data.mockToken) {
        setTimeout(() => {
          router.push(`/reset-password?token=${response.data.mockToken}`);
        }, 1500);
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to process request."));
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-base)] font-sans p-4">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full bg-teal-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-blue-600/20 blur-[100px]"
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)]/60 shadow-2xl backdrop-blur-xl md:grid md:grid-cols-2"
      >
        {/* Left Side */}
        <div className="hidden flex-col justify-between p-12 text-[var(--text-primary)] md:flex border-r border-[var(--border)]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">SmartCity</p>
                <p className="text-sm font-medium text-teal-400">Account Recovery</p>
              </div>
            </div>
            <h1 className="mt-12 text-4xl font-black leading-tight tracking-tight lg:text-5xl">
              Get back to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                your community.
              </span>
            </h1>
            <p className="mt-6 max-w-sm text-lg text-[var(--text-secondary)] leading-relaxed">
              Don't worry if you forgot your password. Enter your email and we'll help you get back into your account securely.
            </p>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="flex w-full flex-col justify-center bg-[var(--bg-surface)] p-8 sm:p-12">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="w-full max-w-md mx-auto">
            <Link href="/login" className="inline-flex items-center text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Reset Password</h2>
              <p className="mt-2 text-[var(--text-secondary)]">Enter your email address to receive a recovery link.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                {error}
              </motion.div>
            )}

            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center shadow-sm">
                <ShieldCheck className="mx-auto h-12 w-12 text-teal-500 mb-4" />
                <h3 className="text-lg font-bold text-teal-800 mb-2">Request Received</h3>
                <p className="text-sm text-teal-700 mb-4">
                  If an account exists for {email}, a recovery link has been sent.
                </p>
                <div className="flex items-center justify-center text-xs font-semibold text-teal-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> For MVP: Auto-redirecting to reset form...
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">Email Address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      className="block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] py-3 pl-11 pr-4 text-[var(--text-primary)] placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--accent)] px-4 py-3.5 text-sm font-bold text-[#fff] shadow-lg transition-all hover:bg-[var(--accent-hover)] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-70 mt-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send Recovery Link
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
