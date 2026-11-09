import { firestore } from "../../config/firebase";
import { BookingRules, BookingTimeRange } from "./booking-rules.types";
import { Timestamp } from "firebase-admin/firestore";
import { UserProfile } from "../users/user.types";
import { AuditLog } from "../audit-logs/audit.types";

const bookingRulesRef = firestore
  .collection("workspace_settings")
  .doc("booking_rules");

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const getTimeInMinutes = (time: string): number => {
  const match = TIME_PATTERN.exec(time);

  if (!match) {
    throw new Error("Invalid workspace operating hours configuration");
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

const getWorkspaceDateParts = (
  date: Date,
  timeZone: string,
): { date: string; minutes: number } => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
};

// Retrieve Workspace Booking Rules
export const getBookingRules = async (): Promise<BookingRules> => {
  const settingsDoc = await bookingRulesRef.get();

  if (!settingsDoc.exists) {
    throw new Error("Workspace booking rules have not been configured");
  }

  const data = settingsDoc.data();

  if (!data) {
    throw new Error("Invalid workspace booking rules configuration");
  }

  const rules: BookingRules = {
    workspaceTimeZone: data.workspaceTimeZone,
    operatingHours: {
      startTime: data.operatingHours?.startTime,
      endTime: data.operatingHours?.endTime,
    },
    maxAdvanceBookingDays: data.maxAdvanceBookingDays,
    maxBookingDurationHours: data.maxBookingDurationHours,
  };

  if (
    typeof rules.workspaceTimeZone !== "string" ||
    !rules.workspaceTimeZone.trim() ||
    typeof rules.operatingHours.startTime !== "string" ||
    typeof rules.operatingHours.endTime !== "string" ||
    !Number.isInteger(rules.maxAdvanceBookingDays) ||
    rules.maxAdvanceBookingDays < 1 ||
    !Number.isFinite(rules.maxBookingDurationHours) ||
    rules.maxBookingDurationHours <= 0
  ) {
    throw new Error("Invalid workspace booking rules configuration");
  }

  // Validate timezone and operating hours.
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: rules.workspaceTimeZone,
    });

    const openingMinutes = getTimeInMinutes(rules.operatingHours.startTime);

    const closingMinutes = getTimeInMinutes(rules.operatingHours.endTime);

    if (closingMinutes <= openingMinutes) {
      throw new Error("Invalid workspace operating hours configuration");
    }
  } catch {
    throw new Error("Invalid workspace booking rules configuration");
  }

  return rules;
};

// Validate Booking Time Range
export const validateBookingTimeRange = async (
  input: BookingTimeRange,
): Promise<void> => {
  const rules = await getBookingRules();

  const { startAt, endAt } = input;

  if (
    !(startAt instanceof Date) ||
    !(endAt instanceof Date) ||
    !Number.isFinite(startAt.getTime()) ||
    !Number.isFinite(endAt.getTime())
  ) {
    throw new Error("Invalid booking date or time");
  }

  const now = Date.now();

  if (startAt.getTime() < now) {
    throw new Error("Booking cannot start in the past");
  }

  if (endAt.getTime() <= startAt.getTime()) {
    throw new Error("Booking end time must be later than start time");
  }

  const durationHours =
    (endAt.getTime() - startAt.getTime()) / (60 * 60 * 1000);

  if (durationHours > rules.maxBookingDurationHours) {
    throw new Error(
      `Booking duration cannot exceed ${rules.maxBookingDurationHours} hours`,
    );
  }

  const maximumAdvanceDate =
    now + rules.maxAdvanceBookingDays * 24 * 60 * 60 * 1000;

  if (startAt.getTime() > maximumAdvanceDate) {
    throw new Error(
      `Bookings can only be made ${rules.maxAdvanceBookingDays} days in advance`,
    );
  }

  const startParts = getWorkspaceDateParts(startAt, rules.workspaceTimeZone);

  const endParts = getWorkspaceDateParts(endAt, rules.workspaceTimeZone);

  if (startParts.date !== endParts.date) {
    throw new Error(
      "Booking start and end must fall on the same workspace calendar day",
    );
  }

  const openingMinutes = getTimeInMinutes(rules.operatingHours.startTime);

  const closingMinutes = getTimeInMinutes(rules.operatingHours.endTime);

  if (
    startParts.minutes < openingMinutes ||
    endParts.minutes > closingMinutes
  ) {
    throw new Error("Booking must fall within workspace operating hours");
  }
};

interface BoardroomAvailabilityInput {
  boardroomId: string;
  startAt: Date;
  endAt: Date;
}

