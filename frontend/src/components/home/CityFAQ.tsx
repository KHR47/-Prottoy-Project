"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, HelpCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  link?: { text: string; href: string };
}

const faqs: FAQItem[] = [
  {
    id: "guest",
    category: "Access & Security",
    question: "Do I need an account to browse city services and community reports?",
    answer:
      "No! You can browse the entire SmartCity portal as a guest explorer — view public community incident reports, explore lost & found custody feeds, check rental reviews, and search local trades. An account is only required when filing confidential reports, submitting claims, or adding verified listings.",
  },
  {
    id: "reporting",
    category: "Civic Reporting",
    question: "How does crowdsourced incident upvoting prioritize municipal repair?",
    answer:
      "When a citizen logs a civic issue (such as a fallen tree, broken streetlight, or road damage), neighbors can hit 'Support'. Once an issue reaches community support thresholds, our automated workflow engine flags it as High Priority and dispatches notifications directly to the designated municipal officer with GPS coordinates.",
    link: { text: "Browse Public Issues", href: "/reports/public" },
  },
  {
    id: "ghush-vault",
    category: "Anti-Corruption",
    question: "How does the Ghush Anti-Corruption Vault protect whistleblowers?",
    answer:
      "Whistleblowers can submit bribery allegations completely anonymously without storing IP or personal identifiers. Evidence (photos, receipts, voice recordings) is cryptographically isolated and routed straight to anti-corruption integrity review officers.",
    link: { text: "Open Ghush Vault", href: "/ghush-reports" },
  },
  {
    id: "lost-found",
    category: "Civic Custody",
    question: "How are lost belongings verified before custody is returned?",
    answer:
      "When an item is turned in, finders post the listing. Original owners file a private claim answering specific ownership proof questions. Once verified, safe handover coordinates and contact details are unlocked securely.",
    link: { text: "Lost & Found Portal", href: "/lost-found" },
  },
  {
    id: "housing-reviews",
    category: "Tenant Safety",
    question: "Are housing reviews and landlord ratings authentic?",
    answer:
      "Yes. Verified tenants can rate rental flats on safety, water/electricity stability, landlord responsiveness, and lease transparency, helping new renters find secure accommodation.",
    link: { text: "Search Housing", href: "/housing" },
  },
  {
    id: "parking-reservations",
    category: "Smart Parking",
    question: "How does the IoT sensor parking system guarantee my reserved spot?",
    answer:
      "City parking zones are instrumented with ultrasonic and camera sensors. When you reserve a spot, the bay is locked in the system with a grace buffer time, guiding you directly to the allocated stall via GPS navigation.",
    link: { text: "Find Parking Spots", href: "/find" },
  },
];

export function CityFAQ() {
  const [openId, setOpenId] = useState<string | null>("guest");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="my-24 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-4 shadow-sm">
          <HelpCircle className="w-3.5 h-3.5" />
          Knowledge Base
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-[var(--text-secondary)] text-base sm:text-lg mt-3 font-light leading-relaxed">
          Everything you need to know about navigating, reporting, and utilizing Dhaka&apos;s smart urban ecosystem.
        </p>
      </div>

      {/* Accordion list */}
      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-lg shadow-black/5"
                  : "border-[var(--border)] bg-[var(--bg-surface)]/60 hover:border-[var(--border-strong)]"
              }`}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full p-6 sm:p-7 flex items-center justify-between text-left gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-muted)] self-start sm:self-auto">
                    {faq.category}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    {faq.question}
                  </span>
                </div>

                <div
                  className={`h-9 w-9 shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-secondary)] transition-transform duration-300 ${
                    isOpen ? "rotate-45 bg-[var(--accent-light)] text-[var(--accent)] border-transparent" : ""
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-1 border-t border-[var(--border)]/50">
                      <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-light">
                        {faq.answer}
                      </p>

                      {faq.link && (
                        <div className="mt-4">
                          <Link
                            href={faq.link.href}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent)] hover:underline"
                          >
                            {faq.link.text} <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
