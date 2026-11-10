import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase";
import { UserProfile } from "../users/user.types";
import { getBookingRules } from "../bookings/booking-rules.service";

const getDateKey = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

export const getDashboardSummary = async (user: UserProfile) => {
  if (!user?.uid) {
    throw new Error("Invalid user profile");
  }

  const isGlobalAdmin = user.role === "global_admin";
  const now = Timestamp.now();
  const rules = await getBookingRules();
  const todayKey = getDateKey(now.toDate(), rules.workspaceTimeZone);

  const [
    boardroomsSnapshot,
    bookingsSnapshot,
    companiesSnapshot,
    usersSnapshot,
    negotiationsSnapshot,
    blocksSnapshot,
  ] = await Promise.all([
    firestore.collection("boardrooms").get(),
    firestore.collection("bookings").get(),
    isGlobalAdmin
      ? firestore.collection("companies").get()
      : Promise.resolve(null),
    isGlobalAdmin ? firestore.collection("users").get() : Promise.resolve(null),
    firestore.collection("booking_negotiations").get(),
    firestore.collection("boardroom_blocks").get(),
  ]);

  type DashboardBooking = {
    id: string;
    status?: string;
    userId?: string;
    startAt: Timestamp;
    endAt: Timestamp;
  };

  const bookings: DashboardBooking[] = bookingsSnapshot.docs
    .map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as DashboardBooking,
    )
    .filter(
      (booking) =>
        booking.status === "confirmed" &&
        (isGlobalAdmin || booking.userId === user.uid) &&
        booking.startAt instanceof Timestamp &&
        booking.endAt instanceof Timestamp,
    );

  const todayBookings = bookings.filter(
    (booking) =>
      getDateKey(booking.startAt.toDate(), rules.workspaceTimeZone) ===
      todayKey,
  );

  const upcomingBookings = bookings.filter(
    (booking) => booking.startAt.toMillis() >= now.toMillis(),
  );

  const upcomingBookingRecords = [...upcomingBookings]
    .sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis())
    .slice(0, 5);

  const activeBoardrooms = boardroomsSnapshot.docs.filter(
    (doc) => doc.data().status === "active",
  );

  const pendingNegotiations = negotiationsSnapshot.docs.filter(
    (doc) =>
      doc.data().status === "pending" &&
      (isGlobalAdmin || doc.data().bookingOwnerId === user.uid),
  );

  const activeBlocks = blocksSnapshot.docs.filter(
    (doc) => doc.data().status === "active",
  );

  return {
    generatedAt: now,
    boardrooms: {
      total: boardroomsSnapshot.size,
      active: activeBoardrooms.length,
      items: activeBoardrooms.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    },

    bookings: {
      today: todayBookings.length,
      upcoming: upcomingBookings.length,
      upcomingItems: upcomingBookingRecords,
    },
    negotiations: {
      pending: pendingNegotiations.length,
    },
    maintenance: {
      activeBlocks: activeBlocks.length,
    },
    ...(isGlobalAdmin && {
      companies: {
        total: companiesSnapshot?.size ?? 0,
        active:
          companiesSnapshot?.docs.filter(
            (doc) => doc.data().status === "active",
          ).length ?? 0,
      },
      users: {
        total: usersSnapshot?.size ?? 0,
        active:
          usersSnapshot?.docs.filter((doc) => doc.data().status === "active")
            .length ?? 0,
      },
    }),
  };
};
