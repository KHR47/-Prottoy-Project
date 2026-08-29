"use client";

import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Loader2, AlertCircle } from "lucide-react";

interface GoogleAuthButtonProps {
  onError?: (err: string) => void;
  onSuccess?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleAuthButton({ onError, onSuccess, text = "continue_with" }: GoogleAuthButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { isBangla } = useLanguage();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      const msg = isBangla ? "গুগল প্রমাণীকরণ ব্যর্থ হয়েছে।" : "Google token was not received.";
      setLocalError(msg);
      onError?.(msg);
      return;
    }

    setIsLoading(true);
    setLocalError("");

    try {
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      saveAuth(response.data.accessToken, response.data.user);
      onSuccess?.();

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
    } catch (err: unknown) {
      const msg = getErrorMessage(
        err,
        isBangla
          ? "গুগল সাইন-ইন সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।"
          : "Google authentication failed. Please try again."
      );
      setLocalError(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    const msg = isBangla
      ? "গুগল লগইন বাতিল করা হয়েছে অথবা ব্যর্থ হয়েছে।"
      : "Google Sign In was cancelled or failed.";
    setLocalError(msg);
    onError?.(msg);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {isLoading ? (
        <div className="w-full h-11 rounded-xl bg-slate-800/60 border border-white/10 flex items-center justify-center gap-2 text-sm text-slate-300 font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          <span>{isBangla ? "গুগল অ্যাকাউন্ট যাচাই হচ্ছে..." : "Authenticating with Google..."}</span>
        </div>
      ) : (
        <div className="w-full flex justify-center scale-[0.98] hover:scale-100 transition-transform">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="rectangular"
            theme={theme === "light" ? "outline" : "filled_black"}
            size="large"
            width="360"
            text={text}
            logo_alignment="left"
          />
        </div>
      )}

      {localError && (
        <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1 text-center">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{localError}</span>
        </p>
      )}
    </div>
  );
}
