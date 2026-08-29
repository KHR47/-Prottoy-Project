"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Report } from "@/types/report";
import { useLanguage } from "@/context/LanguageContext";

const priorityStyles: Record<string, string> = {
  low: "text-slate-400",
  medium: "text-sky-400",
  high: "text-amber-400",
  critical: "text-red-400",
};

export default function MyReportsPage() {
  const { t, isBangla } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(isBangla ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  }

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await api.get("/reports/my");
        setReports(response.data);
      } catch (error: unknown) {
        setError(getErrorMessage(error, isBangla ? "রিপোর্ট লোড করা যায়নি।" : "Could not load reports."));
      }
    }

    loadReports();
  }, [isBangla]);

  async function handleDelete(id: number) {
    if (!confirm(isBangla ? "আপনি কি নিশ্চিতভাবে এই রিপোর্টটি মুছে ফেলতে চান?" : "Are you sure you want to delete this report?")) return;
    try {
      await api.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success(isBangla ? "রিপোর্ট সফলভাবে মুছে ফেলা হয়েছে।" : "Report deleted successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, isBangla ? "রিপোর্ট মোছা যায়নি।" : "Could not delete report."));
    }
  }

  async function handleRequestUpdate(id: number) {
    if (!confirm(isBangla ? "আপনি কি এই রিপোর্টের আপডেট অনুমতির জন্য আবেদন করতে চান?" : "Are you sure you want to request permission to update this assigned report?")) return;
    try {
      await api.post(`/reports/${id}/request-update`);
      setReports((prev) => 
        prev.map((r) => r.id === id ? { ...r, updateRequested: true } : r)
      );
      toast.success(isBangla ? "আপডেট রিকোয়েস্ট পাঠানো হয়েছে।" : "Update request sent to authority!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, isBangla ? "রিকোয়েস্ট পাঠানো যায়নি।" : "Could not request update."));
    }
  }

  const resolvedCount = useMemo(
    () => reports.filter((report) => report.status === "resolved").length,
    [reports],
  );

  const activeCount = reports.length - resolvedCount;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-teal-700">
              Citizen workspace
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              My Reports
            </h1>
          </div>
          <Link
            href="/reports/new"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            New Report
          </Link>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {reports.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Active</p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {activeCount}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Resolved</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {resolvedCount}
            </p>
          </div>
        </section>

        {error && (
          <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {reports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              No reports submitted yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your submitted issues and crime reports will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                        #{report.id}
                      </span>
                      <StatusBadge status={report.status} />
                    </div>
                    <h2 className="text-xl font-black text-slate-950">
                      {report.title}
                    </h2>
                  </div>
                  <p className="text-sm font-semibold text-slate-500">
                    {formatDate(report.createdAt)}
                  </p>
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  {report.description}
                </p>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="font-bold text-slate-500">Category</dt>
                    <dd className="mt-1 text-slate-950">
                      {report.category.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">Location</dt>
                    <dd className="mt-1 text-slate-950">{report.upazilaName ? `${report.upazilaName}, ` : ""}{report.districtName}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">Priority</dt>
                    <dd
                      className={`mt-1 font-black capitalize ${priorityStyles[report.priority]}`}
                    >
                      {report.priority}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">Officer</dt>
                    <dd className="mt-1 text-slate-950">
                      {report.assignedOfficer?.name || "Not assigned"}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {report.location}
                </p>

                <div className="mt-4 flex items-center justify-end gap-4">
                  {report.status === "submitted" && (
                    <>
                      <Link
                        href={`/reports/${report.id}/edit`}
                        className="text-sm font-bold text-slate-500 hover:text-slate-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="text-sm font-bold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {report.status !== "submitted" && (
                    <>
                      {report.updateAllowed ? (
                        <Link
                          href={`/reports/${report.id}/edit`}
                          className="text-sm font-bold text-amber-600 hover:text-amber-800"
                        >
                          Edit (Approved)
                        </Link>
                      ) : report.updateRequested ? (
                        <span className="text-sm font-bold text-slate-400">
                          Update Requested
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestUpdate(report.id)}
                          className="text-sm font-bold text-slate-500 hover:text-slate-800"
                        >
                          Request Update
                        </button>
                      )}
                    </>
                  )}
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
