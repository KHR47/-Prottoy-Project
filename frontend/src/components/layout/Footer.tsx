"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { 
  ShieldCheck, 
  Mail, 
  Phone
} from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

export function Footer() {
  const { isBangla } = useLanguage();

  return (
    <footer className="border-t bg-slate-950 text-slate-400 font-sans relative z-10" style={{ borderColor: "var(--border, rgba(255,255,255,0.1))" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Developer Profile */}
          <div className="col-span-2 space-y-4">
            <Link href="/dashboard" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Prottoy <span className="text-teal-400 font-serif font-bold text-sm">প্রত্যয়</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {isBangla 
                ? "নাগরিক সমস্যা নিরসন, দুর্নীতি দমন ভল্ট, স্মার্ট পার্কিং এবং পাবলিক ভেরিফিকেশন গ্রিড।" 
                : "Unified civic infrastructure for incident reporting, anti-corruption whistleblowing, LiDAR smart parking, and verified municipal services."}
            </p>

            <div className="pt-2">
              <p className="text-xs text-slate-300 font-medium">
                {isBangla ? "তত্ত্বাবধান ও নির্মাণে:" : "Engineered by"} <strong className="text-white">Md. Khalid Hasan</strong>
              </p>
              
              {/* Contact and Social Row */}
              <div className="flex items-center gap-3 pt-3">
                <a
                  href="https://github.com/KHR47"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-teal-500/40 transition-all shadow-sm"
                  aria-label="GitHub Profile"
                  title="GitHub: KHR47"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>

                <a
                  href="https://www.linkedin.com/in/khr47/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-all shadow-sm"
                  aria-label="LinkedIn Profile"
                  title="LinkedIn: in/khr47"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>

                <a
                  href="mailto:hasankhalid16648@gmail.com"
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-teal-400 hover:border-teal-500/40 transition-all shadow-sm"
                  aria-label="Send Email"
                  title="hasankhalid16648@gmail.com"
                >
                  <Mail className="w-4 h-4" />
                </a>

                <a
                  href="tel:+8801568966255"
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-teal-400 hover:border-teal-500/40 transition-all shadow-sm"
                  aria-label="Call Phone"
                  title="+880 1568 966255"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Core Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              {isBangla ? "নাগরিক সেবা" : "Services"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reports" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "নাগরিক রিপোর্ট" : "Civic Reports"}
                </Link>
              </li>
              <li>
                <Link href="/ghush-reports" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "দুর্নীতি দমন ভল্ট" : "Whistleblower Vault"}
                </Link>
              </li>
              <li>
                <Link href="/find" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "স্মার্ট পার্কিং" : "Smart Parking"}
                </Link>
              </li>
              <li>
                <Link href="/housing" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "আবাসন ও ফ্ল্যাট" : "Verified Housing"}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "স্থানীয় কারিগর" : "Local Trades"}
                </Link>
              </li>
              <li>
                <Link href="/lost-found" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "হারানো ও প্রাপ্তি" : "Lost & Found"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Governance & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              {isBangla ? "স্বচ্ছতা ও নিরাপত্তা" : "Governance"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reports/public" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "পাবলিক লেজার" : "Public Ledger"}
                </Link>
              </li>
              <li>
                <Link href="/ghush-reports/new" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "জিরো-নলেজ ক্লেইম" : "Zero-Knowledge Claims"}
                </Link>
              </li>
              <li>
                <Link href="/reports/new" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "জিআইএস ম্যাপ রিপোর্ট" : "GIS Incident Mapping"}
                </Link>
              </li>
              <li>
                <span className="text-slate-300 font-medium">
                  {isBangla ? "জরুরি সেবা: ৯৯৯" : "National Emergency: 999"}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              {isBangla ? "অ্যাকাউন্ট" : "Platform"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "নাগরিক ড্যাশবোর্ড" : "Citizen Dashboard"}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "প্রোফাইল সেটিংস" : "Profile Settings"}
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "আমার বুকিং" : "My Bookings"}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                  {isBangla ? "প্রবেশ / সাইন ইন" : "Sign In"}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-slate-400">
            © {new Date().getFullYear()} <strong className="text-white">Prottoy (প্রত্যয়)</strong>. {isBangla ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {isBangla ? "সিস্টেম স্বাভাবিক" : "All Systems Operational"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
