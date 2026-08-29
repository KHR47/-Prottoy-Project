"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Report, ReportStatus } from "@/types/report";

const statusOptions: ReportStatus[] = [
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
];

const selectClass =
  "h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100";

export default function OfficerReportsPage() {
  const { isReady } = useRequireRole(["officer"]);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchAssignedReports() {
    const response = await api.get("/reports/assigned/my");
    return response.data;
  }

  async function loadReports() {
    const assignedReports = await fetchAssignedReports();
    setReports(assignedReports);
  }

  useEffect(() => {
    if (!isReady) return;

    let isActive = true;

    async function run() {
      try {
        const assignedReports = await fetchAssignedReports();

        if (isActive) {
          setReports(assignedReports);
        }
      } catch (error: unknown) {
        if (isActive) {
          setError(getErrorMessage(error, "Could not load assigned reports."));
        }
      }
    }

    void run();

    return () => {
      isActive = false;
    };
  }, [isReady]);

  const activeCount = useMemo(
    () => reports.filter((report) => report.status !== "resolved").length,
    [reports],
  );

  async function updateStatus(reportId: number, status: ReportStatus) {
    setError("");
    setMessage("");

    try {
      await api.patch(`/reports/${reportId}/status`, {
        status,
      });

      setMessage("Status updated successfully.");
      await loadReports();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Status update failed."));
    }
  }

  if (!isReady) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-teal-700">
              Field officer
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Assigned Reports
            </h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">
                Assigned to you
              </p>
              <p className="text-3xl font-black text-slate-950">
                {reports.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">
                Active
              </p>
              <p className="text-3xl font-black text-amber-700">
                {activeCount}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </p>
        )}

        {reports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              No assigned reports yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Assigned reports will appear after an authority selects you.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase text-teal-700">
                        {report.category.name}
                      </span>
                      <StatusBadge status={report.status} />
                    </div>
                    <h2 className="text-xl font-black text-slate-950">
                      {report.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {report.description}
                    </p>
                  </div>

                  <select
                    className={selectClass}
                    value={report.status}
                    onChange={(event) =>
                      updateStatus(
                        report.id,
                        event.target.value as ReportStatus,
                      )
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="font-bold text-slate-500">Citizen</dt>
                    <dd className="mt-1 text-slate-950">
                      {report.isAnonymous ? "Anonymous" : (report.reportedBy?.name || "Unknown")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">Area</dt>
                    <dd className="mt-1 text-slate-950">{report.upazilaName ? `${report.upazilaName}, ` : ""}{report.districtName}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">Priority</dt>
                    <dd className="mt-1 capitalize text-slate-950">
                      {report.priority}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">Address</dt>
                    <dd className="mt-1 text-slate-950">{report.location}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/reports/${report.id}`}
                    className="text-sm font-bold text-teal-700 hover:text-teal-800"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

