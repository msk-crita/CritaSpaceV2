import { Timestamp } from "firebase-admin/firestore";

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  boardroomId: string;
  userId: string;
  companyId: string | null;
  title: string;
  purpose: string;
  startAt: Timestamp;
  endAt: Timestamp;
  status: BookingStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateBookingInput {
  boardroomId: string;
  title: string;
  purpose: string;
  startAt: Date;
  endAt: Date;
}

export interface RescheduleBookingInput {
  bookingId: string;
  startAt: Date;
  endAt: Date;
  reason: string;
}
