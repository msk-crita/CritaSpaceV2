import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase";
import { UserProfile } from "../users/user.types";
import { validateBookingTimeRange } from "./booking-rules.service";
import {
  BookingNegotiation,
  CreateNegotiationInput,
} from "./booking-negotiation.types";
import { AuditLog } from "../audit-logs/audit.types";

const negotiationsCollection = firestore.collection("booking_negotiations");

const bookingsCollection = firestore.collection("bookings");

const pendingNegotiationIndexes = firestore.collection(
  "booking_negotiation_pending_indexes",
);

import { Booking } from "./booking.types";

export const createBookingNegotiation = async (
  input: CreateNegotiationInput,
  user: UserProfile,
): Promise<BookingNegotiation> => {
  const {
    bookingId,
    title,
    purpose,
    requestedStartAt,
    requestedEndAt,
    message,
  } = input;

  if (!user?.uid) {
    throw new Error("Invalid user profile");
  }

  if (!bookingId?.trim()) {
    throw new Error("Booking ID is required");
  }

  if (!message?.trim() || message.trim().length > 500) {
    throw new Error("A message is required (maximum 500 characters)");
  }

  await validateBookingTimeRange({
    startAt: requestedStartAt,
    endAt: requestedEndAt,
  });

  const bookingSnapshot = await bookingsCollection.doc(bookingId).get();

  if (!bookingSnapshot.exists) {
    throw new Error("Booking not found");
  }

  const booking = bookingSnapshot.data()!;

  if (booking.status !== "confirmed") {
    throw new Error("Only confirmed bookings can receive release requests");
  }

  if (booking.userId === user.uid) {
    throw new Error("You cannot request an early release of your own booking");
  }

  if (
    !(booking.startAt instanceof Timestamp) ||
    !(booking.endAt instanceof Timestamp)
  ) {
    throw new Error("Invalid existing booking time range");
  }

  const existingStart = booking.startAt.toDate();
  const existingEnd = booking.endAt.toDate();

  if (requestedStartAt <= existingStart || requestedStartAt >= existingEnd) {
    throw new Error(
      "Requested start time must fall within the existing booking",
    );
  }

  const boardroomId = booking.boardroomId;

  const boardroomSnapshot = await firestore
    .collection("boardrooms")
    .doc(boardroomId)
    .get();

  if (
    !boardroomSnapshot.exists ||
    boardroomSnapshot.data()?.status !== "active"
  ) {
    throw new Error("Boardroom is not active");
  }

  // Ensure the requested period does not conflict with another booking.
  const [otherBookings, blocks, pendingRequests] = await Promise.all([
    bookingsCollection.where("boardroomId", "==", boardroomId).get(),
    firestore
      .collection("boardroom_blocks")
      .where("boardroomId", "==", boardroomId)
      .get(),
    negotiationsCollection
      .where("bookingId", "==", bookingId)
      .where("requestedBy", "==", user.uid)
      .where("status", "==", "pending")
      .get(),
  ]);

  for (const doc of otherBookings.docs) {
    if (doc.id === bookingId) continue;

    const other = doc.data();

    if (
      other.status !== "confirmed" ||
      !(other.startAt instanceof Timestamp) ||
      !(other.endAt instanceof Timestamp)
    ) {
      continue;
    }

    if (
      requestedStartAt < other.endAt.toDate() &&
      requestedEndAt > other.startAt.toDate()
    ) {
      throw new Error("Requested time conflicts with another booking");
    }
  }

  for (const doc of blocks.docs) {
    const block = doc.data();

    if (
      block.status !== "active" ||
      !(block.startAt instanceof Timestamp) ||
      !(block.endAt instanceof Timestamp)
    ) {
      continue;
    }

    if (
      requestedStartAt < block.endAt.toDate() &&
      requestedEndAt > block.startAt.toDate()
    ) {
      throw new Error("Boardroom is unavailable during the requested time");
    }
  }

  const negotiationRef = negotiationsCollection.doc();
  const now = Timestamp.now();

  const negotiation: BookingNegotiation = {
    id: negotiationRef.id,
    bookingId,
    requestedBy: user.uid,
    bookingOwnerId: booking.userId,
    boardroomId,
    title: title.trim(),
    purpose: purpose.trim(),
    requestedStartAt: Timestamp.fromDate(requestedStartAt),
    requestedEndAt: Timestamp.fromDate(requestedEndAt),
    status: "pending",
    message: message.trim(),
    respondedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const pendingIndexId = `${bookingId}_${user.uid}`;
  const pendingIndexRef = pendingNegotiationIndexes.doc(pendingIndexId);

  await firestore.runTransaction(async (transaction) => {
    const indexSnapshot = await transaction.get(pendingIndexRef);

    if (indexSnapshot.exists) {
      throw new Error("You already have a pending request for this booking");
    }

    transaction.create(pendingIndexRef, {
      negotiationId: negotiationRef.id,
      bookingId,
      requestedBy: user.uid,
      createdAt: now,
    });

    transaction.create(negotiationRef, negotiation);
  });

  return negotiation;
};

export const getIncomingBookingNegotiations = async (
  user: UserProfile,
): Promise<BookingNegotiation[]> => {
  if (!user?.uid) {
    throw new Error("Invalid user profile");
  }

  const snapshot = await negotiationsCollection
    .where("bookingOwnerId", "==", user.uid)
    .where("status", "==", "pending")
    .get();

  return snapshot.docs
    .map((doc) => doc.data() as BookingNegotiation)
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

export const acceptBookingNegotiation = async (
  negotiationId: string,
  user: UserProfile,
): Promise<{
  negotiation: BookingNegotiation;
  releasedBooking: Booking;
  newBooking: Booking | null;
}> => {
  if (!user?.uid) {
    throw new Error("Invalid user profile");
  }

  if (!negotiationId?.trim()) {
    throw new Error("Negotiation ID is required");
  }

  const negotiationRef = negotiationsCollection.doc(negotiationId);
  const now = Timestamp.now();
  const auditLogRef = firestore.collection("audit_logs").doc();

  return firestore.runTransaction(async (transaction) => {
    const negotiationSnapshot = await transaction.get(negotiationRef);

    if (!negotiationSnapshot.exists) {
      throw new Error("Negotiation not found");
    }

    const negotiation = negotiationSnapshot.data() as BookingNegotiation;

    const pendingIndexRef = pendingNegotiationIndexes.doc(
      `${negotiation.bookingId}_${negotiation.requestedBy}`,
    );

    if (negotiation.bookingOwnerId !== user.uid) {
      throw new Error("You are not authorized to respond to this request");
    }

    if (negotiation.status !== "pending") {
      throw new Error("This negotiation is no longer pending");
    }

    if (
      !(negotiation.requestedStartAt instanceof Timestamp) ||
      !(negotiation.requestedEndAt instanceof Timestamp)
    ) {
      throw new Error("Invalid requested booking time");
    }

    const bookingRef = bookingsCollection.doc(negotiation.bookingId);
    const lockRef = firestore
      .collection("boardroom_booking_locks")
      .doc(negotiation.boardroomId);
    const boardroomRef = firestore
      .collection("boardrooms")
      .doc(negotiation.boardroomId);

    const requesterProfileRef = firestore
      .collection("users")
      .doc(negotiation.requestedBy);

    const [
      bookingSnapshot,
      lockSnapshot,
      boardroomSnapshot,
      requesterProfileSnapshot,
    ] = await Promise.all([
      transaction.get(bookingRef),
      transaction.get(lockRef),
      transaction.get(boardroomRef),
      transaction.get(requesterProfileRef),
    ]);

    if (!requesterProfileSnapshot.exists) {
      throw new Error("Requesting user profile not found");
    }

    const requesterProfile = requesterProfileSnapshot.data()!;

    if (requesterProfile.status !== "active") {
      throw new Error("Requesting user is no longer active");
    }

    if (!bookingSnapshot.exists) {
      throw new Error("Original booking not found");
    }

    if (
      !boardroomSnapshot.exists ||
      boardroomSnapshot.data()?.status !== "active"
    ) {
      throw new Error("Boardroom is not active");
    }

    const originalBooking = bookingSnapshot.data() as Booking;

    if (
      originalBooking.status !== "confirmed" ||
      originalBooking.userId !== user.uid
    ) {
      throw new Error("Original booking is no longer valid");
    }

    const requestedStartAt = negotiation.requestedStartAt.toDate();
    const requestedEndAt = negotiation.requestedEndAt.toDate();
    const originalStartAt = originalBooking.startAt.toDate();
    const originalEndAt = originalBooking.endAt.toDate();

    if (
      requestedStartAt <= originalStartAt ||
      requestedStartAt >= originalEndAt
    ) {
      throw new Error(
        "The original booking cannot be shortened for this request",
      );
    }

    if (requestedStartAt <= now.toDate()) {
      transaction.update(negotiationRef, {
        status: "expired",
        respondedAt: now,
        updatedAt: now,
      });

      transaction.delete(pendingIndexRef);

      const historyRef = firestore
        .collection("booking_negotiation_history")
        .doc();

      transaction.create(historyRef, {
        id: historyRef.id,
        negotiationId,
        bookingId: negotiation.bookingId,
        action: "expired",
        actorId: user.uid,
        createdAt: now,
      });

      return {
        negotiation: {
          ...negotiation,
          status: "expired" as const,
          respondedAt: now,
          updatedAt: now,
        },
        releasedBooking: originalBooking,
        newBooking: null,
      };
    }

    await validateBookingTimeRange({
      startAt: requestedStartAt,
      endAt: requestedEndAt,
    });

    const [bookingQuery, blockQuery] = await Promise.all([
      transaction.get(
        bookingsCollection.where("boardroomId", "==", negotiation.boardroomId),
      ),
      transaction.get(
        firestore
          .collection("boardroom_blocks")
          .where("boardroomId", "==", negotiation.boardroomId),
      ),
    ]);

    for (const doc of bookingQuery.docs) {
      if (doc.id === negotiation.bookingId) continue;

      const other = doc.data();

      if (
        other.status !== "confirmed" ||
        !(other.startAt instanceof Timestamp) ||
        !(other.endAt instanceof Timestamp)
      ) {
        continue;
      }

      if (
        requestedStartAt < other.endAt.toDate() &&
        requestedEndAt > other.startAt.toDate()
      ) {
        throw new Error("Requested time conflicts with another booking");
      }
    }

    for (const doc of blockQuery.docs) {
      const block = doc.data();

      if (
        block.status !== "active" ||
        !(block.startAt instanceof Timestamp) ||
        !(block.endAt instanceof Timestamp)
      ) {
        continue;
      }

      if (
        requestedStartAt < block.endAt.toDate() &&
        requestedEndAt > block.startAt.toDate()
      ) {
        throw new Error("Boardroom is unavailable during the requested time");
      }
    }

    const releasedBooking: Booking = {
      ...originalBooking,
      endAt: Timestamp.fromDate(requestedStartAt),
      updatedAt: now,
    };

    const newBookingRef = bookingsCollection.doc();

    const newBooking: Booking = {
      id: newBookingRef.id,
      boardroomId: negotiation.boardroomId,
      userId: negotiation.requestedBy,
      companyId: requesterProfile.companyId ?? null,
      title: negotiation.title,
      purpose: negotiation.purpose,
      startAt: negotiation.requestedStartAt,
      endAt: negotiation.requestedEndAt,
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    };

    const acceptedNegotiation: BookingNegotiation = {
      ...negotiation,
      status: "accepted",
      respondedAt: now,
      updatedAt: now,
    };

    transaction.update(bookingRef, {
      endAt: releasedBooking.endAt,
      updatedAt: now,
    });

    transaction.create(newBookingRef, newBooking);

    transaction.update(negotiationRef, acceptedNegotiation);

    const historyRef = firestore
      .collection("booking_negotiation_history")
      .doc();

    transaction.create(historyRef, {
      id: historyRef.id,
      negotiationId,
      bookingId: negotiation.bookingId,
      newBookingId: newBooking.id,
      action: "accepted",
      actorId: user.uid,
      previousEndAt: originalBooking.endAt,
      updatedEndAt: releasedBooking.endAt,
      createdAt: now,
    });
    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: user.uid,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "booking_negotiation.accepted",
      entityType: "booking_negotiation",
      entityId: negotiationId,
      description: `Accepted early release request for "${originalBooking.title}"`,
      reason: null,
      metadata: {
        originalBookingId: negotiation.bookingId,
        newBookingId: newBooking.id,
        boardroomId: negotiation.boardroomId,
        previousEndAt: originalBooking.endAt,
        updatedEndAt: releasedBooking.endAt,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);

    transaction.set(lockRef, {
      revision: (lockSnapshot.data()?.revision ?? 0) + 1,
      updatedAt: now,
    });

    transaction.delete(pendingIndexRef);

    return {
      negotiation: acceptedNegotiation,
      releasedBooking,
      newBooking,
    };
  });
};

export const declineBookingNegotiation = async (
  negotiationId: string,
  user: UserProfile,
): Promise<BookingNegotiation> => {
  if (!user?.uid) {
    throw new Error("Invalid user profile");
  }

  if (!negotiationId?.trim()) {
    throw new Error("Negotiation ID is required");
  }

  const negotiationRef = negotiationsCollection.doc(negotiationId);
  const now = Timestamp.now();
  const auditLogRef = firestore.collection("audit_logs").doc();

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(negotiationRef);

    if (!snapshot.exists) {
      throw new Error("Negotiation not found");
    }

    const negotiation = snapshot.data() as BookingNegotiation;

    const pendingIndexRef = pendingNegotiationIndexes.doc(
      `${negotiation.bookingId}_${negotiation.requestedBy}`,
    );

    if (negotiation.bookingOwnerId !== user.uid) {
      throw new Error("You are not authorized to respond to this request");
    }

    if (negotiation.status !== "pending") {
      throw new Error("This negotiation is no longer pending");
    }

    if (
      negotiation.requestedStartAt instanceof Timestamp &&
      negotiation.requestedStartAt.toDate() <= now.toDate()
    ) {
      const expiredNegotiation: BookingNegotiation = {
        ...negotiation,
        status: "expired",
        respondedAt: now,
        updatedAt: now,
      };

      transaction.update(negotiationRef, {
        status: "expired",
        respondedAt: now,
        updatedAt: now,
      });

      transaction.delete(pendingIndexRef);

      const historyRef = firestore
        .collection("booking_negotiation_history")
        .doc();

      transaction.create(historyRef, {
        id: historyRef.id,
        negotiationId,
        bookingId: negotiation.bookingId,
        action: "expired",
        actorId: user.uid,
        createdAt: now,
      });
      const auditLog: AuditLog = {
        id: auditLogRef.id,
        actorId: user.uid,
        actorName: user.name,
        actorEmail: user.email,
        actorRole: user.role,
        action: "booking_negotiation.expired",
        entityType: "booking_negotiation",
        entityId: negotiationId,
        description: "Booking release request expired",
        reason: null,
        metadata: {
          bookingId: negotiation.bookingId,
          boardroomId: negotiation.boardroomId,
          requestedBy: negotiation.requestedBy,
        },
        createdAt: now,
      };

      transaction.create(auditLogRef, auditLog);

      return expiredNegotiation;
    }

    const declinedNegotiation: BookingNegotiation = {
      ...negotiation,
      status: "declined",
      respondedAt: now,
      updatedAt: now,
    };

    transaction.update(negotiationRef, {
      status: "declined",
      respondedAt: now,
      updatedAt: now,
    });

    transaction.delete(pendingIndexRef);

    const historyRef = firestore
      .collection("booking_negotiation_history")
      .doc();

    transaction.set(historyRef, {
      id: historyRef.id,
      negotiationId,
      bookingId: negotiation.bookingId,
      action: "declined",
      actorId: user.uid,
      createdAt: now,
    });
    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: user.uid,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "booking_negotiation.declined",
      entityType: "booking_negotiation",
      entityId: negotiationId,
      description: "Booking release request declined",
      reason: null,
      metadata: {
        bookingId: negotiation.bookingId,
        boardroomId: negotiation.boardroomId,
        requestedBy: negotiation.requestedBy,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);

    return declinedNegotiation;
  });
};
