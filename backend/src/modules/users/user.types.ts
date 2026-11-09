import { Timestamp } from "firebase-admin/firestore";

export type UserRole = "global_admin" | "user";

export type UserStatus = "active" | "inactive";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  companyId: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string | null;
}
