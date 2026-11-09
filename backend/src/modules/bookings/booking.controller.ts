import { Request, Response } from "express";
import {
  createBooking,
  getBookingById,
  getMyBookings,
  getBookingHistory,
  rescheduleBooking,
  cancelBooking,
} from "./booking.service";

export const createBookingController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { boardroomId, title, purpose, startAt, endAt } = req.body;

    if (
      typeof boardroomId !== "string" ||
      typeof title !== "string" ||
      typeof purpose !== "string" ||
      typeof startAt !== "string" ||
      typeof endAt !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
      return;
    }

    const parsedStartAt = new Date(startAt);
    const parsedEndAt = new Date(endAt);

    if (
      Number.isNaN(parsedStartAt.getTime()) ||
      Number.isNaN(parsedEndAt.getTime())
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking date or time",
      });
      return;
    }

    const booking = await createBooking(
      {
        boardroomId,
        title,
        purpose,
        startAt: parsedStartAt,
        endAt: parsedEndAt,
      },
      user,
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create booking";

    const statusCode = message === "Boardroom not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const getBookingByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const bookingId = req.params.bookingId;

    if (typeof bookingId !== "string" || !bookingId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid booking ID is required",
      });
      return;
    }

    const booking = await getBookingById(bookingId, user);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve booking details";

    const statusCode =
      message === "Booking not found"
        ? 404
        : message === "You are not authorized to view this booking"
          ? 403
          : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const getBookingHistoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const bookingId = req.params.bookingId;

    if (typeof bookingId !== "string" || !bookingId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid booking ID is required",
      });
      return;
    }

    const history = await getBookingHistory(bookingId, user);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve booking history";

    const statusCode =
      message === "Booking not found"
        ? 404
        : message.includes("not authorized")
          ? 403
          : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const getMyBookingsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const bookings = await getMyBookings(user);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve your bookings";

    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const rescheduleBookingController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const admin = req.user;

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const bookingId = req.params.bookingId;

    if (typeof bookingId !== "string" || !bookingId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid booking ID is required",
      });
      return;
    }

    const { startAt, endAt, reason } = req.body;

    if (
      typeof startAt !== "string" ||
      typeof endAt !== "string" ||
      typeof reason !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "New start time, end time and reason are required",
      });
      return;
    }

    const parsedStartAt = new Date(startAt);
    const parsedEndAt = new Date(endAt);

    if (
      Number.isNaN(parsedStartAt.getTime()) ||
      Number.isNaN(parsedEndAt.getTime())
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking date or time",
      });
      return;
    }

    const booking = await rescheduleBooking(
      {
        bookingId,
        startAt: parsedStartAt,
        endAt: parsedEndAt,
        reason,
      },
      admin,
    );

    res.status(200).json({
      success: true,
      message: "Booking rescheduled successfully",
      data: booking,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reschedule booking";

    const statusCode =
      message === "Booking not found"
        ? 404
        : message.includes("Only Global Admins") ||
            message.includes("not authorized")
          ? 403
          : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const cancelBookingController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const bookingId = req.params.bookingId;

    if (typeof bookingId !== "string" || !bookingId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid booking ID is required",
      });
      return;
    }

    const { reason } = req.body;

    if (user.role === "global_admin" && typeof reason !== "string") {
      res.status(400).json({
        success: false,
        message: "Cancellation reason is required for Global Admins",
      });
      return;
    }

    if (reason !== undefined && typeof reason !== "string") {
      res.status(400).json({
        success: false,
        message: "Cancellation reason must be a string",
      });
      return;
    }

    const booking = await cancelBooking(bookingId, user, reason);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to cancel booking";

    const statusCode =
      message === "Booking not found"
        ? 404
        : message.includes("not authorized")
          ? 403
          : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
