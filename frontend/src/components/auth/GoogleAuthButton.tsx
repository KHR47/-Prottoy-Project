"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "824497726439-97jvs4d12t3mvt7ttbco5s23qhe0lihq.apps.googleusercontent.com";

interface GoogleAuthButtonProps {
  onError?: (err: string) => void;
  onSuccess?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleAuthButton({
  onError,
  onSuccess,
  text = "continue_with",
}: GoogleAuthButtonProps) {
  const { isBangla } = useLanguage();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  // Process incoming token from URL hash (direct OAuth return)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash && window.location.hash.includes("access_token=")) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");

      if (accessToken) {
        window.history.replaceState(null, "", window.location.pathname);
        setIsLoading(true);
        const toastId = toast.loading(
          isBangla ? "গুগল অ্যাকাউন্ট যাচাই হচ্ছে..." : "Authenticating with Google..."
        );

        api
          .post("/auth/google", { accessToken })
          .then((res) => {
            saveAuth(res.data.accessToken, res.data.user);
            onSuccess?.();
            toast.success(
              isBangla
                ? `স্বাগতম, ${res.data.user.name || "নাগরিক"}!`
                : `Welcome back, ${res.data.user.name || "Citizen"}!`,
              { id: toastId }
            );

            const role = res.data.user.role;
            const target =
              role === "authority"
                ? "/authority/dashboard"
                : role === "admin"
                ? "/admin/dashboard"
                : role === "officer"
                ? "/officer/reports"
                : "/dashboard";

            setTimeout(() => {
              window.location.href = target;
            }, 300);
          })
          .catch((err) => {
            const msg = getErrorMessage(
              err,
              isBangla ? "গুগল সাইন-ইন ব্যর্থ হয়েছে।" : "Google authentication failed."
            );
            setLocalError(msg);
            onError?.(msg);
            toast.error(msg, { id: toastId });
            setIsLoading(false);
          });
      }
    }
  }, [isBangla, onError, onSuccess]);

  const handleGoogleClick = () => {
    setIsLoading(true);
    setLocalError("");

    try {
      const redirectUri = `${window.location.origin}/login`;
      const scope = encodeURIComponent("openid email profile");
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=${scope}&prompt=select_account`;

      // Direct seamless navigation to Google OAuth
      window.location.href = oauthUrl;
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to initialize Google login");
      setLocalError(msg);
      setIsLoading(false);
    }
  };

  const buttonLabel = (() => {
    if (isBangla) {
      if (text === "signup_with") return "গুগল দিয়ে সাইন আপ করুন";
      if (text === "signin_with") return "গুগল দিয়ে সাইন ইন করুন";
      return "গুগল দিয়ে চালিয়ে যান";
    }
    if (text === "signup_with") return "Sign up with Google";
    if (text === "signin_with") return "Sign in with Google";
    return "Continue with Google";
  })();

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <button
        type="button"
        id="google-oauth-login-button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className={`w-full h-11 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer select-none active:scale-[0.98] ${
          theme === "light"
            ? "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
            : "bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:border-teal-500/50 shadow-md shadow-black/20"
        } ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            <span>
              {isBangla ? "গুগল পেজে নিয়ে যাওয়া হচ্ছে..." : "Connecting to Google..."}
            </span>
          </>
        ) : (
          <>
            <svg
              className="w-4.5 h-4.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-semibold">{buttonLabel}</span>
          </>
        )}
      </button>

      {localError && (
        <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1 text-center">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{localError}</span>
        </p>
      )}
    </div>
  );
}
