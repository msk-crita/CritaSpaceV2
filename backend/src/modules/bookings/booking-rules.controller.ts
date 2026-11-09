import { Request, Response } from "express";
import {
  getBookingRules,
  updateBookingRules,
} from "../bookings/booking-rules.service";

// Get Workspace Booking Rules
export const getBookingRulesController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rules = await getBookingRules();

    res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve booking rules";

    res.status(500).json({
      success: false,
      message,
    });
  }
};

// Update Workspace Booking Rules
export const updateBookingRulesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }
    const {
      workspaceTimeZone,
      operatingHours,
      maxAdvanceBookingDays,
      maxBookingDurationHours,
    } = req.body;

    if (
      typeof workspaceTimeZone !== "string" ||
      !workspaceTimeZone.trim() ||
      !operatingHours ||
      typeof operatingHours !== "object" ||
      typeof operatingHours.startTime !== "string" ||
      typeof operatingHours.endTime !== "string" ||
      !Number.isInteger(maxAdvanceBookingDays) ||
      typeof maxBookingDurationHours !== "number"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking rules configuration",
      });
      return;
    }

    const rules = await updateBookingRules(
      {
        workspaceTimeZone,
        operatingHours,
        maxAdvanceBookingDays,
        maxBookingDurationHours,
      },
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Booking rules updated successfully",
      data: rules,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update booking rules";

    res.status(400).json({
      success: false,
      message,
    });
  }
};
