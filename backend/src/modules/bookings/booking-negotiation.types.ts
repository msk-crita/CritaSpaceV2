import { Timestamp } from "firebase-admin/firestore";

export type NegotiationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export interface BookingNegotiation {
  id: string;
  bookingId: string;
  requestedBy: string;
  bookingOwnerId: string;
  boardroomId: string;
  title: string;
  purpose: string;
  requestedStartAt: Timestamp;
  requestedEndAt: Timestamp;
  status: NegotiationStatus;
  message: string;
  respondedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateNegotiationInput {
  bookingId: string;
  title: string;
  purpose: string;
  requestedStartAt: Date;
  requestedEndAt: Date;
  message: string;
}
