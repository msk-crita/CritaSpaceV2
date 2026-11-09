import { Router } from "express";
import { firestore } from "../config/firebase";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await firestore.collection("users").limit(1).get();

    res.status(200).json({
      success: true,
      message: "CritaSpace API and Firestore are connected",
      services: {
        api: "running",
        firestore: "connected",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Firestore connectivity check failed:", error);

    res.status(503).json({
      success: false,
      message: "API is running, but Firestore is unavailable",
      services: {
        api: "running",
        firestore: "disconnected",
      },
    });
  }
});

export default router;
