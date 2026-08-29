"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Droplets, TrendingUp, Receipt, AlertCircle, PlusCircle } from "lucide-react";
import Link from "next/link";

const citizenWaterLinks = [
  {
    href: "/water/my-usage",
    title: "My Water Usage",
    text: "View your daily/monthly consumption, track trends, and detect unusual spikes.",
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    href: "/water/billing",
    title: "My Bills & Invoices",
    text: "Check your due dates, view invoice history, and manage your payments.",
    icon: Receipt,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    href: "/water/report-leak",
    title: "Report a Leak",
    text: "Spot a broken pipe? Report it immediately to the authority for quick action.",
    icon: AlertCircle,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
  {
    href: "/water/request-meter",
    title: "Request Meter Connection",
    text: "Apply for a new city water connection and get your smart meter installed.",
    icon: PlusCircle,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export default function CitizenWaterHub() {
  const { isReady, user } = useRequireRole(["citizen"]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Droplets className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-blue-700">Citizen Portal</p>
              <h1 className="text-3xl font-black text-slate-950">Water Services</h1>
            </div>
          </div>
          <p className="mt-4 text-slate-600 max-w-2xl">
            Welcome to your digital water services hub, {user?.name}. Track your home's water consumption, view your invoices, and help keep our city safe by reporting leaks.
          </p>
        </div>



        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {citizenWaterLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-black text-slate-950 group-hover:text-blue-700 transition-colors">
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
