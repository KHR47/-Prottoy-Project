export type Role =
  | "citizen"
  | "officer"
  | "authority"
  | "admin"
  | "driver"
  | "attendant"
  | "guest";


export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  district?: string | null;
  role: Role;
  badgeNumber?: string | null;
  zoneId?: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
