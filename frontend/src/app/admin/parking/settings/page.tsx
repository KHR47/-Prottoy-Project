"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowLeft, Save, Settings, ShieldAlert, CreditCard, Clock, Bell, AlertTriangle } from "lucide-react";

export default function ParkingSystemSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState({
    taxRate: "15",
    gracePeriod: "15",
    maxDuration: "24",
    penaltyRate: "100",
    maintenanceMode: false,
    autoApproveAttendants: true,
    notifyOnViolations: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    // Simulate API save
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--bg-background)" }}>
      <Navbar />
      
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/admin/parking" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-sky-500 hover:text-sky-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-500/10 ring-1 ring-sky-200 dark:ring-sky-500/20 shadow-lg shadow-sky-500/10">
            <Settings className="h-8 w-8 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>System Settings</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Configure global parameters, pricing rules, and platform behavior.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Financial Settings */}
          <div className="rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border-strong)", background: "var(--bg-elevated)" }}>
            <div className="border-b px-6 py-4 flex items-center gap-3" style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)" }}>
              <CreditCard className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Financial & Billing</h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>Platform Tax Rate (%)</label>
                <div className="relative">
                  <input type="number" name="taxRate" value={settings.taxRate} onChange={handleChange} required
                    className="w-full rounded-xl border px-4 py-3 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: "var(--text-muted)" }}>%</span>
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Applied to all parking transactions city-wide.</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>Base Penalty Rate (৳)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: "var(--text-muted)" }}>৳</span>
                  <input type="number" name="penaltyRate" value={settings.penaltyRate} onChange={handleChange} required
                    className="w-full rounded-xl border pl-10 pr-4 py-3 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }} />
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Default fine for parking violations.</p>
              </div>
            </div>
          </div>

          {/* Time Rules */}
          <div className="rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border-strong)", background: "var(--bg-elevated)" }}>
            <div className="border-b px-6 py-4 flex items-center gap-3" style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)" }}>
              <Clock className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Time & Duration Rules</h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>Grace Period (Minutes)</label>
                <input type="number" name="gracePeriod" value={settings.gracePeriod} onChange={handleChange} required
                  className="w-full rounded-xl border px-4 py-3 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }} />
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Free time allowed after booking expiration before penalty.</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>Max Booking Duration (Hours)</label>
                <input type="number" name="maxDuration" value={settings.maxDuration} onChange={handleChange} required
                  className="w-full rounded-xl border px-4 py-3 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  style={{ background: "var(--bg-background)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }} />
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Maximum allowed time for a single continuous booking.</p>
              </div>
            </div>
          </div>

          {/* Platform Controls */}
          <div className="rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border-strong)", background: "var(--bg-elevated)" }}>
            <div className="border-b px-6 py-4 flex items-center gap-3" style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)" }}>
              <ShieldAlert className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Security & Controls</h2>
            </div>
            <div className="p-6 space-y-6">
              <label className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer hover:opacity-80 transition-opacity"
                     style={{ borderColor: "var(--border-strong)", background: "var(--bg-background)" }}>
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${settings.maintenanceMode ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Global Maintenance Mode</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Disables new bookings across all lots immediately.</p>
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                     style={{ background: settings.maintenanceMode ? "transparent" : "var(--border-strong)" }}>
                  <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="peer sr-only" />
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1 shadow-sm'}`} />
                  <div className="absolute inset-0 rounded-full transition-colors pointer-events-none mix-blend-overlay"
                       style={{ background: settings.maintenanceMode ? "rgb(244 63 94 / 0.8)" : "transparent" }}></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer hover:opacity-80 transition-opacity"
                     style={{ borderColor: "var(--border-strong)", background: "var(--bg-background)" }}>
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${settings.notifyOnViolations ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Real-time Violation Alerts</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Send instant notifications to nearest on-ground officers.</p>
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                     style={{ background: settings.notifyOnViolations ? "transparent" : "var(--border-strong)" }}>
                  <input type="checkbox" name="notifyOnViolations" checked={settings.notifyOnViolations} onChange={handleChange} className="peer sr-only" />
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifyOnViolations ? 'translate-x-6' : 'translate-x-1 shadow-sm'}`} />
                  <div className="absolute inset-0 rounded-full transition-colors pointer-events-none mix-blend-overlay"
                       style={{ background: settings.notifyOnViolations ? "rgb(14 165 233 / 0.8)" : "transparent" }}></div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: "var(--border-strong)" }}>
            {success ? (
              <span className="text-sm font-bold text-emerald-500 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Settings saved successfully
              </span>
            ) : (
              <span />
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving...</span>
              ) : (
                <><Save className="h-4 w-4" /> Save Configuration</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
