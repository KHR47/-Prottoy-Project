"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { Button } from "@/components/ui/Button";
import { FileText, ArrowLeft, Loader2, Send } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { getUser } from "@/lib/auth";
import type { Report } from "@/types/report";
import type { User } from "@/types/user";
import { useLanguage } from "@/context/LanguageContext";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, isBangla } = useLanguage();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [currentUser] = useState<User | null>(() => getUser());

  const fetchReport = useCallback(async () => {
    const response = await api.get(`/reports/${params.id}`);
    return response.data as Report;
  }, [params.id]);

  async function loadReport() {
    setReport(await fetchReport());
  }

  useEffect(() => {
    let isActive = true;

    fetchReport()
      .then((nextReport) => {
        if (isActive) setReport(nextReport);
      })
      .catch((error: unknown) => {
        if (isActive) {
          setError(getErrorMessage(error, isBangla ? "রিপোর্ট লোড করতে ব্যর্থ হয়েছে।" : "Could not load report."));
        }
      });

    return () => {
      isActive = false;
    };
  }, [fetchReport, isBangla]);

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommenting(true);
    try {
      await api.post(`/reports/${params.id}/comments`, {
        content: commentContent,
      });
      setCommentContent("");
      await loadReport(); // Reload to get new comments
      toast.success(isBangla ? "মন্তব্য যোগ করা হয়েছে।" : "Comment added.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, isBangla ? "মন্তব্য যোগ করা যায়নি।" : "Could not add comment."));
    } finally {
      setCommenting(false);
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    let reason = '';
    if (newStatus === 'rejected') {
      const promptRes = window.prompt(
        isBangla
          ? "রিপোর্টটি বাতিল করার কারণ লিখুন (নাগরিককে নোটিফিকেশন পাঠানো হবে):"
          : "Please state the reason for rejecting this civic report (citizen will receive notification with reason):"
      );
      if (promptRes === null) return;
      reason = promptRes;
    } else {
      if (!confirm(`Are you sure you want to mark this report as ${newStatus.replace('_', ' ')}?`)) return;
    }

    try {
      await api.patch(`/reports/${params.id}/status`, {
        status: newStatus,
        notes: reason || `Report status updated to ${newStatus.replace('_', ' ')}`,
        rejectionReason: reason || undefined,
      });
      if (newStatus === 'rejected') {
        toast.success(isBangla ? "রিপোর্টটি বাতিল ও মুছে ফেলা হয়েছে এবং নাগরিককে নোটিফিকেশন পাঠানো হয়েছে।" : "Report rejected, removed, and notification sent to author.");
        router.push("/authority/reports");
      } else {
        toast.success(`Report marked as ${newStatus.replace('_', ' ')}`);
        await loadReport();
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not update status."));
    }
  }

  async function handleDeleteReport() {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;

    try {
      await api.delete(`/reports/${params.id}`);
      toast.success("Report deleted successfully");
      router.push("/reports/my");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not delete report."));
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {!error && !report && (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
            Loading report...
          </p>
        )}

        {report && (
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-teal-700">
                  Report #{report.id}
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-950">
                  {report.title}
                </h1>
              </div>
              <div className="flex flex-col items-end gap-3">
                <StatusBadge status={report.status} />

                {/* Citizen Action Buttons */}
                {currentUser && currentUser.role === 'citizen' && report.status === 'submitted' && report.reportedBy?.id === currentUser.id && (
                  <div className="flex flex-wrap justify-end gap-2 mt-2">
                    <Link href={`/reports/${report.id}/edit`} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50">
                      Edit Report
                    </Link>
                    <Button variant="danger" className="px-3 py-1.5 text-xs min-h-8" onClick={handleDeleteReport}>
                      Delete
                    </Button>
                  </div>
                )}

                {/* Authority/Admin Update Approval Button */}
                {currentUser && (currentUser.role === 'admin' || currentUser.role === 'authority') && report.updateRequested && !report.updateAllowed && (
                  <div className="flex flex-wrap justify-end gap-2 mt-2">
                    <Button 
                      className="px-3 py-1.5 text-xs min-h-8 bg-amber-500 hover:bg-amber-600 text-white border-none"
                      onClick={async () => {
                        if (!confirm("Are you sure you want to allow the citizen to update this report?")) return;
                        try {
                          await api.post(`/reports/${report.id}/allow-update`);
                          toast.success("Update permission granted.");
                          await loadReport();
                        } catch (error) {
                          toast.error(getErrorMessage(error, "Could not grant update permission."));
                        }
                      }}
                    >
                      Allow Citizen Update
                    </Button>
                  </div>
                )}

                {/* Status Action Buttons */}
                {currentUser && (
                  (currentUser.role === 'admin' || currentUser.role === 'authority' || currentUser.id === report.assignedOfficer?.id)
                ) && report.status !== 'rejected' && report.status !== 'resolved' && (
                  <div className="flex flex-wrap justify-end gap-2 mt-2">
                    {report.status !== 'in_progress' && (
                      <Button className="px-3 py-1.5 text-xs min-h-8" onClick={() => handleUpdateStatus('in_progress')}>
                        Mark In Progress
                      </Button>
                    )}
                    <Button variant="danger" className="px-3 py-1.5 text-xs min-h-8" onClick={() => handleUpdateStatus('rejected')}>
                      Reject
                    </Button>
                    <Button variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 text-xs min-h-8" onClick={() => handleUpdateStatus('resolved')}>
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-5 text-base leading-7 text-slate-700">
              {report.description}
            </p>

            <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="font-bold text-slate-500">Type</dt>
                <dd className="mt-1 capitalize text-slate-950">
                  {report.type}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="font-bold text-slate-500">Category</dt>
                <dd className="mt-1 text-slate-950">{report.category.name}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="font-bold text-slate-500">Location Area</dt>
                <dd className="mt-1 text-slate-950">{report.upazilaName ? `${report.upazilaName}, ` : ""}{report.districtName}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="font-bold text-slate-500">Priority</dt>
                <dd className="mt-1 capitalize text-slate-950">
                  {report.priority}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="font-bold text-slate-500">Reported By</dt>
                <dd className="mt-1 text-slate-950">
                  {report.isAnonymous ? "Anonymous Citizen" : (report.reportedBy?.name || "Unknown")}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="font-bold text-slate-500">Officer</dt>
                <dd className="mt-1 text-slate-950">
                  {report.assignedOfficer?.name || "Not assigned"}
                </dd>
              </div>
            </dl>

            <p className="mt-5 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              {report.location}
            </p>

            {/* Attachments Section */}
            {report.documents && report.documents.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-black text-slate-950">Attachments</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {report.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={`http://localhost:3001${doc.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 transition group-hover:bg-teal-100 group-hover:text-teal-700">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-bold text-slate-700 transition group-hover:text-teal-700">
                          {doc.originalName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}

        {/* Discussion and Timeline */}
        {report && (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Left Column: Comments */}
            <section className="lg:col-span-2">
              <h2 className="mb-4 text-xl font-black text-slate-950">
                Discussion
              </h2>
              
              <div className="mb-6 space-y-4">
                {report.comments && report.comments.length > 0 ? (
                  report.comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-bold text-slate-950">{comment.author.name}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No comments yet. Start the discussion!</p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Leave a comment
                </label>
                <textarea
                  rows={3}
                  className="mb-3 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Type your message here..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={commenting}>
                    {commenting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </form>
            </section>

            {/* Right Column: Status History */}
            <section>
              <h2 className="mb-4 text-xl font-black text-slate-950">
                Timeline
              </h2>
              <div className="relative ml-3 space-y-6 border-l-2 border-slate-200">
                {report.statusHistory && report.statusHistory.length > 0 ? (
                  report.statusHistory.map((history) => (
                    <div key={history.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white bg-teal-500" />
                      
                      <div className="mb-1">
                        <StatusBadge status={history.status} />
                      </div>
                      <p className="mb-1 text-xs text-slate-500">
                        {new Date(history.createdAt).toLocaleString()}
                      </p>
                      {history.notes && (
                        <p className="text-sm text-slate-700">{history.notes}</p>
                      )}
                      {history.changedBy && (
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          by {history.changedBy.name}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="pl-6 text-sm text-slate-500 italic">No history available.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
