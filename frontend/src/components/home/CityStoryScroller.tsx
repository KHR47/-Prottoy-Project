"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Zap, ShieldCheck, Car, Radio, Cpu, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface StoryChapter {
  id: string;
  step: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  bullets: string[];
  linkText: string;
  href: string;
  color: string;
  gradient: string;
  glowRgba: string;
  icon: typeof Bus;
  telemetry: {
    stat1: { label: string; val: string };
    stat2: { label: string; val: string };
    status: string;
  };
}

const chapters: StoryChapter[] = [
  {
    id: "transit",
    step: "01 / TRANSIT",
    badge: "Connected Mobility",
    title: "Intelligent Public Transit",
    headline: "Zero-latency bus dispatch and digital frictionless ticketing.",
    description:
      "Dhaka's municipal bus network monitored in real-time. Commuters track arrival intervals down to the second, plan multimodal routes, and tap-to-ride with digital passes.",
    bullets: [
      "Live GPS fleet telemetry across 30+ Dhaka corridors",
      "Dynamic passenger load balancing & headway control",
      "Unified QR & contactless NFC ticketing with auto-fare calculation",
    ],
    linkText: "Explore Public Transit",
    href: "/transport",
    color: "text-sky-400",
    gradient: "from-sky-500/20 via-blue-500/10 to-transparent",
    glowRgba: "rgba(14, 165, 233, 0.15)",
    icon: Bus,
    telemetry: {
      stat1: { label: "Fleet On-Time", val: "96.8%" },
      stat2: { label: "Avg Wait Time", val: "3.4 min" },
      status: "Active Fleet Tracking",
    },
  },
  {
    id: "utilities",
    step: "02 / ENERGY & WATER",
    badge: "Grid Resilience",
    title: "Smart Utilities & Conservation",
    headline: "Automated metering, leak mitigation, and power grid stability.",
    description:
      "Continuous IoT sensor streams prevent catastrophic blackouts and water loss. Residents track daily consumption trends and pay verified digital bills instantly.",
    bullets: [
      "Sub-second outage localization & autonomous crew dispatch",
      "Automated water distribution pressure & purity checks",
      "Predictive peak load forecasting powered by historical telemetry",
    ],
    linkText: "View Utility Network",
    href: "/utilities",
    color: "text-teal-400",
    gradient: "from-teal-500/20 via-emerald-500/10 to-transparent",
    glowRgba: "rgba(20, 184, 166, 0.15)",
    icon: Zap,
    telemetry: {
      stat1: { label: "Substation Health", val: "99.9%" },
      stat2: { label: "Water Purity Index", val: "98.4" },
      status: "Grid Telemetry Nominal",
    },
  },
  {
    id: "civic",
    step: "03 / COMMUNITY SAFETY",
    badge: "Civic Intelligence",
    title: "Citizen Incident Response",
    headline: "Empowering neighborhoods with geo-tagged crowdsourced reporting.",
    description:
      "When a streetlight breaks or a civic hazard emerges, citizens pin it on the city map. Community upvotes escalate critical issues directly to field officers with audit trails.",
    bullets: [
      "Automated geospatial routing to nearest municipal authority",
      "Crowdsourced community upvoting with priority auto-escalation",
      "End-to-end transparent photo and status resolution history",
    ],
    linkText: "Open Reporting Portal",
    href: "/reports/public",
    color: "text-violet-400",
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    glowRgba: "rgba(139, 92, 246, 0.15)",
    icon: ShieldCheck,
    telemetry: {
      stat1: { label: "Resolution Rate", val: "94.2%" },
      stat2: { label: "Escalation Time", val: "< 12 min" },
      status: "Command Dispatch Ready",
    },
  },
  {
    id: "parking",
    step: "04 / TRAFFIC MESH",
    badge: "Urban Flow",
    title: "Smart Parking Guidance",
    headline: "Say goodbye to circling blocks. Reserve before you arrive.",
    description:
      "Sensors in commercial zones broadcast bay availability in real-time. Automated license plate recognition ensures effortless check-in, reducing city traffic by up to 28%.",
    bullets: [
      "Ultrasonic & camera sensor grid with sub-meter bay tracking",
      "Instant reservation locking with navigation integration",
      "Integrated EV charging bay monitoring & automated billing",
    ],
    linkText: "Find Parking Spots",
    href: "/parking",
    color: "text-pink-400",
    gradient: "from-pink-500/20 via-rose-500/10 to-transparent",
    glowRgba: "rgba(244, 63, 94, 0.15)",
    icon: Car,
    telemetry: {
      stat1: { label: "Total Bays Tracked", val: "3,200" },
      stat2: { label: "Traffic Reduction", val: "-24%" },
      status: "Mesh Sensor Online",
    },
  },
];

