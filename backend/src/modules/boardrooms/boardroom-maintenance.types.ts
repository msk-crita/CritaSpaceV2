import { Timestamp } from "firebase-admin/firestore";

export type BoardroomBlockType = "maintenance" | "unavailable";

export type BoardroomBlockStatus = "active" | "cancelled";

export interface BoardroomBlock {
  id: string;
  boardroomId: string;
  type: BoardroomBlockType;
  reason: string;
  startAt: Timestamp;
  endAt: Timestamp;
  status: BoardroomBlockStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}
