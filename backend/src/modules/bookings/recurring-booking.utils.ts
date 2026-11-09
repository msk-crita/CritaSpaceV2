import {
  RecurrenceType,
  RecurringBookingInput,
} from "./recurring-booking.types";

export const generateRecurrenceDates = (
  input: Pick<
    RecurringBookingInput,
    "startDate" | "endDate" | "recurrenceType" | "interval" | "daysOfWeek"
  >,
): Date[] => {
  const {
    startDate,
    endDate,
    recurrenceType,
    interval,
    daysOfWeek = [],
  } = input;

  if (
    !(startDate instanceof Date) ||
    Number.isNaN(startDate.getTime()) ||
    !(endDate instanceof Date) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error("Valid recurrence start and end dates are required");
  }

  if (startDate > endDate) {
    throw new Error("Recurrence end date must be after start date");
  }

  if (!Number.isInteger(interval) || interval < 1) {
    throw new Error("Recurrence interval must be a positive integer");
  }

  if (!["daily", "weekly"].includes(recurrenceType)) {
    throw new Error("Invalid recurrence type");
  }

  if (daysOfWeek.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new Error("Weekdays must be between 0 and 6");
  }

  const start = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );

  const end = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
  );

  const dates: Date[] = [];
  const oneDay = 24 * 60 * 60 * 1000;

  if (recurrenceType === "daily") {
    for (
      let current = start, dayIndex = 0;
      current <= end;
      current += oneDay, dayIndex++
    ) {
      if (dayIndex % interval === 0) {
        dates.push(new Date(current));
      }
    }

    return dates;
  }

  const selectedDays = daysOfWeek.length
    ? [...new Set(daysOfWeek)]
    : [new Date(start).getUTCDay()];

  for (let current = start; current <= end; current += oneDay) {
    const date = new Date(current);
    const daysSinceStart = Math.floor((current - start) / oneDay);
    const weekIndex = Math.floor(daysSinceStart / 7);

    if (weekIndex % interval === 0 && selectedDays.includes(date.getUTCDay())) {
      dates.push(date);
    }
  }

  return dates;
};

export const createDateInTimeZone = (
  calendarDate: Date,
  time: string,
  timeZone: string,
): Date => {
  if (!(calendarDate instanceof Date) || Number.isNaN(calendarDate.getTime())) {
    throw new Error("Invalid calendar date");
  }

  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    throw new Error("Invalid time format. Use HH:mm");
  }

  const [hours, minutes] = time.split(":").map(Number);

  const targetParts = {
    year: calendarDate.getUTCFullYear(),
    month: calendarDate.getUTCMonth() + 1,
    day: calendarDate.getUTCDate(),
    hour: hours,
    minute: minutes,
  };

  const targetAsUtc = Date.UTC(
    targetParts.year,
    targetParts.month - 1,
    targetParts.day,
    targetParts.hour,
    targetParts.minute,
  );

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  let candidate = targetAsUtc;

  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = formatter.formatToParts(new Date(candidate));

    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    );

    const representedAsUtc = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second,
    );

    const difference = targetAsUtc - representedAsUtc;

    if (difference === 0) {
      return new Date(candidate);
    }

    candidate += difference;
  }

  throw new Error(
    "Unable to resolve this local time in the workspace timezone",
  );
};
