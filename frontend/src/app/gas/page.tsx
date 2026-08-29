"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Flame, TrendingUp, Receipt, AlertCircle, PlusCircle } from "lucide-react";
import Link from "next/link";

const citizenGasLinks = [
  {
    href: "/gas/my-usage",
    title: "My Gas Usage",
    text: "View your daily/monthly gas consumption (m³), track trends, and detect unusual spikes.",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    href: "/gas/billing",
    title: "My Bills & Invoices",
    text: "Check your due dates, view invoice history, and manage your payments.",
    icon: Receipt,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    href: "/gas/report-leak",
    title: "Report a Leak",
    text: "Smell gas or suspect a pipe leak? Report it immediately to the authority.",
    icon: AlertCircle,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
  {
    href: "/gas/request-meter",
    title: "Request Line Gas",
    text: "Apply for a new city line gas connection and get your smart meter installed.",
    icon: PlusCircle,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export default function CitizenGasHub() {
  const { isReady, user } = useRequireRole(["citizen"]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-orange-700">Citizen Portal</p>
              <h1 className="text-3xl font-black text-slate-950">Gas Services</h1>
            </div>
          </div>
          <p className="mt-4 text-slate-600 max-w-2xl">
            Welcome to your digital gas services hub, {user?.name}. Track your home's line gas consumption, view your invoices, and help keep our city safe by reporting leaks.
          </p>
        </div>

        {/* Quick Alerts */}
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-4 shadow-sm items-start">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
                <h3 className="font-bold text-amber-900">Safety Notice</h3>
                <p className="text-sm text-amber-700 mt-1">
                    Always ensure proper ventilation. If you smell gas, do not ignite any flames and report it instantly.
                </p>
            </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {citizenGasLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-black text-slate-950 group-hover:text-orange-700 transition-colors">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 flex-1">
                  {item.text}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
