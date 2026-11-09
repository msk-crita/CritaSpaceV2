import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase";
import {
  validateBookingTimeRange,
  validateBoardroomAvailability,
} from "./booking-rules.service";
import {
  CreateBookingInput,
  Booking,
  RescheduleBookingInput,
} from "./booking.types";
import { UserProfile } from "../users/user.types";
import { AuditLog } from "../audit-logs/audit.types";

const bookingsCollection = firestore.collection("bookings");

export const createBooking = async (
  input: CreateBookingInput,
  user: UserProfile,
): Promise<Booking> => {
  const { boardroomId, title, purpose, startAt, endAt } = input;

  if (!boardroomId?.trim()) {
    throw new Error("Boardroom ID is required");
  }

  if (!title?.trim() || title.trim().length > 120) {
    throw new Error(
      "Booking title is required and must not exceed 120 characters",
    );
  }

  if (!purpose?.trim() || purpose.trim().length > 500) {
    throw new Error(
      "Booking purpose is required and must not exceed 500 characters",
    );
  }

  if (!user?.uid || (!user.companyId && user.role !== "global_admin")) {
    throw new Error("Invalid user profile for booking");
  }

  await validateBookingTimeRange({ startAt, endAt });

  await validateBoardroomAvailability({
    boardroomId,
    startAt,
    endAt,
  });

  const bookingRef = bookingsCollection.doc();
  const auditLogRef = firestore.collection("audit_logs").doc();
  const lockRef = firestore
    .collection("boardroom_booking_locks")
    .doc(boardroomId);
  const boardroomRef = firestore.collection("boardrooms").doc(boardroomId);

  const now = Timestamp.now();

  const booking: Booking = {
    id: bookingRef.id,
    boardroomId,
    userId: user.uid,
    companyId: user.companyId,
    title: title.trim(),
    purpose: purpose.trim(),
    startAt: Timestamp.fromDate(startAt),
    endAt: Timestamp.fromDate(endAt),
    status: "confirmed",
    createdAt: now,
    updatedAt: now,
  };

  await firestore.runTransaction(async (transaction) => {
    // Read the per-boardroom lock first.
    const lockSnapshot = await transaction.get(lockRef);

    const boardroomSnapshot = await transaction.get(boardroomRef);

    if (!boardroomSnapshot.exists) {
      throw new Error("Boardroom not found");
    }

    if (boardroomSnapshot.data()?.status !== "active") {
      throw new Error("Boardroom is not active");
    }

    const bookingQuery = bookingsCollection.where(
      "boardroomId",
      "==",
      boardroomId,
    );

    const blockQuery = firestore
      .collection("boardroom_blocks")
      .where("boardroomId", "==", boardroomId);

    const existingBookings = await transaction.get(bookingQuery);
    const existingBlocks = await transaction.get(blockQuery);

    // Check existing confirmed bookings.
    for (const doc of existingBookings.docs) {
      const existing = doc.data();

      if (
        existing.status !== "confirmed" ||
        !(existing.startAt instanceof Timestamp) ||
        !(existing.endAt instanceof Timestamp)
      ) {
        continue;
      }

      const existingStart = existing.startAt.toDate();
      const existingEnd = existing.endAt.toDate();

      if (startAt < existingEnd && endAt > existingStart) {
        throw new Error("Boardroom is already booked for this time");
      }
    }

    // Check active maintenance and unavailable periods.
    for (const doc of existingBlocks.docs) {
      const block = doc.data();

      if (
        block.status !== "active" ||
        !(block.startAt instanceof Timestamp) ||
        !(block.endAt instanceof Timestamp)
      ) {
        continue;
      }

      const blockStart = block.startAt.toDate();
      const blockEnd = block.endAt.toDate();

      if (startAt < blockEnd && endAt > blockStart) {
        throw new Error("Boardroom is unavailable during the requested time");
      }
    }

    // Update the lock so concurrent requests for this room conflict.
    const currentRevision =
      typeof lockSnapshot.data()?.revision === "number"
        ? lockSnapshot.data()!.revision
        : 0;

    transaction.set(lockRef, {
      revision: currentRevision + 1,
      updatedAt: now,
    });

    // Create the booking in the same transaction.
    transaction.create(bookingRef, booking);
    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: user.uid,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "booking.created",
      entityType: "booking",
      entityId: bookingRef.id,
      description: `Created booking "${booking.title}"`,
      reason: null,
      metadata: {
        boardroomId,
        title: booking.title,
        startAt: booking.startAt,
        endAt: booking.endAt,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);
  });

  return booking;
};

