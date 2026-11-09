import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { getCurrentUser } from "./auth.controller";

const router = Router();

router.get("/me", authenticateUser, getCurrentUser);

export default router;
