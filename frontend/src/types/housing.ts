export interface HousingReview {
  id: number;
  rating: number;
  body: string;
  images: string[];
  author?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
}

export interface HousingListing {
  id: number;
  title: string;
  description: string;
  address: string;
  divisionName?: string;
  districtName?: string;
  rent: number;
  rooms: number;
  rentType: string;
  images: string[];
  ratingAvg: number;
  totalReviews: number;
  contactPhone?: string;
  isAvailable: boolean;
  isVerified?: boolean;
  status?: 'PENDING' | 'INSPECTING' | 'APPROVED' | 'REJECTED';
  moderationNotes?: string;
  owner?: {
    id: number;
    name: string;
    email: string;
  } | null;
  reviews?: HousingReview[];
  createdAt: string;
  updatedAt: string;
}
