import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { getDashboardSummaryController } from "./dashboard.controller";

const router = Router();

router.use(authenticateUser);

router.get("/summary", getDashboardSummaryController);

export default router;
