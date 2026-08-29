"use client";

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LanguageToggle() {
  const { lang, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-7 w-[76px] rounded-full border border-white/10 bg-slate-900/40 backdrop-blur-md" />
    );
  }

  return (
    <div
      className="relative flex h-7 items-center rounded-full p-0.5 border transition-all duration-300 shadow-sm"
      style={{
        backgroundColor: "var(--bg-surface-2)",
        borderColor: "var(--border)",
      }}
      title={lang === "en" ? "বাংলা ভাষায় পরিবর্তন করুন" : "Switch to English"}
    >
      {/* English Button */}
      <button
        onClick={() => setLanguage("en")}
        className={`relative z-10 flex h-6 items-center justify-center px-2 text-[11px] font-bold rounded-full transition-colors duration-200 ${
          lang === "en"
            ? "text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
        type="button"
        aria-label="English"
      >
        <span>EN</span>
      </button>

      {/* Bangla Button */}
      <button
        onClick={() => setLanguage("bn")}
        className={`relative z-10 flex h-6 items-center justify-center px-2 text-[11px] font-bold rounded-full transition-colors duration-200 ${
          lang === "bn"
            ? "text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
        type="button"
        aria-label="বাংলা"
      >
        <span className="font-serif leading-none pt-0.5">বাংলা</span>
      </button>

      {/* Animated Sliding Pill Highlight */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute inset-y-0.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 shadow-sm shadow-teal-950/40"
        style={{
          left: lang === "en" ? "2px" : "calc(50% - 1px)",
          width: "calc(50% - 1px)",
        }}
      />
    </div>
  );
}
