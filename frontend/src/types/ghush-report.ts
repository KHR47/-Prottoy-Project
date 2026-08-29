export type GhushStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface GhushEvidence {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface GhushReport {
  id: number;
  title: string;
  description: string;
  isAnonymous: boolean;
  status: GhushStatus;
  department?: string;
  amountInvolved?: number;
  incidentDate?: string;
  location?: string;
  divisionName?: string;
  districtName?: string;
  reportedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  verifiedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  reviewNotes?: string;
  verifiedAt?: string;
  evidence: GhushEvidence[];
  createdAt: string;
  updatedAt: string;
}

export interface GhushStats {
  total: number;
  verified: number;
  underReview: number;
  pending: number;
  totalBribeAmount: number;
}