export const validateBoardroomAvailability = async (
  input: BoardroomAvailabilityInput,
): Promise<void> => {
  const { boardroomId, startAt, endAt } = input;

  if (!boardroomId.trim()) {
    throw new Error("Boardroom ID is required");
  }

  const boardroomRef = firestore.collection("boardrooms").doc(boardroomId);

  const boardroomDoc = await boardroomRef.get();

  if (!boardroomDoc.exists) {
    throw new Error("Boardroom not found");
  }

  if (boardroomDoc.data()?.status !== "active") {
    throw new Error("This boardroom is currently inactive");
  }

  const startTimestamp = Timestamp.fromDate(startAt);
  const endTimestamp = Timestamp.fromDate(endAt);

  const blocksSnapshot = await firestore
    .collection("boardroom_blocks")
    .where("boardroomId", "==", boardroomId)
    .where("status", "==", "active")
    .get();

  const hasMaintenanceConflict = blocksSnapshot.docs.some((doc) => {
    const block = doc.data();

    return (
      block.startAt.toMillis() < endTimestamp.toMillis() &&
      block.endAt.toMillis() > startTimestamp.toMillis()
    );
  });

  if (hasMaintenanceConflict) {
    throw new Error("This boardroom is unavailable during the selected period");
  }
};

interface UpdateBookingRulesInput {
  workspaceTimeZone: string;
  operatingHours: {
    startTime: string;
    endTime: string;
  };
  maxAdvanceBookingDays: number;
  maxBookingDurationHours: number;
}

export const updateBookingRules = async (
  input: UpdateBookingRulesInput,
  admin: UserProfile,
): Promise<BookingRules> => {
  const {
    workspaceTimeZone,
    operatingHours,
    maxAdvanceBookingDays,
    maxBookingDurationHours,
  } = input;

  if (!workspaceTimeZone.trim()) {
    throw new Error("Workspace timezone is required");
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: workspaceTimeZone,
    });
  } catch {
    throw new Error("Invalid workspace timezone");
  }

  const openingMinutes = getTimeInMinutes(operatingHours.startTime);

  const closingMinutes = getTimeInMinutes(operatingHours.endTime);

  if (closingMinutes <= openingMinutes) {
    throw new Error("Closing time must be later than opening time");
  }

  if (
    !Number.isInteger(maxAdvanceBookingDays) ||
    maxAdvanceBookingDays < 1 ||
    maxAdvanceBookingDays > 30
  ) {
    throw new Error(
      "Maximum advance booking period must be between 1 and 30 days",
    );
  }

  if (
    !Number.isFinite(maxBookingDurationHours) ||
    maxBookingDurationHours <= 0 ||
    maxBookingDurationHours > 8
  ) {
    throw new Error(
      "Maximum booking duration must be greater than 0 and cannot exceed 8 hours",
    );
  }

  const rules: BookingRules = {
    workspaceTimeZone,
    operatingHours,
    maxAdvanceBookingDays,
    maxBookingDurationHours,
  };

  const now = Timestamp.now();
  const auditLogRef = firestore.collection("audit_logs").doc();

  await firestore.runTransaction(async (transaction) => {
    const currentRulesDoc = await transaction.get(bookingRulesRef);
    const previousRules = currentRulesDoc.exists
      ? (currentRulesDoc.data() as BookingRules)
      : null;

    transaction.set(bookingRulesRef, {
      ...rules,
      updatedAt: now,
    });

    const changes: Record<string, unknown> = {};

    if (previousRules) {
      if (previousRules.workspaceTimeZone !== rules.workspaceTimeZone) {
        changes.workspaceTimeZone = {
          previous: previousRules.workspaceTimeZone,
          updated: rules.workspaceTimeZone,
        };
      }

      if (
        previousRules.operatingHours.startTime !==
          rules.operatingHours.startTime ||
        previousRules.operatingHours.endTime !== rules.operatingHours.endTime
      ) {
        changes.operatingHours = {
          previous: previousRules.operatingHours,
          updated: rules.operatingHours,
        };
      }

      if (previousRules.maxAdvanceBookingDays !== rules.maxAdvanceBookingDays) {
        changes.maxAdvanceBookingDays = {
          previous: previousRules.maxAdvanceBookingDays,
          updated: rules.maxAdvanceBookingDays,
        };
      }

      if (
        previousRules.maxBookingDurationHours !== rules.maxBookingDurationHours
      ) {
        changes.maxBookingDurationHours = {
          previous: previousRules.maxBookingDurationHours,
          updated: rules.maxBookingDurationHours,
        };
      }
    }

    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "booking_rules.updated",
      entityType: "booking_rules",
      entityId: "booking_rules",
      description: "Updated workspace booking rules",
      reason: null,
      metadata: {
        changes,
        previousRules,
        updatedRules: rules,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);
  });

  return rules;
};
