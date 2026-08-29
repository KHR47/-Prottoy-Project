export interface UniversalCommentItem {
  id: number;
  targetType: string;
  targetId: number;
  body: string;
  guestAuthorName?: string;
  author?: {
    id: number;
    name: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
  } | null;
  parent?: UniversalCommentItem | null;
  replies?: UniversalCommentItem[];
  isModerated: boolean;
  createdAt: string;
}

export interface VotesSummary {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: number;
}
