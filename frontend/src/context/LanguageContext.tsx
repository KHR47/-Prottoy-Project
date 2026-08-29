"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Language, Translations, translations } from "@/lib/translations";

interface LanguageContextValue {
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  isBangla: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.en,
  isBangla: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sc-lang") as Language;
    if (saved === "en" || saved === "bn") {
      setLang(saved);
      document.documentElement.setAttribute("lang", saved);
      document.documentElement.setAttribute("data-lang", saved);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("sc-lang", newLang);
      document.documentElement.setAttribute("lang", newLang);
      document.documentElement.setAttribute("data-lang", newLang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "bn" : "en";
    setLanguage(nextLang);
  };

  const currentTranslations = mounted ? translations[lang] : translations.en;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        toggleLanguage,
        t: currentTranslations,
        isBangla: lang === "bn",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
