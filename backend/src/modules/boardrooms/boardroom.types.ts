import { Timestamp } from "firebase-admin/firestore";

export type BoardroomStatus = "active" | "inactive";

export interface Boardroom {
  id: string;
  name: string;
  description: string;
  capacity: number;
  facilities: string[];
  status: BoardroomStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
