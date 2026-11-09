import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase";
import { UserProfile } from "../users/user.types";
import {
  getBookingRules,
  validateBookingTimeRange,
} from "./booking-rules.service";
import {
  RecurringBooking,
  RecurringBookingInput,
  RecurringBookingOccurrence,
} from "./recurring-booking.types";
import {
  createDateInTimeZone,
  generateRecurrenceDates,
} from "./recurring-booking.utils";
import { AuditLog } from "../audit-logs/audit.types";

const recurringBookingsCollection = firestore.collection("recurring_bookings");

const occurrencesCollection = firestore.collection(
  "recurring_booking_occurrences",
);

const bookingsCollection = firestore.collection("bookings");

const boardroomBlocksCollection = firestore.collection("boardroom_blocks");

export interface CreateRecurringBookingResult {
  recurringBooking: RecurringBooking;
  occurrences: RecurringBookingOccurrence[];
}

export const createRecurringBooking = async (
  input: RecurringBookingInput,
  user: UserProfile,
): Promise<CreateRecurringBookingResult> => {
  if (!user?.uid) {
    throw new Error("Invalid user profile");
  }

  const {
    boardroomId,
    title,
    purpose,
    startDate,
    endDate,
    startTime,
    endTime,
    recurrenceType,
    interval,
    daysOfWeek = [],
  } = input;

  if (!boardroomId?.trim()) {
    throw new Error("Boardroom ID is required");
  }

  if (!title?.trim() || title.trim().length > 120) {
    throw new Error("Title is required (maximum 120 characters)");
  }

  if (!purpose?.trim() || purpose.trim().length > 500) {
    throw new Error("Purpose is required (maximum 500 characters)");
  }

  if (!Number.isInteger(interval) || interval < 1) {
    throw new Error("Recurrence interval must be a positive integer");
  }

  const rules = await getBookingRules();

  const dates = generateRecurrenceDates({
    startDate,
    endDate,
    recurrenceType,
    interval,
    daysOfWeek,
  });

  if (dates.length === 0) {
    throw new Error("No recurrence dates were generated");
  }

  const timeZone = rules.workspaceTimeZone;

  const preparedOccurrences = dates.map((date) => {
    const startAt = createDateInTimeZone(date, startTime, timeZone);
    const endAt = createDateInTimeZone(date, endTime, timeZone);

    if (endAt <= startAt) {
      throw new Error("End time must be after start time");
    }

    return { date, startAt, endAt };
  });

  // Validate every occurrence against the workspace booking rules.
  for (const occurrence of preparedOccurrences) {
    await validateBookingTimeRange({
      startAt: occurrence.startAt,
      endAt: occurrence.endAt,
    });
  }

  const recurringBookingRef = recurringBookingsCollection.doc();
  const lockRef = firestore
    .collection("boardroom_booking_locks")
    .doc(boardroomId);

  const boardroomRef = firestore.collection("boardrooms").doc(boardroomId);

  const now = Timestamp.now();
  const auditLogRef = firestore.collection("audit_logs").doc();

  const recurringBooking: RecurringBooking = {
    id: recurringBookingRef.id,
    boardroomId,
    userId: user.uid,
    companyId: user.companyId,
    title: title.trim(),
    purpose: purpose.trim(),
    recurrenceType,
    interval,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
    startTime,
    endTime,
    daysOfWeek: [...new Set(daysOfWeek)],
    createdAt: now,
    updatedAt: now,
    createdBy: user.uid,
  };

  return firestore.runTransaction(async (transaction) => {
    // Read all documents and queries before performing any writes.
    const [lockSnapshot, boardroomSnapshot, bookingQuery, blockQuery] =
      await Promise.all([
        transaction.get(lockRef),
        transaction.get(boardroomRef),
        transaction.get(
          bookingsCollection.where("boardroomId", "==", boardroomId),
        ),
        transaction.get(
          boardroomBlocksCollection.where("boardroomId", "==", boardroomId),
        ),
      ]);

    if (
      !boardroomSnapshot.exists ||
      boardroomSnapshot.data()?.status !== "active"
    ) {
      throw new Error("Boardroom is not active");
    }

    const existingBookings = bookingQuery.docs
      .filter((doc) => doc.data().status === "confirmed")
      .map((doc) => doc.data());

    const activeBlocks = blockQuery.docs
      .filter((doc) => doc.data().status === "active")
      .map((doc) => doc.data());

    const createdOccurrences: RecurringBookingOccurrence[] = [];

    for (const occurrence of preparedOccurrences) {
      let conflictReason: string | null = null;

      const hasBookingConflict = existingBookings.some((booking) => {
        if (
          !(booking.startAt instanceof Timestamp) ||
          !(booking.endAt instanceof Timestamp)
        ) {
          return false;
        }

        return (
          occurrence.startAt < booking.endAt.toDate() &&
          occurrence.endAt > booking.startAt.toDate()
        );
      });

      if (hasBookingConflict) {
        conflictReason = "Conflicts with an existing booking";
      }

      const hasBlockConflict = activeBlocks.some((block) => {
        if (
          !(block.startAt instanceof Timestamp) ||
          !(block.endAt instanceof Timestamp)
        ) {
          return false;
        }

        return (
          occurrence.startAt < block.endAt.toDate() &&
          occurrence.endAt > block.startAt.toDate()
        );
      });

      if (hasBlockConflict) {
        conflictReason = "Boardroom is unavailable during this time";
      }

      const occurrenceRef = occurrencesCollection.doc();
      const bookingRef = bookingsCollection.doc();

      const isAvailable = conflictReason === null;

      const occurrenceRecord: RecurringBookingOccurrence = {
        id: occurrenceRef.id,
        recurringBookingId: recurringBooking.id,
        bookingId: isAvailable ? bookingRef.id : null,
        date: Timestamp.fromDate(occurrence.date),
        startAt: Timestamp.fromDate(occurrence.startAt),
        endAt: Timestamp.fromDate(occurrence.endAt),
        status: isAvailable ? "confirmed" : "conflict",
        conflictReason,
      };

      if (isAvailable) {
        transaction.create(bookingRef, {
          id: bookingRef.id,
          boardroomId,
          userId: user.uid,
          companyId: user.companyId,
          title: title.trim(),
          purpose: purpose.trim(),
          startAt: occurrenceRecord.startAt,
          endAt: occurrenceRecord.endAt,
          status: "confirmed",
          createdAt: now,
          updatedAt: now,
        });

        // Include this occurrence in subsequent conflict checks.
        existingBookings.push({
          startAt: occurrenceRecord.startAt,
          endAt: occurrenceRecord.endAt,
          status: "confirmed",
        });
      }

      transaction.create(occurrenceRef, occurrenceRecord);
      createdOccurrences.push(occurrenceRecord);
    }

    transaction.create(recurringBookingRef, recurringBooking);

    transaction.set(lockRef, {
      revision: (lockSnapshot.data()?.revision ?? 0) + 1,
      updatedAt: now,
    });
    const confirmedCount = createdOccurrences.filter(
      (occurrence) => occurrence.status === "confirmed",
    ).length;

    const conflictCount = createdOccurrences.filter(
      (occurrence) => occurrence.status === "conflict",
    ).length;

    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: user.uid,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "recurring_booking.created",
      entityType: "recurring_booking",
      entityId: recurringBooking.id,
      description: `Created recurring booking series "${recurringBooking.title}"`,
      reason: null,
      metadata: {
        boardroomId,
        recurrenceType,
        interval,
        totalOccurrences: createdOccurrences.length,
        confirmedOccurrences: confirmedCount,
        conflictingOccurrences: conflictCount,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);

    return {
      recurringBooking,
      occurrences: createdOccurrences,
    };
  });
};

