"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Zap, TrendingUp, Receipt, AlertCircle, PlusCircle } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/electricity/my-usage", title: "My Usage", text: "View your monthly kWh consumption, track trends, and get alerts when you exceed your limit.", icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-100" },
  { href: "/electricity/billing", title: "My Bills & Invoices", text: "Check due invoices, view payment history, and pay securely via bKash, Nagad or card.", icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-100" },
  { href: "/electricity/report-outage", title: "Report an Outage", text: "Experiencing a power cut or voltage issue? Report it instantly to the grid authority.", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
  { href: "/electricity/request-meter", title: "Request Smart Meter", text: "Apply for a new digital electricity connection and get a prepaid smart meter installed.", icon: PlusCircle, color: "text-purple-600", bg: "bg-purple-100" },
];

export default function CitizenElectricityHub() {
  const { isReady, user } = useRequireRole(["citizen"]);
  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-white shadow-sm">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-yellow-700">Citizen Portal</p>
              <h1 className="text-3xl font-black text-slate-950">Electricity Services</h1>
            </div>
          </div>
          <p className="mt-4 text-slate-600 max-w-2xl">
            Welcome, {user?.name}. Manage your smart meter, track kWh usage, pay bills, and report outages — all in one place.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-4 shadow-sm items-start">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900">Safety Notice</h3>
            <p className="text-sm text-amber-700 mt-1">
              Never tamper with your electricity meter. In case of a power outage or sparks, immediately report it and stay away from electrical panels.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-yellow-300 hover:shadow-md">
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-black text-slate-950 group-hover:text-yellow-700 transition-colors">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 flex-1">{item.text}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
