import { Request, Response } from "express";
import { getDashboardSummary } from "./dashboard.service";

export const getDashboardSummaryController = async (
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

    const summary = await getDashboardSummary(user);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve dashboard summary";

    res.status(500).json({
      success: false,
      message,
    });
  }
};