export function CityStoryScroller() {
  const [activeIdx, setActiveIdx] = useState(0);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      chapterRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = top + rect.height;

        if (scrollPosition >= top && scrollPosition < bottom) {
          setActiveIdx(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeChapter = chapters[activeIdx];
  const Icon = activeChapter.icon;

  return (
    <section className="relative my-24 w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-20 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-4 shadow-sm">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          The Unified City Infrastructure
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
          How SmartCity Operates in Real-Time
        </h2>
        <p className="text-[var(--text-secondary)] text-base sm:text-lg mt-4 leading-relaxed font-light">
          A synchronized mesh of public mobility, utility intelligence, civic reporting, and traffic flow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Column: Pinned Holographic Telemetry Console */}
        <div className="lg:col-span-6 lg:sticky lg:top-32 self-start">
          <div className="relative rounded-[2.5rem] p-8 sm:p-10 border border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-700">
            {/* Ambient dynamic glow based on active chapter */}
            <div
              className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
              style={{ background: activeChapter.glowRgba }}
            />
            <div
              className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
              style={{ background: activeChapter.glowRgba }}
            />

            {/* Header bar of the holographic console */}
            <div className="flex items-center justify-between pb-6 border-b border-[var(--border)] relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </div>
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--text-secondary)]">
                  NODE_ID: BD_DHK_{activeChapter.id.toUpperCase()}_01
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-xs font-mono text-[var(--text-muted)]">CORE MESH V2.4</span>
              </div>
            </div>

            {/* Interactive Animated Visual Screen */}
            <div className="my-8 relative z-10 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
              {/* Radar rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 rounded-full border border-dashed border-[var(--border-strong)] animate-[spin_60s_linear_infinite]" />
                <div className="w-40 h-40 rounded-full border border-[var(--border)] animate-[spin_30s_linear_infinite_reverse]" />
                <div className="w-24 h-24 rounded-full border border-[var(--border-strong)]/40" />
              </div>

              {/* Center Morphing Holographic Badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChapter.id}
                  initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotate: 15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-20 flex flex-col items-center"
                >
                  <div
                    className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${activeChapter.gradient} border border-[var(--border-strong)] flex items-center justify-center shadow-2xl backdrop-blur-md mb-4`}
                  >
                    <Icon className={`w-14 h-14 ${activeChapter.color}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
                      {activeChapter.badge}
                    </p>
                    <p className={`text-lg font-black tracking-tight ${activeChapter.color}`}>
                      {activeChapter.title}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Live Metrics Footer inside Console */}
            <div className="pt-6 border-t border-[var(--border)] grid grid-cols-2 gap-4 relative z-10">
              <div className="p-4 rounded-2xl bg-[var(--bg-base)]/80 border border-[var(--border)]">
                <p className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                  {activeChapter.telemetry.stat1.label}
                </p>
                <p className="text-2xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
                  {activeChapter.telemetry.stat1.val}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-base)]/80 border border-[var(--border)]">
                <p className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                  {activeChapter.telemetry.stat2.label}
                </p>
                <p className="text-2xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
                  {activeChapter.telemetry.stat2.val}
                </p>
              </div>
            </div>

            {/* Status ticker at bottom */}
            <div className="mt-4 flex items-center justify-between text-xs font-mono text-[var(--text-muted)] relative z-10">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {activeChapter.telemetry.status}
              </span>
              <span>SYNC_LATENCY: 18ms</span>
            </div>
          </div>
        </div>

        {/* Right Column: Scrubbed Storytelling Chapters */}
        <div className="lg:col-span-6 flex flex-col gap-24 sm:gap-32 py-8">
          {chapters.map((ch, idx) => {
            const isCurrent = activeIdx === idx;

            return (
              <div
                key={ch.id}
                ref={(el) => {
                  chapterRefs.current[idx] = el;
                }}
                className={`transition-all duration-700 rounded-3xl p-6 sm:p-10 border ${
                  isCurrent
                    ? "border-[var(--border-strong)] bg-[var(--bg-surface)]/60 shadow-xl opacity-100 translate-x-0"
                    : "border-transparent bg-transparent opacity-40 hover:opacity-75"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-mono font-bold tracking-widest ${ch.color}`}>
                    {ch.step}
                  </span>
                  <span className="h-1 w-8 rounded-full bg-[var(--border)]" />
                  <span className="text-xs uppercase font-semibold text-[var(--text-muted)]">
                    {ch.badge}
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
                  {ch.title}
                </h3>

                <p className="text-lg font-medium text-[var(--text-secondary)] mb-4 leading-snug">
                  {ch.headline}
                </p>

                <p className="text-base text-[var(--text-muted)] leading-relaxed mb-6 font-light">
                  {ch.description}
                </p>

                {/* Bullets */}
                <div className="space-y-3 mb-8">
                  {ch.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${ch.color} mt-0.5`} />
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Link */}
                <Link
                  href={ch.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] text-sm font-bold text-[var(--text-primary)] transition-all hover:translate-x-1 shadow-sm"
                >
                  {ch.linkText} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
