import { Request, Response } from "express";
import { getBoardroomAvailability } from "./availability.service";

export const getBoardroomAvailabilityController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { boardroomId, startAt, endAt } = req.query;

    if (
      typeof boardroomId !== "string" ||
      typeof startAt !== "string" ||
      typeof endAt !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Boardroom ID, start date and end date are required",
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
        message: "Invalid date format. Use ISO 8601 dates",
      });
      return;
    }

    const availability = await getBoardroomAvailability({
      boardroomId,
      startAt: parsedStartAt,
      endAt: parsedEndAt,
    });

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve boardroom availability";

    const statusCode = message === "Boardroom not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