export const getBookingById = async (
  bookingId: string,
  user: UserProfile,
): Promise<Booking> => {
  if (!bookingId?.trim()) {
    throw new Error("Booking ID is required");
  }

  const bookingDoc = await bookingsCollection.doc(bookingId).get();

  if (!bookingDoc.exists) {
    throw new Error("Booking not found");
  }

  const booking = bookingDoc.data() as Booking;

  if (user.role !== "global_admin" && booking.userId !== user.uid) {
    throw new Error("You are not authorized to view this booking");
  }

  return booking;
};

export const getMyBookings = async (user: UserProfile): Promise<Booking[]> => {
  if (!user?.uid) {
    throw new Error("Invalid user profile");
  }

  const snapshot = await bookingsCollection
    .where("userId", "==", user.uid)
    .get();

  const bookings: Booking[] = snapshot.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id,
      }) as Booking,
  );

  return bookings.sort((a, b) => b.startAt.toMillis() - a.startAt.toMillis());
};

type BookingHistoryEntry = {
  id: string;
  action: "rescheduled" | "cancelled";
  createdAt: Timestamp;
  [key: string]: unknown;
};

export const getBookingHistory = async (
  bookingId: string,
  user: UserProfile,
): Promise<BookingHistoryEntry[]> => {
  if (!bookingId?.trim()) {
    throw new Error("Booking ID is required");
  }

  await getBookingById(bookingId, user);

  const [rescheduleSnapshot, cancellationSnapshot] = await Promise.all([
    firestore
      .collection("booking_reschedule_history")
      .where("bookingId", "==", bookingId)
      .get(),

    firestore
      .collection("booking_cancellation_history")
      .where("bookingId", "==", bookingId)
      .get(),
  ]);

  const rescheduleHistory: BookingHistoryEntry[] = rescheduleSnapshot.docs.map(
    (doc) => ({
      ...doc.data(),
      id: doc.id,
      action: "rescheduled",
    }),
  ) as BookingHistoryEntry[];

  const cancellationHistory: BookingHistoryEntry[] =
    cancellationSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      action: "cancelled",
    })) as BookingHistoryEntry[];

  return [...rescheduleHistory, ...cancellationHistory].sort(
    (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
  );
};

export const rescheduleBooking = async (
  input: RescheduleBookingInput,
  admin: UserProfile,
): Promise<Booking> => {
  const { bookingId, startAt, endAt, reason } = input;

  if (admin.role !== "global_admin") {
    throw new Error("Only Global Admins can reschedule bookings");
  }

  if (!bookingId?.trim()) {
    throw new Error("Booking ID is required");
  }

  if (!reason?.trim() || reason.trim().length > 500) {
    throw new Error(
      "A rescheduling reason is required (maximum 500 characters)",
    );
  }

  await validateBookingTimeRange({ startAt, endAt });

  const bookingRef = bookingsCollection.doc(bookingId);
  const historyRef = firestore.collection("booking_reschedule_history").doc();
  const auditLogRef = firestore.collection("audit_logs").doc();

  let updatedBooking: Booking | null = null;

  await firestore.runTransaction(async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);

    if (!bookingSnapshot.exists) {
      throw new Error("Booking not found");
    }

    const existing = bookingSnapshot.data() as Booking;

    if (existing.status !== "confirmed") {
      throw new Error("Only confirmed bookings can be rescheduled");
    }

    const boardroomId = existing.boardroomId;

    const lockRef = firestore
      .collection("boardroom_booking_locks")
      .doc(boardroomId);

    const boardroomRef = firestore.collection("boardrooms").doc(boardroomId);

    const lockSnapshot = await transaction.get(lockRef);
    const boardroomSnapshot = await transaction.get(boardroomRef);

    if (
      !boardroomSnapshot.exists ||
      boardroomSnapshot.data()?.status !== "active"
    ) {
      throw new Error("Boardroom is not active");
    }

    const bookingQuery = bookingsCollection.where(
      "boardroomId",
      "==",
      boardroomId,
    );

    const blockQuery = firestore
      .collection("boardroom_blocks")
      .where("boardroomId", "==", boardroomId);

    const [existingBookings, existingBlocks] = await Promise.all([
      transaction.get(bookingQuery),
      transaction.get(blockQuery),
    ]);

    for (const doc of existingBookings.docs) {
      if (doc.id === bookingId) continue;

      const other = doc.data();

      if (
        other.status !== "confirmed" ||
        !(other.startAt instanceof Timestamp) ||
        !(other.endAt instanceof Timestamp)
      ) {
        continue;
      }

      if (startAt < other.endAt.toDate() && endAt > other.startAt.toDate()) {
        throw new Error("Boardroom is already booked for this time");
      }
    }

    for (const doc of existingBlocks.docs) {
      const block = doc.data();

      if (
        block.status !== "active" ||
        !(block.startAt instanceof Timestamp) ||
        !(block.endAt instanceof Timestamp)
      ) {
        continue;
      }

      if (startAt < block.endAt.toDate() && endAt > block.startAt.toDate()) {
        throw new Error("Boardroom is unavailable during the requested time");
      }
    }

    const now = Timestamp.now();

    updatedBooking = {
      ...existing,
      startAt: Timestamp.fromDate(startAt),
      endAt: Timestamp.fromDate(endAt),
      updatedAt: now,
    };

    const currentRevision =
      typeof lockSnapshot.data()?.revision === "number"
        ? lockSnapshot.data()!.revision
        : 0;

    transaction.set(lockRef, {
      revision: currentRevision + 1,
      updatedAt: now,
    });

    transaction.update(bookingRef, {
      startAt: Timestamp.fromDate(startAt),
      endAt: Timestamp.fromDate(endAt),
      updatedAt: now,
    });

    transaction.create(historyRef, {
      bookingId,
      boardroomId,
      previousStartAt: existing.startAt,
      previousEndAt: existing.endAt,
      newStartAt: Timestamp.fromDate(startAt),
      newEndAt: Timestamp.fromDate(endAt),
      reason: reason.trim(),
      action: "rescheduled",
      performedBy: admin.uid,
      createdAt: now,
    });
    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "booking.rescheduled",
      entityType: "booking",
      entityId: bookingId,
      description: `Rescheduled booking "${existing.title}"`,
      reason: reason.trim(),
      metadata: {
        boardroomId,
        previousStartAt: existing.startAt,
        previousEndAt: existing.endAt,
        newStartAt: Timestamp.fromDate(startAt),
        newEndAt: Timestamp.fromDate(endAt),
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);
  });

  if (!updatedBooking) {
    throw new Error("Unable to reschedule booking");
  }

  return updatedBooking;
};

