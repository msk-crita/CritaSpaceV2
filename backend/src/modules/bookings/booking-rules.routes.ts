import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import {
  getBookingRulesController,
  updateBookingRulesController,
} from "./booking-rules.controller";

const router = Router();

router.use(authenticateUser, authorizeRoles("global_admin"));

router.get("/", getBookingRulesController);
router.put("/", updateBookingRulesController);

export default router;
