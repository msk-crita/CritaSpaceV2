import { Router } from "express";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middleware/auth.middleware";
import {
  createBookingController,
  getBookingByIdController,
  getMyBookingsController,
  getBookingHistoryController,
  rescheduleBookingController,
  cancelBookingController,
} from "./booking.controller";

const router = Router();

router.use(authenticateUser);

router.post("/", createBookingController);

router.get("/:bookingId", getBookingByIdController);
router.get("/my", getMyBookingsController);
router.get("/:bookingId/history", getBookingHistoryController);
router.patch(
  "/:bookingId/reschedule",
  authorizeRoles("global_admin"),
  rescheduleBookingController,
);
router.patch("/:bookingId/cancel", cancelBookingController);

export default router;
