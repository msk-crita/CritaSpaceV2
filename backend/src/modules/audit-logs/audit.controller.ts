import { Request, Response } from "express";
import { getAuditLogs } from "./audit.service";

export const getAuditLogsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const auditLogs = await getAuditLogs();

    res.status(200).json({
      message: "Audit logs retrieved successfully",
      data: auditLogs,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve audit logs",
    });
  }
};
