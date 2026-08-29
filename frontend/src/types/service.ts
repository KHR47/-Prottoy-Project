export interface ServiceReview {
  id: number;
  rating: number;
  body: string;
  author?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
}

export interface ServiceListing {
  id: number;
  name: string;
  category: string;
  details: string;
  contact?: string;
  phone?: string;
  email?: string;
  location: string;
  divisionName?: string;
  districtName?: string;
  status?: 'PENDING' | 'INSPECTING' | 'APPROVED' | 'REJECTED';
  moderationNotes?: string;
  isVerified: boolean;
  trustBadge: string;
  ratingAvg: number;
  totalReviews: number;
  images: string[];
  owner?: {
    id: number;
    name: string;
  } | null;
  reviews?: ServiceReview[];
  createdAt: string;
  updatedAt: string;
}
