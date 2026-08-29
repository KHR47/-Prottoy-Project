"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useOptionalAuth } from "@/hooks/useAuth";
import { MessageSquare, Send, Reply, Trash2, User, Loader2, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { UniversalCommentItem } from "@/types/comment";
import { useLanguage } from "@/context/LanguageContext";

interface CommentThreadProps {
  targetType: string;
  targetId: number;
  title?: string;
}

export function CommentThread({ targetType, targetId, title = "Community Discussion" }: CommentThreadProps) {
  const { user } = useOptionalAuth();
  const { isBangla } = useLanguage();
  const [comments, setComments] = useState<UniversalCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments?targetType=${targetType}&targetId=${targetId}`);
      setComments(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetType, targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await api.post("/comments", {
        targetType,
        targetId,
        body: newComment,
        parentId: replyToId,
        guestAuthorName: user?.name || guestName || undefined,
      });
      setNewComment("");
      setReplyToId(null);
      toast.success(isBangla ? "মন্তব্য প্রকাশিত হয়েছে।" : "Comment posted.");
      await fetchComments();
    } catch {
      toast.error(isBangla ? "মন্তব্য প্রকাশে ব্যর্থ হয়েছে।" : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/comments/${id}`);
      toast.success(isBangla ? "মন্তব্য মুছে ফেলা হয়েছে।" : "Comment removed.");
      await fetchComments();
    } catch {
      toast.error(isBangla ? "মন্তব্য মুছতে ব্যর্থ হয়েছে।" : "Could not delete comment.");
    }
  };

  const renderRoleBadge = (role?: string) => {
    if (role === "authority") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
          <ShieldCheck className="w-3 h-3" /> {isBangla ? "পৌর কর্তৃপক্ষ" : "Authority"}
        </span>
      );
    }
    if (role === "officer") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
          <ShieldAlert className="w-3 h-3" /> {isBangla ? "ফিল্ড অফিসার" : "Officer"}
        </span>
      );
    }
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
          <Sparkles className="w-3 h-3" /> {isBangla ? "অ্যাডমিন" : "Admin"}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          {title} ({comments.length})
        </h3>
        <span className="text-xs font-mono text-slate-400">{isBangla ? "নাগরিক উন্মুক্ত ফোরাম" : "Open Public Forum"}</span>
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {replyToId && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30">
            <span>{isBangla ? `মন্তব্য #${replyToId}-এর উত্তর দিচ্ছেন` : `Replying to comment #${replyToId}`}</span>
            <button
              type="button"
              onClick={() => setReplyToId(null)}
              className="text-slate-400 hover:text-white"
            >
              {isBangla ? "বাতিল" : "Cancel"}
            </button>
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isBangla ? "মন্তব্য করছেন:" : "Commenting as:"}</span>
            <span className="font-bold text-white">{user.name || user.email}</span>
            {renderRoleBadge(user.role)}
          </div>
        ) : (
          <input
            type="text"
            placeholder={isBangla ? "আপনার নাম / পরিচয় (ঐচ্ছিক)" : "Your name / handle (optional)"}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        )}

        <div className="relative">
          <textarea
            rows={3}
            placeholder={
              user
                ? (isBangla ? "আপনার মতামত, জিজ্ঞাসা বা তথ্য লিখুন..." : "Share updates, ask for clarification, or add notes...")
                : (isBangla ? "নাগরিক মতামত লিখুন..." : "Post a message as a community member...")
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-y"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute bottom-3 right-3 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {isBangla ? "পোস্ট" : "Post"}
          </button>
        </div>
      </form>

      {/* Comment List */}
      {loading ? (
        <div className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs font-mono text-slate-400 text-center py-6">
          {isBangla ? "এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!" : "No comments yet. Be the first to start the discussion!"}
        </p>
      ) : (
        <div className="space-y-4 pt-2">
          {comments.map((c) => {
            const authorName = c.author?.name || c.guestAuthorName || "Citizen";
            const authorRole = c.author?.role;
            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-white">
                      {authorName}
                    </span>
                    {renderRoleBadge(authorRole)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed pl-8 font-light whitespace-pre-wrap">
                  {c.body}
                </p>

                <div className="flex items-center gap-3 pl-8 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setReplyToId(c.id)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 font-mono transition-colors"
                  >
                    <Reply className="w-3 h-3" /> {isBangla ? "উত্তর দিন" : "Reply"}
                  </button>
                  {user && (user.id === c.author?.id || user.role === "admin") && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="inline-flex items-center gap-1 text-rose-400/80 hover:text-rose-400 font-mono transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> {isBangla ? "মুছুন" : "Delete"}
                    </button>
                  )}
                </div>

                {/* Nested Replies */}
                {c.replies && c.replies.length > 0 && (
                  <div className="pl-8 pt-3 space-y-2 border-l border-white/10 ml-4 mt-2">
                    {c.replies.map((reply) => {
                      const replyAuthorName = reply.author?.name || reply.guestAuthorName || "Citizen";
                      const replyRole = reply.author?.role;
                      return (
                        <div key={reply.id} className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                          <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {replyAuthorName}
                              </span>
                              {renderRoleBadge(replyRole)}
                            </div>
                            <span className="font-mono text-slate-400">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{reply.body}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
