import { User } from "./user";

export type ReportStatus =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected";

export type Priority = "low" | "medium" | "high" | "critical";

export type ReportType = "civic" | "crime";

export type Division = {
  id: number;
  name: string;
};

export type District = {
  id: number;
  name: string;
};

export type Upazila = {
  id: number;
  name: string;
};

export type Thana = {
  id: number;
  name: string;
};

export type Zone = {
  id: number;
  name: string;
  areaDescription: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: number;
  name: string;
  type: ReportType;
  description?: string | null;
};

export type Comment = {
  id: number;
  content: string;
  author: User;
  createdAt: string;
};

export type StatusHistory = {
  id: number;
  status: ReportStatus;
  notes?: string;
  changedBy?: User;
  createdAt: string;
};

export type Document = {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
};

export type Report = {
  id: number;
  title: string;
  description: string;
  type: ReportType;
  status: ReportStatus;
  priority: Priority;
  location: string;
  latitude?: number;
  longitude?: number;
  divisionName?: string;
  districtName?: string;
  upazilaName?: string;
  category: Category;

  reportedBy?: User;
  isAnonymous?: boolean;
  assignedOfficer?: User | null;
  comments: Comment[];
  statusHistory: StatusHistory[];
  documents: Document[];
  upvoteCount?: number;
  updateRequested?: boolean;
  updateAllowed?: boolean;
  createdAt: string;
  updatedAt: string;
};