export const cancelBooking = async (
  bookingId: string,
  user: UserProfile,
  reason?: string,
): Promise<Booking> => {
  if (!bookingId?.trim()) {
    throw new Error("Booking ID is required");
  }

  if (!user?.uid) {
    throw new Error("Invalid user profile");
  }

  if (
    user.role === "global_admin" &&
    (!reason?.trim() || reason.trim().length > 500)
  ) {
    throw new Error(
      "Global Admin cancellation requires a reason (maximum 500 characters)",
    );
  }

  const bookingRef = bookingsCollection.doc(bookingId);
  const historyRef = firestore.collection("booking_cancellation_history").doc();
  const auditLogRef = firestore.collection("audit_logs").doc();

  let cancelledBooking: Booking | null = null;

  await firestore.runTransaction(async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);

    if (!bookingSnapshot.exists) {
      throw new Error("Booking not found");
    }

    const existing = bookingSnapshot.data() as Booking;

    if (user.role !== "global_admin" && existing.userId !== user.uid) {
      throw new Error("You are not authorized to cancel this booking");
    }

    if (existing.status !== "confirmed") {
      throw new Error("Only confirmed bookings can be cancelled");
    }

    const lockRef = firestore
      .collection("boardroom_booking_locks")
      .doc(existing.boardroomId);

    const lockSnapshot = await transaction.get(lockRef);

    const now = Timestamp.now();

    const currentRevision =
      typeof lockSnapshot.data()?.revision === "number"
        ? lockSnapshot.data()!.revision
        : 0;

    cancelledBooking = {
      ...existing,
      status: "cancelled",
      updatedAt: now,
    };

    transaction.set(lockRef, {
      revision: currentRevision + 1,
      updatedAt: now,
    });

    transaction.update(bookingRef, {
      status: "cancelled",
      updatedAt: now,
    });

    transaction.create(historyRef, {
      bookingId,
      boardroomId: existing.boardroomId,
      cancelledBy: user.uid,
      cancelledByRole: user.role,
      reason: reason?.trim() || null,
      createdAt: now,
    });
    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: user.uid,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "booking.cancelled",
      entityType: "booking",
      entityId: bookingId,
      description: `Cancelled booking "${existing.title}"`,
      reason: reason?.trim() || null,
      metadata: {
        boardroomId: existing.boardroomId,
        previousStatus: existing.status,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);
  });

  if (!cancelledBooking) {
    throw new Error("Unable to cancel booking");
  }

  return cancelledBooking;
};
