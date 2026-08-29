"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { UtilitiesCinematicBackground } from "@/components/home/UtilitiesCinematicBackground";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Droplets, 
  Flame, 
  Zap,
  Activity,
  ChevronRight
} from "lucide-react";

export default function UtilitiesHubPage() {
  const { isReady } = useRequireRole(["citizen"]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden pb-16">
      {/* Hyper-Realistic Animated Smart Utilities Background */}
      <UtilitiesCinematicBackground />

      <Navbar />

      <div className="py-12 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Utility Services</h1>
          </div>
          <p className="text-slate-300 max-w-2xl text-lg">
            Manage your smart home utilities, track resource consumption, and pay your monthly bills securely.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Water */}
          <Link href="/water" className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-200">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">Water Hub</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Manage your water connection, view daily consumption charts, report pipe leaks, and pay your bills.
              </p>
              <div className="mt-auto flex items-center text-blue-600 font-bold text-sm">
                Access Portal <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Gas */}
          <Link href="/gas" className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-orange-200">
                <Flame className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-orange-700 transition-colors">Gas Services</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Track gas usage, report pipe leaks, request a connection, and securely pay your bills.
              </p>
              <div className="mt-auto flex items-center text-orange-600 font-bold text-sm">
                Access Portal <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Electricity */}
          <Link href="/electricity" className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-yellow-300 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="bg-yellow-100 text-yellow-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-yellow-200">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-yellow-700 transition-colors">Electricity</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Monitor smart grid power consumption, view power outage alerts, and pay prepaid tokens.
              </p>
              <div className="mt-auto flex items-center text-yellow-600 font-bold text-sm">
                Access Portal <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </motion.div>
      </main>
    </div>
  );
}
