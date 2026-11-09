import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase";
import {
  AvailabilityItem,
  BoardroomAvailabilityQuery,
} from "./availability.types";

const bookingsCollection = firestore.collection("bookings");
const blocksCollection = firestore.collection("boardroom_blocks");
const boardroomsCollection = firestore.collection("boardrooms");

const isValidTimestamp = (value: unknown): value is Timestamp =>
  value instanceof Timestamp;

export const getBoardroomAvailability = async (
  query: BoardroomAvailabilityQuery,
): Promise<AvailabilityItem[]> => {
  const { boardroomId, startAt, endAt } = query;

  if (!boardroomId.trim()) {
    throw new Error("Boardroom ID is required");
  }

  if (
    !(startAt instanceof Date) ||
    !(endAt instanceof Date) ||
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    endAt <= startAt
  ) {
    throw new Error("Invalid availability date range");
  }

  const boardroomDoc = await boardroomsCollection.doc(boardroomId).get();

  if (!boardroomDoc.exists) {
    throw new Error("Boardroom not found");
  }

  const boardroom = boardroomDoc.data();

  if (boardroom?.status !== "active") {
    throw new Error("Boardroom is not active");
  }

  const [bookingSnapshot, blockSnapshot] = await Promise.all([
    bookingsCollection.where("boardroomId", "==", boardroomId).get(),
    blocksCollection.where("boardroomId", "==", boardroomId).get(),
  ]);

  const availability: AvailabilityItem[] = [];

  bookingSnapshot.docs.forEach((doc) => {
    const booking = doc.data();

    if (booking.status === "cancelled") {
      return;
    }

    if (
      !isValidTimestamp(booking.startAt) ||
      !isValidTimestamp(booking.endAt)
    ) {
      return;
    }

    const bookingStart = booking.startAt.toDate();
    const bookingEnd = booking.endAt.toDate();

    if (bookingStart < endAt && bookingEnd > startAt) {
      availability.push({
        id: doc.id,
        boardroomId,
        type: "booking",
        title: "Booked",
        startAt: booking.startAt,
        endAt: booking.endAt,
        status: booking.status ?? "unknown",
      });
    }
  });

  blockSnapshot.docs.forEach((doc) => {
    const block = doc.data();

    if (block.status !== "active") {
      return;
    }

    if (!isValidTimestamp(block.startAt) || !isValidTimestamp(block.endAt)) {
      return;
    }

    const blockStart = block.startAt.toDate();
    const blockEnd = block.endAt.toDate();

    if (blockStart < endAt && blockEnd > startAt) {
      availability.push({
        id: doc.id,
        boardroomId,
        type: block.type === "maintenance" ? "maintenance" : "unavailable",
        title: block.type === "maintenance" ? "Maintenance" : "Unavailable",
        startAt: block.startAt,
        endAt: block.endAt,
        status: block.status,
      });
    }
  });

  return availability.sort(
    (a, b) => a.startAt.toMillis() - b.startAt.toMillis(),
  );
};
