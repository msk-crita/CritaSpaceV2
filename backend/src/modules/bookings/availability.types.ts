import { Timestamp } from "firebase-admin/firestore";

export interface BoardroomAvailabilityQuery {
  boardroomId: string;
  startAt: Date;
  endAt: Date;
}

export type AvailabilityItemType = "booking" | "maintenance" | "unavailable";

export interface AvailabilityItem {
  id: string;
  boardroomId: string;
  type: AvailabilityItemType;
  title: string;
  startAt: Timestamp;
  endAt: Timestamp;
  status: string;
}
