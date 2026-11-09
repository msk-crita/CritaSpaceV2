import { Request, Response } from "express";

export const getCurrentUser = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      uid: user.uid,
      name: user.name,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toDate().toISOString(),
      updatedAt: user.updatedAt.toDate().toISOString(),
    },
  });
};
