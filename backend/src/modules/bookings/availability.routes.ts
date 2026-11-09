import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { getBoardroomAvailabilityController } from "./availability.controller";

const router = Router();

router.use(authenticateUser);

router.get("/", getBoardroomAvailabilityController);

export default router;
