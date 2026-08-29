"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Report, ReportStatus } from "@/types/report";
import { ClipboardList, AlertTriangle, CheckCircle, Trash2, ChevronDown } from "lucide-react";
import { AdminCinematicBackground } from "@/components/home/AdminCinematicBackground";

const ALL_STATUSES = ["all", "submitted", "assigned", "in_progress", "resolved", "rejected"] as const;
const STATUS_OPTIONS: ReportStatus[] = ["submitted", "assigned", "in_progress", "resolved", "rejected"];

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-400 ring-slate-500/20",
  medium: "bg-sky-500/20 text-sky-400 ring-sky-500/20",
  high: "bg-amber-500/20 text-amber-400 ring-amber-500/20",
  critical: "bg-rose-500/20 text-rose-400 ring-rose-500/20",
};

function statusLabel(s: string) { return s === "all" ? "All" : s.replace("_", " "); }

export default function AdminReportsPage() {
  const { isReady } = useRequireRole(["admin"]);
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [pendingStatus, setPendingStatus] = useState<Record<number, ReportStatus>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadReports() {
    const r = await api.get("/reports"); setReports(r.data);
  }

  useEffect(() => {
    if (!isReady) return;
    let active = true;
    api.get("/reports").then((r) => { if (active) setReports(r.data); }).catch((e) => setError(getErrorMessage(e, "Could not load reports.")));
    return () => { active = false; };
  }, [isReady]);

  const filtered = useMemo(() => statusFilter === "all" ? reports : reports.filter((r) => r.status === statusFilter), [reports, statusFilter]);
  const total = reports.length, resolved = reports.filter((r) => r.status === "resolved").length;
  const pending = reports.filter((r) => r.status !== "resolved" && r.status !== "rejected").length;
  const critical = reports.filter((r) => r.priority === "critical").length;

  async function handleUpdateStatus(id: number) {
    const status = pendingStatus[id]; if (!status) { setError("Select a status first."); return; }
    setError(""); setMessage("");
    try { await api.patch(`/reports/${id}/status`, { status }); setMessage(`Report #${id} updated to "${statusLabel(status)}".`); await loadReports(); }
    catch (e: unknown) { setError(getErrorMessage(e, "Could not update status.")); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(`Permanently delete Report #${id}? This cannot be undone.`)) return;
    setError(""); setMessage(""); setDeletingId(id);
    try { await api.delete(`/reports/${id}`); setMessage(`Report #${id} deleted.`); await loadReports(); }
    catch (e: unknown) { setError(getErrorMessage(e, "Could not delete report.")); }
    finally { setDeletingId(null); }
  }

  if (!isReady) return null;

  return (
    <div className="min-h-screen relative selection:bg-amber-500/30" style={{ background: 'var(--bg-background)' }}>
      <Navbar />

      {/* Hyperrealistic Animated Executive Admin Matrix Background */}
      <AdminCinematicBackground />

      <div className="relative z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 ring-1 ring-blue-500/40">
                <ClipboardList className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Admin Control</p>
                <h1 className="text-2xl font-black text-white">Report Management</h1>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[{ l: "Total", v: total, c: "text-white" }, { l: "Pending", v: pending, c: "text-amber-400" }, { l: "Resolved", v: resolved, c: "text-emerald-400" }, { l: "Critical", v: critical, c: "text-rose-400" }].map(({ l, v, c }) => (
                <div key={l} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase">{l}</p>
                  <p className={`text-2xl font-black ${c}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {error && <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"><AlertTriangle className="h-4 w-4" />{error}</div>}
        {message && <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"><CheckCircle className="h-4 w-4" />{message}</div>}

        {/* Status Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${statusFilter === s ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30" : "border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}>
              {statusLabel(s)}
              {s !== "all" && <span className="ml-2 text-xs opacity-70">{reports.filter((r) => r.status === s).length}</span>}
            </button>
          ))}
        </div>

        {/* Reports */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="text-slate-400 font-bold">No reports for this filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((report) => (
              <article key={report.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 hover:border-slate-600/50 transition-all">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 font-mono">#{report.id}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ring-1 ring-inset ${priorityColors[report.priority]}`}>{report.priority}</span>
                      <StatusBadge status={report.status} />
                      <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-300 capitalize">{report.type}</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-100">{report.title}</h2>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{report.description}</p>
                    <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { dt: "Citizen", dd: report.isAnonymous ? "Anonymous" : report.reportedBy?.name ?? "—" },
                        { dt: "Category", dd: report.category?.name ?? "—" },
                        { dt: "Area", dd: report.upazilaName ? `${report.upazilaName}, ${report.districtName}` : report.districtName || "—" },
                        { dt: "Officer", dd: report.assignedOfficer?.name ?? "Not assigned" },
                      ].map(({ dt, dd }) => (
                        <div key={dt}>
                          <dt className="text-xs font-bold text-slate-500 uppercase">{dt}</dt>
                          <dd className="mt-0.5 text-slate-300 font-medium">{dd}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 text-xs text-slate-600">Submitted {new Date(report.createdAt).toLocaleDateString()} · {report.location}</p>
                  </div>

                  {/* Actions panel */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Update Status</label>
                      <div className="relative">
                        <select
                          className="h-10 w-full appearance-none rounded-xl border border-slate-600 bg-slate-700 pl-3 pr-8 text-sm font-medium text-slate-200 outline-none transition focus:border-teal-500"
                          value={pendingStatus[report.id] ?? report.status}
                          onChange={(e) => setPendingStatus((p) => ({ ...p, [report.id]: e.target.value as ReportStatus }))}>
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                    <button onClick={() => handleUpdateStatus(report.id)}
                      className="rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2 text-sm font-bold text-white transition">
                      Save Status
                    </button>
                    <button onClick={() => handleDelete(report.id)} disabled={deletingId === report.id}
                      className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 text-sm font-bold text-rose-400 transition disabled:opacity-50">
                      <Trash2 className="h-4 w-4" />{deletingId === report.id ? "Deleting…" : "Delete Report"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
