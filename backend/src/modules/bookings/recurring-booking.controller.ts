import { Request, Response } from "express";
import {
  createRecurringBooking,
  getRecurringBookingOccurrences,
  getRecurringBookings,
} from "./recurring-booking.service";
import { RecurrenceType } from "./recurring-booking.types";

export const createRecurringBookingController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
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
      daysOfWeek,
    } = req.body;

    if (
      typeof boardroomId !== "string" ||
      typeof title !== "string" ||
      typeof purpose !== "string" ||
      typeof startDate !== "string" ||
      typeof endDate !== "string" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      !["daily", "weekly"].includes(recurrenceType)
    ) {
      res.status(400).json({
        message: "Invalid recurring booking input",
      });
      return;
    }

    if (!Number.isInteger(interval) || interval < 1) {
      res.status(400).json({
        message: "Recurrence interval must be a positive integer",
      });
      return;
    }

    if (
      daysOfWeek !== undefined &&
      (!Array.isArray(daysOfWeek) ||
        daysOfWeek.some(
          (day: unknown) =>
            !Number.isInteger(day) ||
            (day as number) < 0 ||
            (day as number) > 6,
        ))
    ) {
      res.status(400).json({
        message: "Weekdays must be an array of numbers from 0 to 6",
      });
      return;
    }

    const parsedStartDate = new Date(`${startDate}T00:00:00.000Z`);
    const parsedEndDate = new Date(`${endDate}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      res.status(400).json({
        message: "Invalid recurrence dates",
      });
      return;
    }

    const result = await createRecurringBooking(
      {
        boardroomId,
        title,
        purpose,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        startTime,
        endTime,
        recurrenceType: recurrenceType as RecurrenceType,
        interval,
        daysOfWeek,
      },
      req.user,
    );

    res.status(201).json({
      message: "Recurring booking created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create recurring booking",
    });
  }
};

export const getRecurringBookingOccurrencesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { recurringBookingId } = req.params;

    if (typeof recurringBookingId !== "string" || !recurringBookingId.trim()) {
      res.status(400).json({
        message: "Valid recurring booking ID is required",
      });
      return;
    }

    const result = await getRecurringBookingOccurrences(
      recurringBookingId,
      req.user,
    );

    res.status(200).json({
      message: "Recurring booking occurrences retrieved successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve recurring booking occurrences";

    const statusCode =
      message === "Recurring booking not found"
        ? 404
        : message.includes("not authorized")
          ? 403
          : 400;

    res.status(statusCode).json({ message });
  }
};

export const getRecurringBookingsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const recurringBookings = await getRecurringBookings(req.user);

    res.status(200).json({
      message: "Recurring bookings retrieved successfully",
      data: recurringBookings,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve recurring bookings",
    });
  }
};
