import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import {
  createBookingNegotiationController,
  getIncomingBookingNegotiationsController,
  acceptBookingNegotiationController,
  declineBookingNegotiationController,
} from "./booking-negotiation.controller";

const router = Router();

router.use(authenticateUser);

router.post("/", createBookingNegotiationController);
router.get("/incoming", getIncomingBookingNegotiationsController);
router.patch("/:negotiationId/accept", acceptBookingNegotiationController);
router.patch("/:negotiationId/decline", declineBookingNegotiationController);

export default router;
