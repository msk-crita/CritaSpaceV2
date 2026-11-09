import { Timestamp } from "firebase-admin/firestore";

export type RecurrenceType = "daily" | "weekly";

export interface RecurringBookingInput {
  boardroomId: string;
  title: string;
  purpose: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  recurrenceType: RecurrenceType;
  interval: number;
  daysOfWeek?: number[];
}

export interface RecurringBookingOccurrence {
  id: string;
  recurringBookingId: string;
  bookingId: string | null;
  date: Timestamp;
  startAt: Timestamp;
  endAt: Timestamp;
  status: "confirmed" | "conflict";
  conflictReason: string | null;
}

export interface RecurringBooking {
  id: string;
  boardroomId: string;
  userId: string;
  companyId: string | null;
  title: string;
  purpose: string;
  recurrenceType: RecurrenceType;
  interval: number;
  startDate: Timestamp;
  endDate: Timestamp;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
