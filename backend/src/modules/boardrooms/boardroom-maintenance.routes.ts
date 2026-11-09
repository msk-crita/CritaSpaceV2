import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import {
  createBoardroomBlockController,
  getBoardroomBlocksController,
  getBoardroomBlockByIdController,
  updateBoardroomBlockController,
  cancelBoardroomBlockController,
} from "./boardroom-maintenance.controller";

const router = Router();

// All maintenance operations require Global Admin access.
router.use(authenticateUser, authorizeRoles("global_admin"));

router.post("/", createBoardroomBlockController);
router.get("/boardroom/:boardroomId", getBoardroomBlocksController);
router.get("/:blockId", getBoardroomBlockByIdController);
router.patch("/:blockId", updateBoardroomBlockController);
router.patch("/:blockId/cancel", cancelBoardroomBlockController);

export default router;
