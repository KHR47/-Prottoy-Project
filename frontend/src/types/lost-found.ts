export type LostFoundType = 'LOST' | 'FOUND';
export type LostFoundStatus = 'PENDING' | 'ACTIVE' | 'INSPECTING' | 'FOUND' | 'RETURNED' | 'REJECTED' | 'EXPIRED';

export interface LostFoundItem {
  id: number;
  type: LostFoundType;
  title: string;
  description: string;
  category?: string;
  contact?: string;
  location: string;
  divisionName?: string;
  districtName?: string;
  status: LostFoundStatus;
  images: string[];
  rewardAmount?: number;
  reportedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
  claimedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
  claimMessage?: string | null;
  claimedAt?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}
