import { Request, Response } from "express";
import {
  cancelBoardroomBlock,
  createBoardroomBlock,
  getBoardroomBlocks,
  getBoardroomBlockById,
  updateBoardroomBlock,
} from "./boardroom-maintenance.service";

const isValidBlockType = (type: unknown): boolean => {
  return type === "maintenance" || type === "unavailable";
};

// Create Maintenance / Availability Block
export const createBoardroomBlockController = async (
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

    const { boardroomId, type, reason, startAt, endAt } = req.body;

    if (
      typeof boardroomId !== "string" ||
      !boardroomId.trim() ||
      !isValidBlockType(type) ||
      typeof reason !== "string" ||
      !reason.trim() ||
      typeof startAt !== "string" ||
      typeof endAt !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom block details",
      });
      return;
    }

    const block = await createBoardroomBlock({
      boardroomId,
      type,
      reason,
      startAt,
      endAt,
      createdBy: req.user.uid,
      createdByUser: req.user,
    });

    res.status(201).json({
      success: true,
      message: "Boardroom block created successfully",
      data: block,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create boardroom block";

    const statusCode =
      message === "Boardroom not found"
        ? 404
        : message.includes("overlaps")
          ? 409
          : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// Get All Blocks for a Boardroom
export const getBoardroomBlocksController = async (
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

    const blocks = await getBoardroomBlocks(boardroomId);

    res.status(200).json({
      success: true,
      data: blocks,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve boardroom blocks";

    res.status(message === "Boardroom not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
};

// Get Block by ID
export const getBoardroomBlockByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const blockId = req.params.blockId;

    if (typeof blockId !== "string" || !blockId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom block ID",
      });
      return;
    }

    const block = await getBoardroomBlockById(blockId);

    if (!block) {
      res.status(404).json({
        success: false,
        message: "Boardroom block not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: block,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve boardroom block",
    });
  }
};

// Update an Active Block
export const updateBoardroomBlockController = async (
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

    const blockId = req.params.blockId;

    if (typeof blockId !== "string" || !blockId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom block ID",
      });
      return;
    }

    const { type, reason, startAt, endAt } = req.body;

    if (
      (type !== undefined && !isValidBlockType(type)) ||
      (reason !== undefined &&
        (typeof reason !== "string" || !reason.trim())) ||
      (startAt !== undefined && typeof startAt !== "string") ||
      (endAt !== undefined && typeof endAt !== "string")
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom block update data",
      });
      return;
    }

    if (
      type === undefined &&
      reason === undefined &&
      startAt === undefined &&
      endAt === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
      return;
    }

    const block = await updateBoardroomBlock(
      blockId,
      { type, reason, startAt, endAt },
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Boardroom block updated successfully",
      data: block,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update boardroom block";

    const statusCode =
      message === "Boardroom block not found" ||
      message === "Boardroom not found"
        ? 404
        : message.includes("overlaps")
          ? 409
          : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// Cancel a Block
export const cancelBoardroomBlockController = async (
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

    const blockId = req.params.blockId;

    if (typeof blockId !== "string" || !blockId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid boardroom block ID",
      });
      return;
    }

    const block = await cancelBoardroomBlock(blockId, req.user);

    res.status(200).json({
      success: true,
      message: "Boardroom block cancelled successfully",
      data: block,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to cancel boardroom block";

    res.status(message === "Boardroom block not found" ? 404 : 400).json({
      success: false,
      message,
    });
  }
};
