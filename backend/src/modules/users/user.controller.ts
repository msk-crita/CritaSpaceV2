import { Request, Response } from "express";
import { createUserAccount } from "./user.service";
import { UserRole } from "./user.types";

export const createUser = async (
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

    const { name, email, password, companyId, role } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !["user", "global_admin"].includes(role)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid or missing user details",
      });
      return;
    }

    if (companyId !== null && typeof companyId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
      return;
    }

    const user = await createUserAccount({
      name,
      email,
      password,
      companyId,
      role: role as UserRole,
      createdBy: req.user.uid,
      createdByUser: req.user,
    });

    res.status(201).json({
      success: true,
      message: "User account created successfully",
      data: user,
    });
  } catch (error: unknown) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? error.code
        : undefined;

    if (errorCode === "auth/email-already-exists") {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    if (
      message.includes("required") ||
      message.includes("does not exist") ||
      message.includes("cannot be assigned")
    ) {
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    console.error("Create user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create user account",
    });
  }
};
