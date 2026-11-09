import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import {
  createRecurringBookingController,
  getRecurringBookingOccurrencesController,
  getRecurringBookingsController,
} from "./recurring-booking.controller";

const router = Router();

router.use(authenticateUser);

router.post("/", createRecurringBookingController);
router.get(
  "/:recurringBookingId/occurrences",
  getRecurringBookingOccurrencesController,
);
router.get("/", getRecurringBookingsController);

export default router;
