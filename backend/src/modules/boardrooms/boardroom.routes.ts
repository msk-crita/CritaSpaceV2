import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import {
  createBoardroomController,
  getAllBoardroomsController,
  getBoardroomByIdController,
  updateBoardroomController,
} from "./boardroom.controller";

const router = Router();

// All boardroom management routes require Global Admin access.
router.use(authenticateUser, authorizeRoles("global_admin"));

router.post("/", createBoardroomController);
router.get("/", getAllBoardroomsController);
router.get("/:boardroomId", getBoardroomByIdController);
router.patch("/:boardroomId", updateBoardroomController);

export default router;
