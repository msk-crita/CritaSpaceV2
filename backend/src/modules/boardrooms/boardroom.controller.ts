import { Request, Response } from "express";
import {
  createBoardroom,
  getAllBoardrooms,
  getBoardroomById,
  updateBoardroom,
} from "./boardroom.service";

// Create Boardroom
export const createBoardroomController = async (
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

    const { name, description, capacity, facilities } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      !Array.isArray(facilities) ||
      facilities.some((facility: unknown) => typeof facility !== "string")
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom details",
      });
      return;
    }

    const boardroom = await createBoardroom({
      name,
      description,
      capacity,
      facilities,
      createdBy: req.user.uid,
      createdByUser: req.user,
    });

    res.status(201).json({
      success: true,
      message: "Boardroom created successfully",
      data: boardroom,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create boardroom";

    res.status(message.includes("already exists") ? 409 : 400).json({
      success: false,
      message,
    });
  }
};

// Get All Boardrooms
export const getAllBoardroomsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const boardrooms = await getAllBoardrooms();

    res.status(200).json({
      success: true,
      data: boardrooms,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve boardrooms",
    });
  }
};

// Get Boardroom By ID
export const getBoardroomByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const boardroomId = req.params.boardroomId;

    if (typeof boardroomId !== "string" || !boardroomId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom ID",
      });
      return;
    }

    const boardroom = await getBoardroomById(boardroomId);

    if (!boardroom) {
      res.status(404).json({
        success: false,
        message: "Boardroom not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: boardroom,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve boardroom",
    });
  }
};

// Update Boardroom
export const updateBoardroomController = async (
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
    const boardroomId = req.params.boardroomId;

    if (typeof boardroomId !== "string" || !boardroomId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom ID",
      });
      return;
    }

    const { name, description, capacity, facilities, status } = req.body;

    if (
      (name !== undefined && typeof name !== "string") ||
      (description !== undefined && typeof description !== "string") ||
      (capacity !== undefined &&
        (!Number.isInteger(capacity) || capacity < 1)) ||
      (facilities !== undefined &&
        (!Array.isArray(facilities) ||
          facilities.some(
            (facility: unknown) => typeof facility !== "string",
          ))) ||
      (status !== undefined && !["active", "inactive"].includes(status))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom update data",
      });
      return;
    }

    if (
      name === undefined &&
      description === undefined &&
      capacity === undefined &&
      facilities === undefined &&
      status === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
      return;
    }

    const boardroom = await updateBoardroom(
      boardroomId,
      {
        name,
        description,
        capacity,
        facilities,
        status,
      },
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Boardroom updated successfully",
      data: boardroom,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update boardroom";

    const statusCode =
      message === "Boardroom not found"
        ? 404
        : message.includes("already exists")
          ? 409
          : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
