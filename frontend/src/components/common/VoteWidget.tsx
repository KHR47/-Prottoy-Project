"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useOptionalAuth } from "@/hooks/useAuth";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { VotesSummary } from "@/types/comment";

interface VoteWidgetProps {
  targetType: string;
  targetId: number;
  layout?: "vertical" | "horizontal";
}

export function VoteWidget({ targetType, targetId, layout = "vertical" }: VoteWidgetProps) {
  const { user } = useOptionalAuth();
  const [data, setData] = useState<VotesSummary>({
    upvotes: 0,
    downvotes: 0,
    score: 0,
    userVote: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVotes() {
      try {
        const res = await api.get(`/votes?targetType=${targetType}&targetId=${targetId}`);
        setData(res.data);
      } catch (e) {
        // silent fail
      }
    }
    fetchVotes();
  }, [targetType, targetId]);

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast.error("Please log in to vote on this item.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/votes", {
        targetType,
        targetId,
        value,
      });
      setData(res.data);
    } catch (e) {
      toast.error("Failed to submit vote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md ${
        layout === "vertical" ? "flex-col" : "flex-row"
      }`}
    >
      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote(1)}
        className={`p-1.5 rounded-xl transition-all ${
          data.userVote === 1
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
        title="Upvote"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      <span
        className={`text-xs font-mono font-black px-1 ${
          data.score > 0
            ? "text-emerald-400"
            : data.score < 0
            ? "text-rose-400"
            : "text-slate-300"
        }`}
      >
        {data.score > 0 ? `+${data.score}` : data.score}
      </span>

      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote(-1)}
        className={`p-1.5 rounded-xl transition-all ${
          data.userVote === -1
            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
        title="Downvote"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
