import { Timestamp } from "firebase-admin/firestore";

export type CompanyStatus = "active" | "inactive";

export interface Company {
  id: string;
  name: string;
  status: CompanyStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
