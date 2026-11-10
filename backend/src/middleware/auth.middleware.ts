import { Request, Response, NextFunction } from "express";
import { firebaseAuth, firestore } from "../config/firebase";
import { UserProfile, UserRole } from "../modules/users/user.types";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
    return;
  }

  let decodedToken;

  try {
    decodedToken = await firebaseAuth.verifyIdToken(token, true);
  } catch (error) {
    const authError = error as {
      code?: string;
      message?: string;
    };

    console.error("Firebase ID token verification failed:", {
      code: authError.code,
      message: authError.message,
    });

    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
    return;
  }

  try {
    // Check Firebase Authentication account status
    const authUser = await firebaseAuth.getUser(decodedToken.uid);

    if (authUser.disabled) {
      res.status(403).json({
        success: false,
        message: "Your Firebase account is disabled",
      });
      return;
    }

    // Retrieve Firestore user profile
    const userDoc = await firestore
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      res.status(403).json({
        success: false,
        message: "User profile not found",
      });
      return;
    }

    const user = userDoc.data() as UserProfile;

    // Validate profile
    if (
      user.uid !== decodedToken.uid ||
      !["global_admin", "user"].includes(user.role) ||
      !["active", "inactive"].includes(user.status)
    ) {
      res.status(403).json({
        success: false,
        message: "Invalid user profile",
      });
      return;
    }

    if (user.status !== "active") {
      res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify your account",
    });
  }
};
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
      return;
    }

    next();
  };
};
