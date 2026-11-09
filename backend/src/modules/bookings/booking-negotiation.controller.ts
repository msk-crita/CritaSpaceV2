import { Request, Response } from "express";
import {
  createBookingNegotiation,
  getIncomingBookingNegotiations,
  acceptBookingNegotiation,
  declineBookingNegotiation,
} from "./booking-negotiation.service";

export const createBookingNegotiationController = async (
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

    const {
      bookingId,
      title,
      purpose,
      requestedStartAt,
      requestedEndAt,
      message,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 120
    ) {
      res.status(400).json({
        message: "Title is required (maximum 120 characters)",
      });
      return;
    }

    if (
      typeof purpose !== "string" ||
      !purpose.trim() ||
      purpose.trim().length > 500
    ) {
      res.status(400).json({
        message: "Purpose is required (maximum 500 characters)",
      });
      return;
    }

    if (
      typeof bookingId !== "string" ||
      typeof requestedStartAt !== "string" ||
      typeof requestedEndAt !== "string" ||
      typeof message !== "string"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Booking ID, requested start time, end time and message are required",
      });
      return;
    }

    const parsedStartAt = new Date(requestedStartAt);
    const parsedEndAt = new Date(requestedEndAt);

    if (
      Number.isNaN(parsedStartAt.getTime()) ||
      Number.isNaN(parsedEndAt.getTime())
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid requested date or time",
      });
      return;
    }

    const negotiation = await createBookingNegotiation(
      {
        bookingId,
        title,
        purpose,
        requestedStartAt: new Date(requestedStartAt),
        requestedEndAt: new Date(requestedEndAt),
        message,
      },
      user,
    );

    res.status(201).json({
      success: true,
      message: "Early release request submitted successfully",
      data: negotiation,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit early release request";

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

export const getIncomingBookingNegotiationsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const negotiations = await getIncomingBookingNegotiations(req.user);

    res.status(200).json({
      message: "Incoming booking requests retrieved successfully",
      data: negotiations,
    });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve incoming booking requests",
    });
  }
};

export const acceptBookingNegotiationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const negotiationId = req.params.negotiationId;

    if (typeof negotiationId !== "string" || !negotiationId.trim()) {
      res.status(400).json({ message: "Negotiation ID is required" });
      return;
    }

    const result = await acceptBookingNegotiation(negotiationId, req.user);

    res.status(200).json({
      message:
        result.negotiation.status === "expired"
          ? "Booking negotiation has expired"
          : "Booking negotiation accepted successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to accept booking negotiation";

    const status =
      message === "Negotiation not found" ||
      message === "Original booking not found"
        ? 404
        : message.includes("not authorized")
          ? 403
          : 400;

    res.status(status).json({ message });
  }
};

export const declineBookingNegotiationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const negotiationId = req.params.negotiationId;

    if (typeof negotiationId !== "string" || !negotiationId.trim()) {
      res.status(400).json({
        message: "Negotiation ID is required",
      });
      return;
    }

    const negotiation = await declineBookingNegotiation(
      negotiationId,
      req.user,
    );

    res.status(200).json({
      message:
        negotiation.status === "expired"
          ? "Booking negotiation has expired"
          : "Booking negotiation declined successfully",
      data: negotiation,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to decline booking negotiation";

    const status =
      message === "Negotiation not found"
        ? 404
        : message.includes("not authorized")
          ? 403
          : 400;

    res.status(status).json({ message });
  }
};
