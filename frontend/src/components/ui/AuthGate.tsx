"use client";

import { useRouter, usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogIn, UserPlus, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthGateProps {
  children: React.ReactNode;
  /** Fallback content shown to guests in place of children (e.g. a disabled button). If not provided, children are shown but clicking triggers the modal. */
  fallback?: React.ReactNode;
  /** Custom message in the modal */
  message?: string;
}

/**
 * Wraps a protected action. If the user is a guest, clicking triggers a sign-in modal.
 * If authenticated, renders children normally.
 *
 * Uses React Portal to render the modal at the document body level, preventing it
 * from being trapped inside parent elements with CSS transforms or overflow:hidden.
 */
export function AuthGate({ children, fallback, message }: AuthGateProps) {
  const user = getUser();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  if (user) {
    return <>{children}</>;
  }

  const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;

  const modalContent = (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-8 shadow-2xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
              <ShieldCheck className="w-8 h-8" />
            </div>

            {/* Text */}
            <h3 className="text-center text-2xl font-bold text-[var(--text-primary)] mb-2">
              Sign in required
            </h3>
            <p className="text-center text-[var(--text-secondary)] mb-8 leading-relaxed text-sm sm:text-base">
              {message || "You need to sign in to perform this action. Create a free account or sign in to continue."}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(redirectUrl)}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => router.push(`/register?redirect=${encodeURIComponent(pathname)}`)}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold text-sm border border-[var(--border)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)] transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full text-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {fallback ? (
        <div onClick={() => setShowModal(true)} className="cursor-pointer">
          {fallback}
        </div>
      ) : (
        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(true); }} className="cursor-pointer">
          {children}
        </div>
      )}

      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