export const getRecurringBookingOccurrences = async (
  recurringBookingId: string,
  user: UserProfile,
) => {
  if (!recurringBookingId.trim()) {
    throw new Error("Recurring booking ID is required");
  }

  const recurringBookingRef = firestore
    .collection("recurring_bookings")
    .doc(recurringBookingId);

  const recurringBookingSnapshot = await recurringBookingRef.get();

  if (!recurringBookingSnapshot.exists) {
    throw new Error("Recurring booking not found");
  }

  const recurringBooking = recurringBookingSnapshot.data()!;

  if (user.role !== "global_admin" && recurringBooking.userId !== user.uid) {
    throw new Error("You are not authorized to view this recurring booking");
  }

  const occurrencesSnapshot = await firestore
    .collection("recurring_booking_occurrences")
    .where("recurringBookingId", "==", recurringBookingId)
    .get();

  const occurrences: RecurringBookingOccurrence[] =
    occurrencesSnapshot.docs.map((doc) => ({
      ...(doc.data() as Omit<RecurringBookingOccurrence, "id">),
      id: doc.id,
    }));

  occurrences.sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());

  return {
    recurringBooking: {
      id: recurringBookingSnapshot.id,
      ...recurringBooking,
    },
    occurrences,
    conflicts: occurrences.filter(
      (occurrence) => occurrence.status === "conflict",
    ),
    confirmed: occurrences.filter(
      (occurrence) => occurrence.status === "confirmed",
    ),
  };
};

export const getRecurringBookings = async (user: UserProfile) => {
  const collection = firestore.collection("recurring_bookings");

  const query =
    user.role === "global_admin"
      ? collection
      : collection.where("userId", "==", user.uid);

  const snapshot = await query.get();

  const recurringBookings: RecurringBooking[] = snapshot.docs.map((doc) => ({
    ...(doc.data() as Omit<RecurringBooking, "id">),
    id: doc.id,
  }));

  recurringBookings.sort(
    (a, b) => b.startDate.toMillis() - a.startDate.toMillis(),
  );

  return recurringBookings;
};
